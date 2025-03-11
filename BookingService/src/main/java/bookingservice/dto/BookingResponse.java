package bookingservice.dto;

import bookingservice.enums.BookingStatus;

import java.time.LocalDateTime;

public class BookingResponse {
    private String id;
    private String userId;
    private String roomId;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;
    private BookingStatus status;

    public BookingResponse() {}

    public BookingResponse(String id, String userId, String roomId, LocalDateTime checkInAt, LocalDateTime checkOutAt, BookingStatus status) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public LocalDateTime getCheckInAt() {
        return checkInAt;
    }

    public void setCheckInAt(LocalDateTime checkInAt) {
        this.checkInAt = checkInAt;
    }

    public LocalDateTime getCheckOutAt() {
        return checkOutAt;
    }

    public void setCheckOutAt(LocalDateTime checkOutAt) {
        this.checkOutAt = checkOutAt;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}
