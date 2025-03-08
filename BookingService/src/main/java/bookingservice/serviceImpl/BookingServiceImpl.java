package bookingservice.serviceImpl;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.entity.Booking;
import bookingservice.entity.BookingStatus;
import bookingservice.repository.BookingRepository;
import bookingservice.service.BookingService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        Booking booking = new Booking(request.getUserId(), request.getRoomId(), request.getCheckInAt(), request.getCheckOutAt());
        bookingRepository.save(booking);
        return new BookingResponse(
                booking.getId(), booking.getUserId(), booking.getRoomId(),
                booking.getCheckInAt(), booking.getCheckOutAt(), booking.getStatus());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELED)
                .map(b -> new BookingResponse(
                        b.getId(), b.getUserId(), b.getRoomId(),
                        b.getCheckInAt(), b.getCheckOutAt(), b.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public void confirmBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    @Override
    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.CANCELED);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }
}
