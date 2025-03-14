package bookingservice.service;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);

    List<BookingResponse> getAllBookings(); // Giữ nguyên

    Page<BookingResponse> getAllBookingsPaged(Pageable pageable); // Phương thức mới

    boolean confirmBooking(String id);

    boolean cancelBooking(String id);

    boolean checkInBooking(String id);

    boolean checkOutBooking(String id);
}
