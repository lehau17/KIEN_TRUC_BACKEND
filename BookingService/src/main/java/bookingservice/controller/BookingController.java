package bookingservice.controller;

import java.nio.charset.StandardCharsets;
import bookingservice.dto.BookingRequest;
import bookingservice.dto.BookingResponse;
import bookingservice.dto.RoomDTO;
import bookingservice.entity.ApiResponse;
import bookingservice.entity.Booking;
import bookingservice.enums.BookingStatus;
import bookingservice.service.BookingService;
import bookingservice.service.RoomServiceClient;
import bookingservice.util.JwtUtil;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;
    private final RoomServiceClient roomServiceClient;
    private final JwtUtil jwtUtil;

    public BookingController(BookingService bookingService, RoomServiceClient roomServiceClient, JwtUtil jwtUtil) {
        this.bookingService = bookingService;
        this.roomServiceClient = roomServiceClient;
        this.jwtUtil = jwtUtil;
    }

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            BindingResult result,
            @AuthenticationPrincipal UserDetails userDetails) {

        logger.info("Nhận yêu cầu tạo booking với phương thức thanh toán: {}", request.getPaymentMethod());

        if (userDetails == null || !org.springframework.util.StringUtils.hasText(userDetails.getUsername())) {
            logger.warn("UserDetails null hoặc rỗng - chưa xác thực");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>("Chưa xác thực", false, null));
        }
        String userId = userDetails.getUsername();
        logger.info("User đã xác thực: {}", userId);

        if (result.hasErrors()) {
            String errorMessage = result.getAllErrors().stream()
                    .map(ObjectError::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            logger.warn("Lỗi validate: {}", errorMessage);
            return ResponseEntity.badRequest().body(new ApiResponse<>(errorMessage, false, null));
        }

        try {
            BookingResponse response = bookingService.createBooking(userId, request);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Tạo booking thành công. Đang chờ thanh toán bằng " + request.getPaymentMethod(), true, response));
        } catch (IllegalArgumentException e) {
            logger.warn("Yêu cầu booking không hợp lệ: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>("Lỗi: " + e.getMessage(), false, null));
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi tạo booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>("Lỗi không mong muốn: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        try {
            List<BookingResponse> bookings = bookingService.getAllBookings();
            logger.info("Fetched {} bookings", bookings.size());
            return ResponseEntity.ok(new ApiResponse<>("Fetched all bookings", true, bookings));
        } catch (Exception e) {
            logger.error("Error fetching bookings: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingPagedLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookingsPaged(Pageable pageable) {
        try {
            Page<BookingResponse> paged = bookingService.getAllBookingsPaged(pageable);
            logger.info("Fetched paged bookings, page {}, size {}", pageable.getPageNumber(), pageable.getPageSize());
            return ResponseEntity.ok(new ApiResponse<>("Fetched paged bookings", true, paged));
        } catch (Exception e) {
            logger.error("Error fetching paged bookings: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingConfirmLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<String>> confirmBooking(@PathVariable String id) {
        try {
            boolean success = bookingService.confirmBooking(id);
            if (success) {
                logger.info("Booking {} confirmed", id);
                return ResponseEntity.ok(new ApiResponse<>("Booking confirmed successfully", true, null));
            } else {
                logger.warn("Booking {} is not in PENDING_PAYMENT status", id);
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>("Booking is not in PENDING_PAYMENT status", false, null));
            }
        } catch (Exception e) {
            logger.error("Error confirming booking {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingCancelLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelBooking(@PathVariable String id) {
        try {
            boolean success = bookingService.cancelBooking(id);
            if (success) {
                logger.info("Booking {} canceled", id);
                return ResponseEntity.ok(new ApiResponse<>("Booking canceled successfully", true, null));
            } else {
                logger.warn("Cannot cancel booking {}. Must be in PENDING_PAYMENT", id);
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>("Cannot cancel booking. Must be in PENDING_PAYMENT", false, null));
            }
        } catch (Exception e) {
            logger.error("Error canceling booking {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingCheckinLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<String>> checkInBooking(@PathVariable String id) {
        try {
            boolean success = bookingService.checkInBooking(id);
            if (success) {
                logger.info("Booking {} checked in", id);
                return ResponseEntity.ok(new ApiResponse<>("Checked in successfully", true, null));
            } else {
                logger.warn("Cannot check in booking {}. Must be CONFIRMED", id);
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>("Cannot check in. Must be CONFIRMED", false, null));
            }
        } catch (Exception e) {
            logger.error("Error checking in booking {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingCheckoutLimiter", fallbackMethod = "tooManyRequests")
    @PutMapping("/{id}/checkout")
    public ResponseEntity<ApiResponse<String>> checkOutBooking(@PathVariable String id) {
        try {
            boolean success = bookingService.checkOutBooking(id);
            if (success) {
                logger.info("Booking {} checked out", id);
                return ResponseEntity.ok(new ApiResponse<>("Checked out successfully", true, null));
            } else {
                logger.warn("Cannot check out booking {}. Must be CHECKED_IN", id);
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>("Cannot check out. Must be CHECKED_IN", false, null));
            }
        } catch (Exception e) {
            logger.error("Error checking out booking {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingByDateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/by-date")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByDate(
            @RequestParam("date") LocalDate date,
            @RequestParam("type") String type) {
        try {
            List<BookingResponse> bookings = bookingService.getBookingsByDate(date, type);
            logger.info("Fetched {} bookings for date {} and type {}", bookings.size(), date, type);
            return ResponseEntity.ok(new ApiResponse<>("Bookings fetched by date", true, bookings));
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid date or type: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>("Error: " + e.getMessage(), false, null));
        } catch (Exception e) {
            logger.error("Error fetching bookings by date: {}", e.getMessage());
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
            logger.info("Room {} availability checked: {}", roomId, message);
            return ResponseEntity.ok(new ApiResponse<>("Availability checked", true, message));
        } catch (Exception e) {
            logger.error("Error checking room availability: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    // Redis-related endpoints
    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @PostMapping("/redis")
    public ResponseEntity<ApiResponse<String>> saveBookingToRedis(@RequestBody Booking booking) {
        try {
            boolean result = bookingService.saveBookingToRedis(booking);
            if (result) {
                logger.info("Booking {} saved to Redis", booking.getId());
                return ResponseEntity.ok(new ApiResponse<>("Đã lưu Booking vào Redis thành công.", true, null));
            } else {
                logger.warn("Failed to save booking {} to Redis", booking.getId());
                return ResponseEntity.status(500).body(new ApiResponse<>("Lưu Booking vào Redis thất bại.", false, null));
            }
        } catch (Exception e) {
            logger.error("Error saving booking {} to Redis: {}", booking.getId(), e.getMessage());
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/redis/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingFromRedis(@PathVariable String id) {
        try {
            Booking booking = bookingService.getBookingFromRedis(id);
            if (booking != null) {
                logger.info("Booking {} retrieved from Redis", id);
                return ResponseEntity.ok(new ApiResponse<>("Lấy Booking từ Redis thành công.", true, booking));
            } else {
                logger.warn("Booking {} not found in Redis", id);
                return ResponseEntity.status(404)
                        .body(new ApiResponse<>("Không tìm thấy Booking trong Redis.", false, null));
            }
        } catch (Exception e) {
            logger.error("Error retrieving booking {} from Redis: {}", id, e.getMessage());
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @DeleteMapping("/redis/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBookingFromRedis(@PathVariable String id) {
        logger.info("Attempting to delete booking with id {} from Redis", id);
        try {
            boolean result = bookingService.deleteBookingFromRedis(id);
            if (result) {
                logger.info("Successfully deleted booking with id {} from Redis", id);
                return ResponseEntity.ok(new ApiResponse<>("Đã xóa Booking khỏi Redis thành công.", true, null));
            } else {
                logger.warn("Booking with id {} not found in Redis", id);
                return ResponseEntity.status(404)
                        .body(new ApiResponse<>("Không tìm thấy Booking để xóa.", false, null));
            }
        } catch (Exception e) {
            logger.error("Error deleting booking with id {} from Redis: {}", id, e.getMessage());
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>("Lỗi khi xóa Booking khỏi Redis: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingAvailabilityLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/available-rooms")
    public ResponseEntity<ApiResponse<List<RoomDTO>>> getAvailableRooms(
            @RequestParam("checkInAt") LocalDate checkInAt,
            @RequestParam("checkOutAt") LocalDate checkOutAt) {
        try {
            // Lấy tất cả phòng, bao gồm cả đã booked và available
            List<RoomDTO> allRooms = roomServiceClient.getRoomsByStatus("available")
                    .concatWith(roomServiceClient.getRoomsByStatus("booked"))
                    .distinct(RoomDTO::getId) // loại bỏ trùng phòng
                    .collectList()
                    .block();

            if (allRooms == null) {
                logger.warn("Không thể lấy danh sách phòng từ RoomService");
                return ResponseEntity.badRequest().body(new ApiResponse<>("Không thể lấy danh sách phòng", false, null));
            }
            // Lọc ra phòng chưa bị đặt trong khoảng thời gian yêu cầu
            List<RoomDTO> availableRooms = allRooms.stream()
                    .filter(room -> !bookingService.isRoomBooked(room.getId(), checkInAt, checkOutAt))
                    .collect(Collectors.toList());

            logger.info("Found {} available rooms from {} to {}", availableRooms.size(), checkInAt, checkOutAt);
            return ResponseEntity.ok(new ApiResponse<>("Available rooms fetched", true, availableRooms));

        } catch (Exception e) {
            logger.error("Error fetching available rooms: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }


    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByUserId(@PathVariable String userId) {
        try {
            List<BookingResponse> bookings = bookingService.getAllBookings().stream()
                    .filter(b -> b.getUserId().equals(userId))
                    .collect(Collectors.toList());
            logger.info("Fetched {} bookings for user {}", bookings.size(), userId);
            return ResponseEntity.ok(new ApiResponse<>("User booking history fetched", true, bookings));
        } catch (Exception e) {
            logger.error("Error fetching bookings for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable String id) {
        try {
            BookingResponse booking = bookingService.getAllBookings().stream()
                    .filter(b -> b.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Booking không tồn tại"));
            logger.info("Fetched booking details for id {}", id);
            return ResponseEntity.ok(new ApiResponse<>("Booking details fetched", true, booking));
        } catch (IllegalArgumentException e) {
            logger.warn("Booking {} not found: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>("Error: " + e.getMessage(), false, null));
        } catch (Exception e) {
            logger.error("Error fetching booking {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByStatus(
            @PathVariable String status) {
        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            List<BookingResponse> bookings = bookingService.getAllBookings().stream()
                    .filter(b -> b.getStatus() == bookingStatus)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>("Bookings by status fetched", true, bookings));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("Invalid status", false, null));
        }
    }


    @GetMapping("/room-statuses")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getRoomStatusesByDate(@RequestParam("date") LocalDate date) {
        try {
            // Lấy tất cả phòng: bao gồm cả 'available' lẫn 'booked'
            List<RoomDTO> allRooms = roomServiceClient.getRoomsByStatus("available")
                    .concatWith(roomServiceClient.getRoomsByStatus("booked"))
                    .distinct(RoomDTO::getId)
                    .collectList()
                    .block();

            Map<String, List<String>> result = new HashMap<>();
            result.put("available", new ArrayList<>());
            result.put("waitingCheckin", new ArrayList<>());
            result.put("checkedIn", new ArrayList<>());

            for (RoomDTO room : allRooms) {
                String roomId = room.getId();

                List<BookingResponse> bookings = bookingService.getAllBookings().stream()
                        .filter(b -> b.getRoomId().equals(roomId)
                                && (b.getCheckInAt().equals(date)
                                || (b.getCheckInAt().isBefore(date) && b.getCheckOutAt().isAfter(date))))
                        .collect(Collectors.toList());

                boolean hasCheckedIn = bookings.stream()
                        .anyMatch(b -> b.getStatus() == BookingStatus.CHECKED_IN);

                boolean hasConfirmed = bookings.stream()
                        .anyMatch(b -> b.getStatus() == BookingStatus.CONFIRMED);

                if (hasCheckedIn) {
                    result.get("checkedIn").add(roomId);
                } else if (hasConfirmed) {
                    result.get("waitingCheckin").add(roomId);
                } else {
                    result.get("available").add(roomId);
                }
            }

            return ResponseEntity.ok(new ApiResponse<>("Room statuses fetched", true, result));
        } catch (Exception e) {
            logger.error("Error fetching room statuses: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }

    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/user/{userId}/waiting-checkin")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUserBookingsWaitingCheckin(@PathVariable String userId) {
        try {
            List<BookingResponse> bookings = bookingService.getAllBookings().stream()
                    .filter(b -> b.getUserId().equals(userId) && b.getStatus() == BookingStatus.CONFIRMED)
                    .collect(Collectors.toList());
            logger.info("Fetched {} confirmed bookings for user {}", bookings.size(), userId);
            return ResponseEntity.ok(new ApiResponse<>("User bookings waiting check-in fetched", true, bookings));
        } catch (Exception e) {
            logger.error("Error fetching waiting check-in bookings for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }
    @RateLimiter(name = "bookingRateLimiter", fallbackMethod = "tooManyRequests")
    @GetMapping("/room/{roomId}/waiting-checkin")
    public ResponseEntity<ApiResponse<BookingResponse>> getWaitingCheckinBooking(
            @PathVariable String roomId,
            @RequestParam("date") LocalDate date) {
        try {
            BookingResponse booking = bookingService.getAllBookings().stream()
                    .filter(b -> b.getRoomId().equals(roomId)
                            && b.getStatus() == BookingStatus.CONFIRMED
                            && b.getCheckInAt().equals(date))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Không có đơn CONFIRMED nào cho phòng này trong ngày."));
            return ResponseEntity.ok(new ApiResponse<>("Booking waiting checkin fetched", true, booking));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("Error: " + e.getMessage(), false, null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), false, null));
        }
    }



    // RateLimiter fallback
    public ResponseEntity<ApiResponse<String>> tooManyRequests(Throwable t) {
        logger.warn("Too many requests: {}", t.getMessage());
        return ResponseEntity.status(429)
                .body(new ApiResponse<>("Too many requests - Please try again later.", false, null));
    }

    private String extractUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor("sndkjbvfskdvfhjsvdfjhvsdjfhvsdkjfhvsjdhfvskdhvfkjshvdfhjk".getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token.replace("Bearer ", ""))
                    .getBody();
            return claims.get("id").toString();
        } catch (Exception e) {
            logger.error("Failed to extract userId from token: {}", e.getMessage());
            throw new IllegalArgumentException("Token không hợp lệ");
        }
    }

}