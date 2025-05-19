package bookingservice.dto;

public class StatusUpdateDTO {
    private String status;

    public StatusUpdateDTO(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}