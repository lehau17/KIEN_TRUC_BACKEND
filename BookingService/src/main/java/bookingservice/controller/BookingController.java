package bookingservice.controller;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.service.BookingService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponse createBooking(@RequestBody BookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{id}/confirm")
    public void confirmBooking(@PathVariable String id) {
        bookingService.confirmBooking(id);
    }

    @PutMapping("/{id}/cancel")
    public void cancelBooking(@PathVariable String id) {
        bookingService.cancelBooking(id);
    }

    @PutMapping("/{id}/checkin")
    public void checkInBooking(@PathVariable String id) {
        bookingService.checkInBooking(id);
    }

    @PutMapping("/{id}/checkout")
    public void checkOutBooking(@PathVariable String id) {
        bookingService.checkOutBooking(id);
    }
}