package bookingservice.dto;

import java.time.LocalDateTime;

public class BookingRequest {
    private String userId;
    private String roomId;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;

    public BookingRequest() {}

    public BookingRequest(String userId, String roomId, LocalDateTime checkInAt, LocalDateTime checkOutAt) {
        this.userId = userId;
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
    }

    public String getUserId() {
        return userId;
    }

    public String getRoomId() {
        return roomId;
    }

    public LocalDateTime getCheckInAt() {
        return checkInAt;
    }

    public LocalDateTime getCheckOutAt() {
        return checkOutAt;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public void setCheckInAt(LocalDateTime checkInAt) {
        this.checkInAt = checkInAt;
    }

    public void setCheckOutAt(LocalDateTime checkOutAt) {
        this.checkOutAt = checkOutAt;
    }
}
