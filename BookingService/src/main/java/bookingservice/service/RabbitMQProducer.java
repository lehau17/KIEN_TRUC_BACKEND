package bookingservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public RabbitMQProducer(RabbitTemplate rabbitTemplate, RedisTemplate<String, Object> redisTemplate) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = new ObjectMapper();
        this.redisTemplate = redisTemplate;
    }

    public void sendMessage(String routingKey, Object message) {
        try {
            String messageKey = "message:pending:" + routingKey + ":" + System.currentTimeMillis();
            redisTemplate.opsForValue().set(messageKey, message, 1, TimeUnit.HOURS);

            String jsonMessage = objectMapper.writeValueAsString(message);
            String exchange = routingKey.equals("PAYMENT_CONFIRMED") ? "payment.exchange" : "booking.exchange";
            rabbitTemplate.convertAndSend(exchange, routingKey, jsonMessage);
            System.out.println("Message sent to RabbitMQ: " + jsonMessage);

            redisTemplate.delete(messageKey);
        } catch (Exception e) {
            System.err.println("Error sending message to RabbitMQ: " + e.getMessage());
            throw new RuntimeException("Lỗi khi gửi message tới RabbitMQ", e);
        }
    }
}