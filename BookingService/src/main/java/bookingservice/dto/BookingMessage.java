package bookingservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.time.LocalDateTime;

public class BookingMessage implements Serializable {
    @JsonProperty("bookingId")
    private String bookingId;

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("roomId")
    private String roomId;

    @JsonProperty("checkInAt")
    private LocalDateTime checkInAt;

    @JsonProperty("checkOutAt")
    private LocalDateTime checkOutAt;

    @JsonProperty("status")
    private String status;

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BookingMessage(String bookingId, String userId, String roomId, LocalDateTime checkInAt, LocalDateTime checkOutAt, String status) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
        this.status = status;
    }

    @Override
    public String toString() {
        return "BookingMessage{" +
                "bookingId='" + bookingId + '\'' +
                ", userId='" + userId + '\'' +
                ", roomId='" + roomId + '\'' +
                ", checkInAt=" + checkInAt +
                ", checkOutAt=" + checkOutAt +
                ", status='" + status + '\'' +
                '}';
    }
}
