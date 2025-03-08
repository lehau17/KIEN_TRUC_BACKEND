package bookingservice.dto;

import java.time.LocalDateTime;

public class BookingResponse {
    private Long id;
    private Long userId;
    private Long roomId;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;
    private Boolean isConfirmed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BookingResponse(Long id, Long userId, Long roomId, LocalDateTime checkInAt, LocalDateTime checkOutAt, Boolean isConfirmed, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
        this.isConfirmed = isConfirmed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public LocalDateTime getCheckInAt() {
        return checkInAt;
    }

    public LocalDateTime getCheckOutAt() {
        return checkOutAt;
    }

    public Boolean getConfirmed() {
        return isConfirmed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
