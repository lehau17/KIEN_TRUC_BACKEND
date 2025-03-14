package bookingservice.service;

import bookingservice.config.RabbitMQConfig;
import bookingservice.dto.BookingMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendMessage(String action, BookingMessage message) {
        String exchange = RabbitMQConfig.EXCHANGE;
        String routingKey = "";

        switch (action) {
            case "BOOKING":
                routingKey = RabbitMQConfig.BOOKING_ROUTING_KEY;
                break;
            case "CONFIRM":
                routingKey = RabbitMQConfig.CONFIRM_ROUTING_KEY;
                break;
            case "CANCEL":
                routingKey = RabbitMQConfig.CANCEL_ROUTING_KEY;
                break;
            case "CHECKIN":
                routingKey = RabbitMQConfig.CHECKIN_ROUTING_KEY;
                break;
            case "CHECKOUT":
                routingKey = RabbitMQConfig.CHECKOUT_ROUTING_KEY;
                break;
        }

        System.out.println("Gửi message [" + action + "] đến exchange: " + exchange + " với routing key: " + routingKey);
        System.out.println("Nội dung message: " + message.toString());

        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }

}
