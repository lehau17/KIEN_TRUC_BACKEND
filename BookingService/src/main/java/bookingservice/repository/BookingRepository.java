package bookingservice.repository;

import bookingservice.entity.Booking;
import bookingservice.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByStatus(BookingStatus status);
}
