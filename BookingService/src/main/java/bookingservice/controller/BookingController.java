package bookingservice.controller;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request, BindingResult result) {
        if (result.hasErrors()) {
            String errorMessage = result.getAllErrors().stream()
                    .map(error -> error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body("Validation errors: " + errorMessage);
        }
        try {
            BookingResponse response = bookingService.createBooking(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error creating booking: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<BookingResponse>> getAllBookingsPaged(Pageable pageable) {
        return ResponseEntity.ok(bookingService.getAllBookingsPaged(pageable));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<String> confirmBooking(@PathVariable String id) {
        return bookingService.confirmBooking(id)
                ? ResponseEntity.ok("Booking confirmed successfully.")
                : ResponseEntity.badRequest().body("Cannot confirm booking. Current status is not PENDING_PAYMENT.");
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable String id) {
        return bookingService.cancelBooking(id)
                ? ResponseEntity.ok("Booking canceled successfully.")
                : ResponseEntity.badRequest().body("Cannot cancel booking. Current status is not PENDING_PAYMENT.");
    }

    @PutMapping("/{id}/checkin")
    public ResponseEntity<String> checkInBooking(@PathVariable String id) {
        return bookingService.checkInBooking(id)
                ? ResponseEntity.ok("Checked in successfully.")
                : ResponseEntity.badRequest().body("Cannot check in. Booking must be CONFIRMED.");
    }

    @PutMapping("/{id}/checkout")
    public ResponseEntity<String> checkOutBooking(@PathVariable String id) {
        return bookingService.checkOutBooking(id)
                ? ResponseEntity.ok("Checked out successfully.")
                : ResponseEntity.badRequest().body("Cannot check out. Booking must be CHECKED_IN.");
    }

    @GetMapping("/by-date")
    public ResponseEntity<?> getBookingsByDate(
            @RequestParam("date") LocalDate date,
            @RequestParam("type") String type) {
        try {
            List<BookingResponse> bookings = bookingService.getBookingsByDate(date, type);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Unexpected error: " + e.getMessage());
        }
    }
}