package bookingservice.dto;

import java.util.List;

public class RoomServiceResponseDTO<T> {
    private boolean isSuccess;
    private T data;

    public boolean isIsSuccess() {
        return isSuccess;
    }

    public void setIsSuccess(boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}