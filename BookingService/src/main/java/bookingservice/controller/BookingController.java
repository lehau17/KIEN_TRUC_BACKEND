package bookingservice.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.entity.ApiResponse;
import bookingservice.service.BookingService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request
    // BindingResult result
    ) {
        // if (result.hasErrors()) {
        // String errorMessage = result.getAllErrors().stream()
        // .map(error -> error.getDefaultMessage())
        // .collect(Collectors.joining(", "));
        // return ResponseEntity.badRequest().body(new ApiResponse<>(errorMessage,
        // false, null));
        // }
        try {
            BookingResponse response = bookingService.createBooking(request);
            return ResponseEntity.ok(new ApiResponse<>("Booking created successfully", true, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("Error: " + e.getMessage(), false, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        return ResponseEntity.ok(new ApiResponse<>("Fetched all bookings", true, bookingService.getAllBookings()));
    }

    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookingsPaged(Pageable pageable) {
        return ResponseEntity
                .ok(new ApiResponse<>("Fetched paged bookings", true, bookingService.getAllBookingsPaged(pageable)));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<String>> confirmBooking(@PathVariable String id) {
        if (bookingService.confirmBooking(id)) {
            return ResponseEntity.ok(new ApiResponse<>("Booking confirmed successfully", true, null));
        }
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>("Cannot confirm booking. Current status is not PENDING_PAYMENT.", false, null));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelBooking(@PathVariable String id) {
        if (bookingService.cancelBooking(id)) {
            return ResponseEntity.ok(new ApiResponse<>("Booking canceled successfully", true, null));
        }
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>("Cannot cancel booking. Current status is not PENDING_PAYMENT.", false, null));
    }

    @PutMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<String>> checkInBooking(@PathVariable String id) {
        if (bookingService.checkInBooking(id)) {
            return ResponseEntity.ok(new ApiResponse<>("Checked in successfully", true, null));
        }
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>("Cannot check in. Booking must be CONFIRMED.", false, null));
    }

    @PutMapping("/{id}/checkout")
    public ResponseEntity<ApiResponse<String>> checkOutBooking(@PathVariable String id) {
        if (bookingService.checkOutBooking(id)) {
            return ResponseEntity.ok(new ApiResponse<>("Checked out successfully", true, null));
        }
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>("Cannot check out. Booking must be CHECKED_IN.", false, null));
    }

    @GetMapping("/by-date")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByDate(
            @RequestParam("date") LocalDate date,
            @RequestParam("type") String type) {
        try {
            List<BookingResponse> bookings = bookingService.getBookingsByDate(date, type);
            return ResponseEntity.ok(new ApiResponse<>("Bookings fetched by date", true, bookings));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("Error: " + e.getMessage(), false, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @GetMapping("/check-availability")
    public ResponseEntity<ApiResponse<String>> checkRoomAvailability(
            @RequestParam("roomId") String roomId,
            @RequestParam("checkInAt") LocalDate checkInAt,
            @RequestParam("checkOutAt") LocalDate checkOutAt) {
        try {
            boolean isBooked = bookingService.isRoomBooked(roomId, checkInAt, checkOutAt);
            return ResponseEntity.ok(
                    new ApiResponse<>("Check completed", true, isBooked ? "Phòng đã được đặt." : "Phòng còn trống."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }
}
