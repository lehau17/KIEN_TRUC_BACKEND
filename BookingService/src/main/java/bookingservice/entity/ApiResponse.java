package bookingservice.entity;

import java.time.LocalDateTime;

public class ApiResponse<T> {
    private Object message; // <-- từ String -> Object
    private boolean success;
    private LocalDateTime timestamp;
    private T data;

    public ApiResponse(Object message, boolean success, T data) {
        this.message = message;
        this.success = success;
        this.timestamp = LocalDateTime.now();
        this.data = data;
    }

    // Getter & Setter
    public Object getMessage() {
        return message;
    }

    public void setMessage(Object message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
