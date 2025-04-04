package bookingservice.serviceImpl;

import bookingservice.dto.BookingMessage;
import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.entity.Booking;
import bookingservice.enums.BookingStatus;
import bookingservice.repository.BookingRepository;
import bookingservice.service.BookingService;
import bookingservice.service.RabbitMQProducer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RabbitMQProducer rabbitMQProducer;

    public BookingServiceImpl(BookingRepository bookingRepository, RabbitMQProducer rabbitMQProducer) {
        this.bookingRepository = bookingRepository;
        this.rabbitMQProducer = rabbitMQProducer;
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
                request.getCheckOutAt()
        );
        bookingRepository.save(booking);

        BookingMessage message = new BookingMessage(
                booking.getId(), booking.getUserId(), booking.getRoomId(),
                null, null, booking.getStatus().name()
        );
        rabbitMQProducer.sendMessage("BOOKING", message);

        return new BookingResponse(
                booking.getId(),
                booking.getUserId(),
                booking.getRoomId(),
                booking.getCheckInAt(),
                booking.getCheckOutAt(),
                booking.getStatus()
        );
    }

    private void validateBookingRequest(BookingRequest request) {
        LocalDate now = LocalDate.now();
        if (request.getCheckInAt().isBefore(now)) {
            throw new IllegalArgumentException("Thời gian check-in không được trong quá khứ");
        }
        if (request.getCheckOutAt().isBefore(request.getCheckInAt()) || request.getCheckOutAt().isEqual(request.getCheckInAt())) {
            throw new IllegalArgumentException("Thời gian check-out phải sau check-in");
        }
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(b -> new BookingResponse(
                        b.getId(), b.getUserId(), b.getRoomId(),
                        b.getCheckInAt(), b.getCheckOutAt(), b.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public Page<BookingResponse> getAllBookingsPaged(Pageable pageable) {
        Page<Booking> bookingPage = bookingRepository.findAll(pageable);
        return new PageImpl<>(
                bookingPage.getContent().stream()
                        .map(b -> new BookingResponse(
                                b.getId(), b.getUserId(), b.getRoomId(),
                                b.getCheckInAt(), b.getCheckOutAt(), b.getStatus()))
                        .collect(Collectors.toList()),
                pageable,
                bookingPage.getTotalElements()
        );
    }

    @Override
    public boolean confirmBooking(String id) {
        return updateAndSendMessage(id, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, "CONFIRM");
    }

    @Override
    public boolean cancelBooking(String id) {
        return updateAndSendMessage(id, BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELED, "CANCEL");
    }

    @Override
    public boolean checkInBooking(String id) {
        return updateAndSendMessage(id, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, "CHECKIN");
    }

    @Override
    public boolean checkOutBooking(String id) {
        return updateAndSendMessage(id, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT, "CHECKOUT");
    }

    private boolean updateAndSendMessage(String id, BookingStatus requiredStatus, BookingStatus newStatus, String action) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);

        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking không tồn tại");
        }

        Booking booking = bookingOpt.get();

        if (booking.getStatus() != requiredStatus) {
            return false;
        }

        booking.setStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        BookingMessage message = new BookingMessage(
                booking.getId(), booking.getUserId(), booking.getRoomId(),
                null, null, booking.getStatus().name()
        );
        rabbitMQProducer.sendMessage(action, message);
        return true;
    }

    @Override
    public List<BookingResponse> getBookingsByDate(LocalDate date, String type) {
        List<Booking> bookings;
        if ("checkin".equalsIgnoreCase(type)) {
            bookings = bookingRepository.findByCheckInAt(date);
        } else if ("checkout".equalsIgnoreCase(type)) {
            bookings = bookingRepository.findByCheckOutAt(date);
        } else {
            throw new IllegalArgumentException("Type phải là 'checkin' hoặc 'checkout'");
        }

        return bookings.stream()
                .map(b -> new BookingResponse(
                        b.getId(), b.getUserId(), b.getRoomId(),
                        b.getCheckInAt(), b.getCheckOutAt(), b.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public boolean isRoomBooked(String roomId, LocalDate checkInAt, LocalDate checkOutAt) {
        List<Booking> confirmedBookings = bookingRepository.findByRoomIdAndStatusAndCheckInAt(
                roomId, BookingStatus.CONFIRMED, checkOutAt, checkInAt);
        return !confirmedBookings.isEmpty();
    }
}