package bookingservice.serviceImpl;

import bookingservice.dto.BookingMessage;
import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.dto.RoomDTO;
import bookingservice.entity.Booking;
import bookingservice.enums.BookingStatus;
import bookingservice.repository.BookingRepository;
import bookingservice.service.BookingService;
import bookingservice.service.RabbitMQProducer;
import bookingservice.service.RoomServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Autowired
    private ObjectMapper objectMapper;
    private final BookingRepository bookingRepository;
    private final RabbitMQProducer rabbitMQProducer;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RoomServiceClient roomServiceClient;

    public BookingServiceImpl(BookingRepository bookingRepository, RabbitMQProducer rabbitMQProducer,
                              RedisTemplate<String, Object> redisTemplate, RoomServiceClient roomServiceClient) {
        this.bookingRepository = bookingRepository;
        this.rabbitMQProducer = rabbitMQProducer;
        this.redisTemplate = redisTemplate;
        this.roomServiceClient = roomServiceClient;
    }

    @Override
    public BookingResponse createBooking(String userId, BookingRequest request) {
        logger.info("Creating booking for user {} and room {}", userId, request.getRoomId());
        validateBookingRequest(request);

        // Kiểm tra phòng từ RoomService
        RoomDTO room = roomServiceClient.getRoomById(request.getRoomId())
                .blockOptional()
                .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại hoặc ID không hợp lệ"));

        if (!"available".equalsIgnoreCase(room.getStatus())) {
            throw new IllegalArgumentException("Phòng không khả dụng");
        }

        if (isRoomBooked(request.getRoomId(), request.getCheckInAt(), request.getCheckOutAt())) {
            throw new IllegalArgumentException("Phòng đã được đặt trong khoảng thời gian này.");
        }

        Booking booking = new Booking(
                userId, // 👈 lấy từ controller, không phải request
                request.getRoomId(),
                request.getCheckInAt(),
                request.getCheckOutAt(),
                room.getPrice());
        bookingRepository.save(booking);

        boolean paymentSuccess = processPayment(booking.getId(), room.getPrice(), "CREDIT_CARD");
        if (paymentSuccess) {
            booking.confirmBooking();
            bookingRepository.save(booking);

            BookingMessage message = new BookingMessage(
                    booking.getId(), booking.getUserId(), booking.getRoomId(),
                    booking.getPrice(), "CREDIT_CARD", booking.getStatus().name());
            rabbitMQProducer.sendMessage("CONFIRM", message);

            redisTemplate.delete("bookings:all");
            redisTemplate.opsForValue().set("booking:" + booking.getId(), booking, 30, TimeUnit.MINUTES);
        } else {
            throw new RuntimeException("Thanh toán thất bại");
        }

        logger.info("Booking created successfully with id {}", booking.getId());
        return new BookingResponse(
                booking.getId(),
                booking.getUserId(),
                booking.getRoomId(),
                booking.getCheckInAt(),
                booking.getCheckOutAt(),
                booking.getStatus(),
                booking.getPrice());
    }


    @Override
    public List<BookingResponse> getAllBookings() {
        String cacheKey = "bookings:all";
        Object cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached instanceof List<?>) {
            try {
                List<?> rawList = (List<?>) cached;
                List<BookingResponse> result = rawList.stream()
                        .map(item -> objectMapper.convertValue(item, BookingResponse.class))
                        .collect(Collectors.toList());
                logger.debug("Returning cached bookings (converted)");
                return result;
            } catch (Exception e) {
                logger.error("Error parsing cached bookings: {}", e.getMessage());
            }
        }

        List<BookingResponse> bookings = bookingRepository.findAll().stream()
                .map(b -> new BookingResponse(
                        b.getId(), b.getUserId(), b.getRoomId(),
                        b.getCheckInAt(), b.getCheckOutAt(), b.getStatus(), b.getPrice()))
                .collect(Collectors.toList());
        redisTemplate.opsForValue().set(cacheKey, bookings, 10, TimeUnit.MINUTES);

        logger.info("Fetched {} bookings from database", bookings.size());
        return bookings;
    }



    @Override
    public Page<BookingResponse> getAllBookingsPaged(Pageable pageable) {
        Page<Booking> bookingPage = bookingRepository.findAll(pageable);
        List<BookingResponse> responses = bookingPage.getContent().stream()
                .map(b -> new BookingResponse(
                        b.getId(), b.getUserId(), b.getRoomId(),
                        b.getCheckInAt(), b.getCheckOutAt(), b.getStatus(), b.getPrice()))
                .collect(Collectors.toList());

        logger.info("Fetched paged bookings, page {}, size {}", pageable.getPageNumber(), pageable.getPageSize());
        return new PageImpl<>(responses, pageable, bookingPage.getTotalElements());
    }

    @Override
    public boolean confirmBooking(String id) {
        boolean result = updateAndSendMessage(id, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, "CONFIRM");
        if (result) {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            bookingOpt.ifPresent(booking -> {
                try {
                    roomServiceClient.updateRoomStatus(booking.getRoomId(), "booked").block();
                } catch (Exception e) {
                    logger.error("Failed to update room status for roomId {} during confirmBooking: {}", booking.getRoomId(), e.getMessage());
                    throw new RuntimeException("Không thể cập nhật trạng thái phòng: " + e.getMessage());
                }
            });
            redisTemplate.delete("bookings:all");
            logger.info("Booking {} confirmed", id);
        }
        return result;
    }

    @Override
    public boolean cancelBooking(String id) {
        boolean result = updateAndSendMessage(id, BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELED, "CANCEL");
        if (result) {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            bookingOpt.ifPresent(booking -> {
                try {
                    roomServiceClient.updateRoomStatus(booking.getRoomId(), "available").block();
                } catch (Exception e) {
                    logger.error("Failed to update room status for roomId {} during cancelBooking: {}", booking.getRoomId(), e.getMessage());
                    throw new RuntimeException("Không thể cập nhật trạng thái phòng: " + e.getMessage());
                }
            });
            redisTemplate.delete("bookings:all");
            logger.info("Booking {} canceled", id);
        }
        return result;
    }

    @Override
    public boolean checkInBooking(String id) {
        boolean result = updateAndSendMessage(id, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, "CHECKIN");
        if (result) {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            bookingOpt.ifPresent(booking -> {
                try {
                    roomServiceClient.updateRoomStatus(booking.getRoomId(), "booked").block();
                } catch (Exception e) {
                    logger.error("Failed to update room status for roomId {} during checkInBooking: {}", booking.getRoomId(), e.getMessage());
                    throw new RuntimeException("Không thể cập nhật trạng thái phòng: " + e.getMessage());
                }
            });
            redisTemplate.delete("bookings:all");
            logger.info("Booking {} checked in", id);
        }
        return result;
    }


    @Override
    public boolean checkOutBooking(String id) {
        boolean result = updateAndSendMessage(id, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT, "CHECKOUT");
        if (result) {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            bookingOpt.ifPresent(booking -> {
                try {
                    roomServiceClient.updateRoomStatus(booking.getRoomId(), "available").block();
                    // Xóa redis để đặt lại phòng mới
                    String cacheKey = "room:booked:" + booking.getRoomId() + ":" +
                            booking.getCheckInAt() + ":" + booking.getCheckOutAt();
                    redisTemplate.delete(cacheKey);
                } catch (Exception e) {
                    logger.error("Failed to update room status for roomId {} during checkOutBooking: {}", booking.getRoomId(), e.getMessage());
                    throw new RuntimeException("Không thể cập nhật trạng thái phòng: " + e.getMessage());
                }
            });
            redisTemplate.delete("bookings:all");
            logger.info("Booking {} checked out", id);
        }
        return result;
    }

    private boolean updateAndSendMessage(String id, BookingStatus requiredStatus, BookingStatus newStatus,
                                         String action) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            logger.warn("Booking {} not found", id);
            throw new RuntimeException("Booking không tồn tại");
        }

        Booking booking = bookingOpt.get();
        if (booking.getStatus() != requiredStatus) {
            logger.warn("Booking {} is not in required status {}", id, requiredStatus);
            return false;
        }

        booking.setStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        BookingMessage message = new BookingMessage(
                booking.getId(), booking.getUserId(), booking.getRoomId(),
                booking.getPrice(), "CREDIT_CARD", booking.getStatus().name());
        rabbitMQProducer.sendMessage(action, message);

        redisTemplate.opsForValue().set("booking:" + booking.getId(), booking, 30, TimeUnit.MINUTES);
        return true;
    }

    @Override
    public List<BookingResponse> getBookingsByDate(LocalDate date, String type) {
        String cacheKey = "bookings:date:" + date + ":" + type;
        List<BookingResponse> cachedBookings = (List<BookingResponse>) redisTemplate.opsForValue().get(cacheKey);
        if (cachedBookings != null) {
            logger.debug("Returning cached bookings for date {} and type {}", date, type);
            return cachedBookings;
        }

        List<Booking> bookings = ("checkin".equalsIgnoreCase(type)) ? bookingRepository.findByCheckInAt(date)
                : bookingRepository.findByCheckOutAt(date);

        List<BookingResponse> bookingResponses = bookings.stream()
                .map(b -> new BookingResponse(
                        b.getId(), b.getUserId(), b.getRoomId(),
                        b.getCheckInAt(), b.getCheckOutAt(), b.getStatus(), b.getPrice()))
                .collect(Collectors.toList());

        redisTemplate.opsForValue().set(cacheKey, bookingResponses, 10, TimeUnit.MINUTES);
        logger.info("Fetched {} bookings for date {} and type {}", bookingResponses.size(), date, type);
        return bookingResponses;
    }

    @Override
    public boolean isRoomBooked(String roomId, LocalDate checkInAt, LocalDate checkOutAt) {
        String cacheKey = "room:booked:" + roomId + ":" + checkInAt + ":" + checkOutAt;
        Boolean cachedResult = (Boolean) redisTemplate.opsForValue().get(cacheKey);
        if (cachedResult != null) {
            logger.debug("Returning cached room booking status for room {}", roomId);
            return cachedResult;
        }

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                roomId, BookingStatus.CONFIRMED, checkInAt, checkOutAt);
        boolean isBooked = !overlappingBookings.isEmpty();

        redisTemplate.opsForValue().set(cacheKey, isBooked, 5, TimeUnit.MINUTES);
        logger.debug("Room {} is {} for period {} to {}", roomId, isBooked ? "booked" : "available", checkInAt, checkOutAt);
        return isBooked;
    }

    private boolean processPayment(String bookingId, Double amount, String paymentMethod) {
        logger.info("Processing payment for booking {} with amount {}", bookingId, amount);
        return true;
    }

    private void validateBookingRequest(BookingRequest request) {
        LocalDate now = LocalDate.now();
        if (request.getCheckInAt().isBefore(now)) {
            throw new IllegalArgumentException("Thời gian check-in không được trong quá khứ");
        }
        if (request.getCheckOutAt().isBefore(request.getCheckInAt()) ||
                request.getCheckOutAt().isEqual(request.getCheckInAt())) {
            throw new IllegalArgumentException("Thời gian check-out phải sau check-in");
        }
    }

    @Override
    public boolean saveBookingToRedis(Booking booking) {
        try {
            String key = "booking:" + booking.getId();
            logger.debug("Saving booking {} to Redis", booking.getId());
            redisTemplate.opsForValue().set(key, booking, 30, TimeUnit.MINUTES);
            logger.info("Successfully saved booking {} to Redis", booking.getId());
            return true;
        } catch (Exception e) {
            logger.error("Error saving booking {} to Redis: {}", booking.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public Booking getBookingFromRedis(String id) {
        try {
            String key = "booking:" + id;
            logger.debug("Retrieving booking {} from Redis", id);
            Object cachedObject = redisTemplate.opsForValue().get(key);
            if (cachedObject != null) {
                logger.info("Successfully retrieved booking {} from Redis", id);
                return objectMapper.convertValue(cachedObject, Booking.class);
            }
            logger.warn("Booking {} not found in Redis", id);
            return null;
        } catch (Exception e) {
            logger.error("Error retrieving booking {} from Redis: {}", id, e.getMessage());
            return null;
        }
    }

    @Override
    public boolean deleteBookingFromRedis(String id) {
        try {
            String key = "booking:" + id;
            logger.debug("Attempting to delete Redis key: {}", key);
            Boolean deleted = redisTemplate.delete(key);
            if (Boolean.TRUE.equals(deleted)) {
                logger.info("Successfully deleted Redis key: {}", key);
                return true;
            } else {
                logger.warn("Redis key {} does not exist", key);
                return false;
            }
        } catch (Exception e) {
            logger.error("Error deleting Redis key for booking {}: {}", id, e.getMessage());
            throw new RuntimeException("Lỗi khi xóa Booking khỏi Redis", e);
        }
    }
}