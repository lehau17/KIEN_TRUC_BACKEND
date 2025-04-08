package bookingservice.repository;

import bookingservice.entity.Booking;
import bookingservice.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByCheckInAt(LocalDate checkInAt);

    List<Booking> findByCheckOutAt(LocalDate checkOutAt);

    @Query("{'roomId': ?0, 'status': ?1, $and: [ {'checkInAt': {$lte: ?3}}, {'checkOutAt': {$gte: ?2}} ]}")
    List<Booking> findOverlappingBookings(
            String roomId, BookingStatus status, LocalDate checkInAt, LocalDate checkOutAt);
}