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
    private Double price;

    public BookingResponse(String id, String userId, String roomId, LocalDate checkInAt, LocalDate checkOutAt, BookingStatus status, Double price) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
        this.status = status;
        this.price = price;
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

    public LocalDate getCheckInAt() {
        return checkInAt;
    }

    public void setCheckInAt(LocalDate checkInAt) {
        this.checkInAt = checkInAt;
    }

    public LocalDate getCheckOutAt() {
        return checkOutAt;
    }

    public void setCheckOutAt(LocalDate checkOutAt) {
        this.checkOutAt = checkOutAt;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}