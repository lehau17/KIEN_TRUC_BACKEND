package bookingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "booking.exchange";
    public static final String CONFIRM_QUEUE = "confirm.queue";
    public static final String CONFIRM_ROUTING_KEY = "CONFIRM";

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue confirmQueue() {
        return new Queue(CONFIRM_QUEUE, true);
    }

    @Bean
    public Binding confirmBinding(Queue confirmQueue, TopicExchange bookingExchange) {
        return BindingBuilder
                .bind(confirmQueue)
                .to(bookingExchange)
                .with(CONFIRM_ROUTING_KEY);
    }
}