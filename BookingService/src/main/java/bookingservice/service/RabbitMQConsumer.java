// package bookingservice.service;

// import bookingservice.config.RabbitMQConfig;
// import bookingservice.dto.BookingMessage;
// import org.springframework.amqp.rabbit.annotation.RabbitListener;
// import org.springframework.amqp.rabbit.connection.ConnectionFactory;
// import org.springframework.amqp.rabbit.core.RabbitTemplate;
// import
// org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
// import
// org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.stereotype.Service;

// @Service
// public class RabbitMQConsumer {

// @RabbitListener(queues = RabbitMQConfig.BOOKING_QUEUE)
// public void receiveBookingMessage(BookingMessage message) throws
// InterruptedException {
// System.out.println("Nhận booking message: " + message);
// System.out.println("Xử lý xong booking message: " + message);
// }

// @RabbitListener(queues = RabbitMQConfig.CONFIRM_QUEUE)
// public void receiveConfirmMessage(BookingMessage message) throws
// InterruptedException {
// System.out.println("Xác nhận booking: " + message);
// System.out.println("Xác nhận booking hoàn tất: " + message);
// }

// @RabbitListener(queues = RabbitMQConfig.CANCEL_QUEUE)
// public void receiveCancelMessage(BookingMessage message) throws
// InterruptedException {
// System.out.println("Hủy booking: " + message);
// System.out.println("Hủy booking hoàn tất: " + message);
// }

// @RabbitListener(queues = RabbitMQConfig.CHECKIN_QUEUE)
// public void receiveCheckInMessage(BookingMessage message) throws
// InterruptedException {
// System.out.println("Check-in booking: " + message);
// System.out.println("Check-in booking hoàn tất: " + message);
// }

// @RabbitListener(queues = RabbitMQConfig.CHECKOUT_QUEUE)
// public void receiveCheckOutMessage(BookingMessage message) throws
// InterruptedException {
// System.out.println("Check-out booking: " + message);
// System.out.println("Check-out booking hoàn tất: " + message);
// }

// @Bean
// public Jackson2JsonMessageConverter jsonMessageConverter() {
// Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
// DefaultJackson2JavaTypeMapper typeMapper = new
// DefaultJackson2JavaTypeMapper();
// typeMapper.setTrustedPackages("bookingservice.dto");

// converter.setClassMapper(typeMapper);
// return converter;
// }

// @Bean
// public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
// Jackson2JsonMessageConverter jsonMessageConverter) {
// RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
// rabbitTemplate.setMessageConverter(jsonMessageConverter);
// return rabbitTemplate;
// }
// }
