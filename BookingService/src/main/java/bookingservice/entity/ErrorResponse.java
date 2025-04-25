package bookingservice.entity;

import java.time.LocalDateTime;

public class ErrorResponse {
    private Object message; // CHỈ CẦN Object
    private boolean success = false;
    private LocalDateTime timestamp = LocalDateTime.now();
    private Object dataError;

    public ErrorResponse(Object message, Object dataError) {
        this.message = message;
        this.dataError = dataError;
    }

    public Object getMessage() {
        return message;
    }

    public boolean isSuccess() {
        return success;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Object getDataError() {
        return dataError;
    }
}
