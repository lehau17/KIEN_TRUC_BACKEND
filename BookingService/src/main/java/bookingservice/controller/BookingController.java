package bookingservice.controller;

import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
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
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request, BindingResult result) {
        if (result.hasErrors()) {
            String errorMessage = result.getAllErrors().stream()
                    .map(ObjectError::getDefaultMessage)
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

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @RateLimiter(name = "bookingPagedLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/paged")
    public ResponseEntity<Page<BookingResponse>> getAllBookingsPaged(Pageable pageable) {
        return ResponseEntity.ok(bookingService.getAllBookingsPaged(pageable));
    }

    @RateLimiter(name = "bookingConfirmLimiter", fallbackMethod = "tooManyRequests")
    @PostMapping("/confirm/{id}")
    public ResponseEntity<?> confirmBooking(@PathVariable String id) {
        boolean result = bookingService.confirmBooking(id);
        if (result) {
            return ResponseEntity.ok("Booking đã xác nhận và gửi message CONFIRM");
        } else {
            return ResponseEntity.badRequest().body("Booking không ở trạng thái chờ thanh toán (PENDING_PAYMENT)");
        }
    }

    @RateLimiter(name = "bookingCancelLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable String id) {
        return bookingService.cancelBooking(id)
                ? ResponseEntity.ok("Booking canceled successfully.")
                : ResponseEntity.badRequest().body("Cannot cancel booking. Current status is not PENDING_PAYMENT.");
    }

    @RateLimiter(name = "bookingCheckinLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/checkin")
    public ResponseEntity<String> checkInBooking(@PathVariable String id) {
        boolean result = bookingService.checkInBooking(id);
        return result
                ? ResponseEntity.ok("Checked in successfully.")
                : ResponseEntity.badRequest().body("Cannot check in. Booking must be CONFIRMED.");
    }


    @RateLimiter(name = "bookingCheckoutLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/checkout")
    public ResponseEntity<String> checkOutBooking(@PathVariable String id) {
        return bookingService.checkOutBooking(id)
                ? ResponseEntity.ok("Checked out successfully.")
                : ResponseEntity.badRequest().body("Cannot check out. Booking must be CHECKED_IN.");
    }

    @RateLimiter(name = "bookingByDateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/by-date")
    public ResponseEntity<?> getBookingsByDate(@RequestParam("date") LocalDate date, @RequestParam("type") String type) {
        try {
            List<BookingResponse> bookings = bookingService.getBookingsByDate(date, type);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Unexpected error: " + e.getMessage());
        }
    }

    @RateLimiter(name = "bookingAvailabilityLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkRoomAvailability(
            @RequestParam("roomId") String roomId,
            @RequestParam("checkInAt") LocalDate checkInAt,
            @RequestParam("checkOutAt") LocalDate checkOutAt) {
        try {
            boolean isBooked = bookingService.isRoomBooked(roomId, checkInAt, checkOutAt);
            return ResponseEntity.ok(isBooked ? "Phòng đã được đặt." : "Phòng còn trống.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/redis")
    public ResponseEntity<String> saveBookingToRedis(@RequestBody Booking booking) {
        boolean result = bookingService.saveBookingToRedis(booking);
        return result
                ? ResponseEntity.ok("Đã lưu Booking vào Redis thành công.")
                : ResponseEntity.status(500).body("Lưu Booking vào Redis thất bại.");
    }

    @GetMapping("/redis/{id}")
    public ResponseEntity<?> getBookingFromRedis(@PathVariable String id) {
        Booking booking = bookingService.getBookingFromRedis(id);
        return booking != null
                ? ResponseEntity.ok(booking)
                : ResponseEntity.status(404).body("Không tìm thấy Booking trong Redis.");
    }

    @DeleteMapping("/redis/{id}")
    public ResponseEntity<String> deleteBookingFromRedis(@PathVariable String id) {
        boolean result = bookingService.deleteBookingFromRedis(id);
        return result
                ? ResponseEntity.ok("Đã xóa Booking khỏi Redis thành công.")
                : ResponseEntity.status(404).body("Không tìm thấy Booking để xóa.");
    }

    public ResponseEntity<String> tooManyRequests(Throwable t) {
        System.err.println("Rate limit triggered: " + t.getMessage());
        return ResponseEntity.status(429).body("Too many requests - Please try again later.");
    }
}