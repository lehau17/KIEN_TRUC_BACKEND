package bookingservice.serviceImpl;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.entity.Booking;
import bookingservice.enums.BookingStatus;
import bookingservice.repository.BookingRepository;
import bookingservice.service.BookingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        Booking booking = new Booking(
                request.getUserId(),
                request.getRoomId(),
                request.getCheckInAt(),
                request.getCheckOutAt()
        );
        bookingRepository.save(booking);
        return new BookingResponse(
                booking.getId(),
                booking.getUserId(),
                booking.getRoomId(),
                booking.getCheckInAt(),
                booking.getCheckOutAt(),
                booking.getStatus()
        );
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
        return updateBookingStatus(id, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED);
    }

    @Override
    public boolean cancelBooking(String id) {
        return updateBookingStatus(id, BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELED);
    }

    @Override
    public boolean checkInBooking(String id) {
        return updateBookingStatus(id, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN);
    }

    @Override
    public boolean checkOutBooking(String id) {
        return updateBookingStatus(id, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT);
    }

    private boolean updateBookingStatus(String id, BookingStatus requiredStatus, BookingStatus newStatus) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);

        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();

        if (booking.getStatus() != requiredStatus) {
            return false;
        }

        booking.setStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        return true;
    }
}
