package bookingservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public RabbitMQProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public void sendMessage(String routingKey, Object message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            rabbitTemplate.convertAndSend("booking.exchange", routingKey, jsonMessage);
            System.out.println("Message sent to RabbitMQ: " + jsonMessage);
        } catch (Exception e) {
            System.err.println("Error sending message to RabbitMQ: " + e.getMessage());
        }
    }
}