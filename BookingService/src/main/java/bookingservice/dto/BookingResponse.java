package bookingservice.dto;

import bookingservice.enums.BookingStatus;

import java.time.LocalDate;

public class BookingResponse {
    private String id;
    private String userId;
    private String roomId;
    private LocalDate checkInAt;
    private LocalDate checkOutAt;
    private BookingStatus status;

    public BookingResponse(String id, String userId, String roomId, LocalDate checkInAt, LocalDate checkOutAt, BookingStatus status) {
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

    public String getUserId() {
        return userId;
    }

    public String getRoomId() {
        return roomId;
    }

    public LocalDate getCheckInAt() {
        return checkInAt;
    }

    public LocalDate getCheckOutAt() {
        return checkOutAt;
    }

    public BookingStatus getStatus() {
        return status;
    }
}