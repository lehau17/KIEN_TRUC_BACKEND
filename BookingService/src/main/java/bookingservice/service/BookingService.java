package bookingservice.service;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);

    List<BookingResponse> getAllBookings();

    void confirmBooking(Long id);

    void cancelBooking(Long id);
}
