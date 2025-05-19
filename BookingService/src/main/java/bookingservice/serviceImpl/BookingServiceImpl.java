package bookingservice.serviceImpl;

import bookingservice.dto.BookingMessage;
import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.entity.Booking;
import bookingservice.enums.BookingStatus;
import bookingservice.repository.BookingRepository;
import bookingservice.service.BookingService;
import bookingservice.service.RabbitMQProducer;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    @Autowired
    private ObjectMapper objectMapper;
    private final BookingRepository bookingRepository;
    private final RabbitMQProducer rabbitMQProducer;
    private final RedisTemplate<String, Object> redisTemplate;

    public BookingServiceImpl(BookingRepository bookingRepository, RabbitMQProducer rabbitMQProducer,
            RedisTemplate<String, Object> redisTemplate) {
        this.bookingRepository = bookingRepository;
        this.rabbitMQProducer = rabbitMQProducer;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        validateBookingRequest(request);

        if (isRoomBooked(request.getRoomId(), request.getCheckInAt(), request.getCheckOutAt())) {
            throw new IllegalArgumentException("Phòng đã được đặt trong khoảng thời gian này.");
        }

        Booking booking = new Booking(
                request.getUserId(),
                request.getRoomId(),
                request.getCheckInAt(),
                request.getCheckOutAt(),
                request.getPrice());
        bookingRepository.save(booking);

        boolean paymentSuccess = processPayment(booking.getId(), request.getPrice(), "CREDIT_CARD");
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
        List<BookingResponse> cachedBookings = (List<BookingResponse>) redisTemplate.opsForValue().get(cacheKey);
        if (cachedBookings != null) {
            return cachedBookings;
        }

        List<BookingResponse> bookings = bookingRepository.findAll().stream()
                .map(b -> new BookingResponse(
                        b.getId(), b.getUserId(), b.getRoomId(),
                        b.getCheckInAt(), b.getCheckOutAt(), b.getStatus(), b.getPrice()))
                .collect(Collectors.toList());
        redisTemplate.opsForValue().set(cacheKey, bookings, 10, TimeUnit.MINUTES);

        return bookings;
    }

    @Override
    public Page<BookingResponse> getAllBookingsPaged(Pageable pageable) {
        Page<Booking> bookingPage = bookingRepository.findAll(pageable);
        return new PageImpl<>(
                bookingPage.getContent().stream()
                        .map(b -> new BookingResponse(
                                b.getId(), b.getUserId(), b.getRoomId(),
                                b.getCheckInAt(), b.getCheckOutAt(), b.getStatus(), b.getPrice()))
                        .collect(Collectors.toList()),
                pageable,
                bookingPage.getTotalElements());
    }

    @Override
    public boolean confirmBooking(String id) {
        boolean result = updateAndSendMessage(id, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, "CONFIRM");
        if (result)
            redisTemplate.delete("bookings:all");
        return result;
    }

    @Override
    public boolean cancelBooking(String id) {
        boolean result = updateAndSendMessage(id, BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELED, "CANCEL");
        if (result)
            redisTemplate.delete("bookings:all");
        return result;
    }

    @Override
    public boolean checkInBooking(String id) {
        boolean result = updateAndSendMessage(id, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, "CHECKIN");
        if (result)
            redisTemplate.delete("bookings:all");
        return result;
    }

    @Override
    public boolean checkOutBooking(String id) {
        boolean result = updateAndSendMessage(id, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT, "CHECKOUT");
        if (result)
            redisTemplate.delete("bookings:all");
        return result;
    }

    private boolean updateAndSendMessage(String id, BookingStatus requiredStatus, BookingStatus newStatus,
            String action) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty())
            throw new RuntimeException("Booking không tồn tại");

        Booking booking = bookingOpt.get();
        if (booking.getStatus() != requiredStatus)
            return false;

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
        if (cachedBookings != null)
            return cachedBookings;

        List<Booking> bookings = ("checkin".equalsIgnoreCase(type)) ? bookingRepository.findByCheckInAt(date)
                : bookingRepository.findByCheckOutAt(date);

        List<BookingResponse> bookingResponses = bookings.stream()
                .map(b -> new BookingResponse(
                        b.getId(), b.getUserId(), b.getRoomId(),
                        b.getCheckInAt(), b.getCheckOutAt(), b.getStatus(), b.getPrice()))
                .collect(Collectors.toList());

        redisTemplate.opsForValue().set(cacheKey, bookingResponses, 10, TimeUnit.MINUTES);
        return bookingResponses;
    }

    @Override
    public boolean isRoomBooked(String roomId, LocalDate checkInAt, LocalDate checkOutAt) {
        String cacheKey = "room:booked:" + roomId + ":" + checkInAt + ":" + checkOutAt;
        Boolean cachedResult = (Boolean) redisTemplate.opsForValue().get(cacheKey);
        if (cachedResult != null)
            return cachedResult;

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                roomId, BookingStatus.CONFIRMED, checkInAt, checkOutAt);
        boolean isBooked = !overlappingBookings.isEmpty();

        redisTemplate.opsForValue().set(cacheKey, isBooked, 5, TimeUnit.MINUTES);
        return isBooked;
    }

    private boolean processPayment(String bookingId, Double amount, String paymentMethod) {
        System.out.println("Processing payment for booking " + bookingId + " with amount " + amount);
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
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new IllegalArgumentException("Giá phòng phải lớn hơn 0");
        }
    }

    @Override
    public boolean saveBookingToRedis(Booking booking) {
        try {
            String key = "booking:" + booking.getId();
            redisTemplate.opsForValue().set(key, booking, 30, TimeUnit.MINUTES);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public Booking getBookingFromRedis(String id) {
        try {
            String key = "booking:" + id;
            Object cachedObject = redisTemplate.opsForValue().get(key);
            return (cachedObject != null) ? objectMapper.convertValue(cachedObject, Booking.class) : null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public boolean deleteBookingFromRedis(String id) {
        try {
            String key = "booking:" + id;
            Boolean deleted = redisTemplate.delete(key);
            return Boolean.TRUE.equals(deleted);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}