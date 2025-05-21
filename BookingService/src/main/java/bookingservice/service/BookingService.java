package bookingservice.service;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(String userId, BookingRequest request);

    List<BookingResponse> getAllBookings();

    Page<BookingResponse> getAllBookingsPaged(Pageable pageable);

    boolean confirmBooking(String id);

    boolean cancelBooking(String id);

    boolean checkInBooking(String id);

    boolean checkOutBooking(String id);

    List<BookingResponse> getBookingsByDate(LocalDate date, String type);

    boolean isRoomBooked(String roomId, LocalDate checkInAt, LocalDate checkOutAt);

    // Test Redis
    boolean saveBookingToRedis(Booking booking);

    Booking getBookingFromRedis(String id);

    boolean deleteBookingFromRedis(String id);
}