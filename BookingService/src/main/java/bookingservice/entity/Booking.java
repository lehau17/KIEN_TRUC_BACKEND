package bookingservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long roomId;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;
    private Boolean isConfirmed = false;
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

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

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public void setCheckInAt(LocalDateTime checkInAt) {
        this.checkInAt = checkInAt;
    }

    public void setCheckOutAt(LocalDateTime checkOutAt) {
        this.checkOutAt = checkOutAt;
    }

    public void setConfirmed(Boolean confirmed) {
        isConfirmed = confirmed;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Booking() {}

    public Booking(Long userId, Long roomId, LocalDateTime checkInAt, LocalDateTime checkOutAt) {
        this.userId = userId;
        this.roomId = roomId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
        this.isConfirmed = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Booking{" +
                "id=" + id +
                ", userId=" + userId +
                ", roomId=" + roomId +
                ", checkInAt=" + checkInAt +
                ", checkOutAt=" + checkOutAt +
                ", isConfirmed=" + isConfirmed +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
