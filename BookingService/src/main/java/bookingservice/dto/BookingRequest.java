package bookingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class BookingRequest {
    @NotBlank(message = "Room ID không được để trống")
    private String roomId;

    @NotNull(message = "Thời gian check-in không được để trống")
    private LocalDate checkInAt;

    @NotNull(message = "Thời gian check-out không được để trống")
    private LocalDate checkOutAt;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    public BookingRequest() {}

    public BookingRequest(String roomId, LocalDate checkInAt, LocalDate checkOutAt) {
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
    }

    public BookingRequest(String roomId, LocalDate checkInAt, LocalDate checkOutAt, String paymentMethod) {
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
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
}
