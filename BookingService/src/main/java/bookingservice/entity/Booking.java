package bookingservice.entity;

import bookingservice.enums.BookingStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String userId;
    private String roomId;
    @Field("checkInAt")
    private LocalDate checkInAt;

    @Field("checkOutAt")
    private LocalDate checkOutAt;
    private String paymentMethod;
    private BookingStatus status;
    private Double price;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Booking(String userId, String roomId, LocalDate checkInAt, LocalDate checkOutAt, Double price) {
        this.userId = userId;
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
        this.price = price;
        this.status = BookingStatus.PENDING_PAYMENT;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void confirmBooking() {
        this.status = BookingStatus.CONFIRMED;
        this.updatedAt = LocalDateTime.now();
    }

    public void cancelBooking() {
        this.status = BookingStatus.CANCELED;
        this.updatedAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Booking{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", roomId='" + roomId + '\'' +
                ", checkInAt=" + checkInAt +
                ", checkOutAt=" + checkOutAt +
                ", status=" + status +
                ", price=" + price +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}