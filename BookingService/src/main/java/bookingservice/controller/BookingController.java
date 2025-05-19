package bookingservice.controller;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.entity.ApiResponse;
import bookingservice.entity.Booking;
import bookingservice.service.BookingService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request,
            BindingResult result) {
        if (result.hasErrors()) {
            String errorMessage = result.getAllErrors().stream()
                    .map(ObjectError::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(new ApiResponse<>(errorMessage, false, null));
        }

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

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(new ApiResponse<>("Fetched all bookings", true, bookings));
    }

    @RateLimiter(name = "bookingPagedLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookingsPaged(Pageable pageable) {
        Page<BookingResponse> paged = bookingService.getAllBookingsPaged(pageable);
        return ResponseEntity.ok(new ApiResponse<>("Fetched paged bookings", true, paged));
    }

    @RateLimiter(name = "bookingConfirmLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<String>> confirmBooking(@PathVariable String id) {
        boolean success = bookingService.confirmBooking(id);
        if (success) {
            return ResponseEntity.ok(new ApiResponse<>("Booking confirmed successfully", true, null));
        } else {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Booking is not in PENDING_PAYMENT status", false, null));
        }
    }

    @RateLimiter(name = "bookingCancelLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelBooking(@PathVariable String id) {
        boolean success = bookingService.cancelBooking(id);
        if (success) {
            return ResponseEntity.ok(new ApiResponse<>("Booking canceled successfully", true, null));
        } else {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Cannot cancel booking. Must be in PENDING_PAYMENT", false, null));
        }
    }

    @RateLimiter(name = "bookingCheckinLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<String>> checkInBooking(@PathVariable String id) {
        boolean success = bookingService.checkInBooking(id);
        return success
                ? ResponseEntity.ok(new ApiResponse<>("Checked in successfully", true, null))
                : ResponseEntity.badRequest()
                        .body(new ApiResponse<>("Cannot check in. Must be CONFIRMED", false, null));
    }

    @RateLimiter(name = "bookingCheckoutLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/checkout")
    public ResponseEntity<ApiResponse<String>> checkOutBooking(@PathVariable String id) {
        boolean success = bookingService.checkOutBooking(id);
        return success
                ? ResponseEntity.ok(new ApiResponse<>("Checked out successfully", true, null))
                : ResponseEntity.badRequest()
                        .body(new ApiResponse<>("Cannot check out. Must be CHECKED_IN", false, null));
    }

    @RateLimiter(name = "bookingByDateLimiter", fallbackMethod = "tooManyRequests")
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

    @RateLimiter(name = "bookingAvailabilityLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/check-availability")
    public ResponseEntity<ApiResponse<String>> checkRoomAvailability(
            @RequestParam("roomId") String roomId,
            @RequestParam("checkInAt") LocalDate checkInAt,
            @RequestParam("checkOutAt") LocalDate checkOutAt) {
        try {
            boolean isBooked = bookingService.isRoomBooked(roomId, checkInAt, checkOutAt);
            String message = isBooked ? "Phòng đã được đặt." : "Phòng còn trống.";
            return ResponseEntity.ok(new ApiResponse<>("Availability checked", true, message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    // Redis-related endpoints
    @PostMapping("/redis")
    public ResponseEntity<ApiResponse<String>> saveBookingToRedis(@RequestBody Booking booking) {
        boolean result = bookingService.saveBookingToRedis(booking);
        return result
                ? ResponseEntity.ok(new ApiResponse<>("Đã lưu Booking vào Redis thành công.", true, null))
                : ResponseEntity.status(500).body(new ApiResponse<>("Lưu Booking vào Redis thất bại.", false, null));
    }

    @GetMapping("/redis/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingFromRedis(@PathVariable String id) {
        Booking booking = bookingService.getBookingFromRedis(id);
        return booking != null
                ? ResponseEntity.ok(new ApiResponse<>("Lấy Booking từ Redis thành công.", true, booking))
                : ResponseEntity.status(404)
                        .body(new ApiResponse<>("Không tìm thấy Booking trong Redis.", false, null));
    }

    @DeleteMapping("/redis/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBookingFromRedis(@PathVariable String id) {
        boolean result = bookingService.deleteBookingFromRedis(id);
        return result
                ? ResponseEntity.ok(new ApiResponse<>("Đã xóa Booking khỏi Redis thành công.", true, null))
                : ResponseEntity.status(404).body(new ApiResponse<>("Không tìm thấy Booking để xóa.", false, null));
    }

    // RateLimiter fallback
    public ResponseEntity<ApiResponse<String>> tooManyRequests(Throwable t) {
        return ResponseEntity.status(429)
                .body(new ApiResponse<>("Too many requests - Please try again later.", false, null));
    }
}
