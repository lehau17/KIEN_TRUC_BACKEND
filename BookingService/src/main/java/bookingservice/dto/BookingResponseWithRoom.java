package bookingservice.dto;

public class BookingResponseWithRoom {
    private BookingResponse booking;
    private RoomDTO roomDetail;

    public BookingResponseWithRoom(BookingResponse booking, RoomDTO roomDetail) {
        this.booking = booking;
        this.roomDetail = roomDetail;
    }

    public BookingResponse getBooking() {
        return booking;
    }

    public void setBooking(BookingResponse booking) {
        this.booking = booking;
    }

    public RoomDTO getRoomDetail() {
        return roomDetail;
    }

    public void setRoomDetail(RoomDTO roomDetail) {
        this.roomDetail = roomDetail;
    }
}
