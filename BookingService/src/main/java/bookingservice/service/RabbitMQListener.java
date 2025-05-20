package bookingservice.service;

import bookingservice.dto.BookingMessage;
import bookingservice.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQListener {

    private static final Logger logger = LoggerFactory.getLogger(RabbitMQListener.class);

    private final BookingService bookingService;

    public RabbitMQListener(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @RabbitListener(queues = "payment.confirmed.queue")
    public void handlePaymentConfirmed(BookingMessage bookingMessage) {
        try {
            logger.info("✅ Nhận message PAYMENT_CONFIRMED: {}", bookingMessage.getBookingId());

            if ("paid".equalsIgnoreCase(bookingMessage.getStatus())) {
                boolean success = bookingService.confirmBooking(bookingMessage.getBookingId());
                if (success) {
                    logger.info("✅ Booking {} xác nhận thành công với phương thức thanh toán {}",
                            bookingMessage.getBookingId(), bookingMessage.getPaymentMethod());
                } else {
                    logger.warn("⚠️ Không thể xác nhận booking {}", bookingMessage.getBookingId());
                }
            } else {
                logger.warn("⚠️ Status không phải 'paid': {}", bookingMessage.getStatus());
            }
        } catch (Exception e) {
            logger.error("❌ Lỗi xử lý message PAYMENT_CONFIRMED: {}", e.getMessage(), e);
        }
    }
}
