package bookingservice.exception;

public enum ErrorCode {
    USER_ID_REQUIRED("V_E_100001", "User ID không được để trống"),
    ROOM_ID_REQUIRED("V_E_100002", "Room ID không được để trống"),
    CHECKIN_REQUIRED("V_E_100003", "Thời gian check-in không được để trống"),
    CHECKOUT_REQUIRED("V_E_100004", "Thời gian check-out không được để trống"),
    PRICE_REQUIRED("V_E_100005", "Giá phòng không được để trống"),
    PRICE_INVALID("V_E_100006", "Giá phòng phải lớn hơn 0");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String code() {
        return code;
    }

    public String message() {
        return message;
    }
}
