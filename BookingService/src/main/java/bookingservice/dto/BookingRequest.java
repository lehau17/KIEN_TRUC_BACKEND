package bookingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public class BookingRequest {
    @NotBlank(message = "User ID không được để trống")
    private String userId;

    @NotBlank(message = "Room ID không được để trống")
    private String roomId;

    @NotNull(message = "Thời gian check-in không được để trống")
    private LocalDate checkInAt;

    @NotNull(message = "Thời gian check-out không được để trống")
    private LocalDate checkOutAt;

    @NotNull(message = "Giá phòng không được để trống")
    @Positive(message = "Giá phòng phải lớn hơn 0")
    private Double price;

    public BookingRequest() {
    }

    public BookingRequest(String userId, String roomId, LocalDate checkInAt, LocalDate checkOutAt, Double price) {
        this.userId = userId;
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
        this.price = price;
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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}