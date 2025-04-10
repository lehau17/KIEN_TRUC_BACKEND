package bookingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "booking.exchange";

    public static final String CONFIRM_QUEUE = "confirm.queue";
    public static final String CHECKIN_QUEUE = "checkin.queue";
    public static final String CHECKOUT_QUEUE = "checkout.queue";

    public static final String CONFIRM_ROUTING_KEY = "CONFIRM";
    public static final String CHECKIN_ROUTING_KEY = "CHECKIN";
    public static final String CHECKOUT_ROUTING_KEY = "CHECKOUT";

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue confirmQueue() {
        return new Queue(CONFIRM_QUEUE, true);
    }

    @Bean
    public Queue checkinQueue() {
        return new Queue(CHECKIN_QUEUE, true);
    }

    @Bean
    public Queue checkoutQueue() {
        return new Queue(CHECKOUT_QUEUE, true);
    }

    @Bean
    public Binding confirmBinding(Queue confirmQueue, TopicExchange bookingExchange) {
        return BindingBuilder.bind(confirmQueue).to(bookingExchange).with(CONFIRM_ROUTING_KEY);
    }

    @Bean
    public Binding checkinBinding(Queue checkinQueue, TopicExchange bookingExchange) {
        return BindingBuilder.bind(checkinQueue).to(bookingExchange).with(CHECKIN_ROUTING_KEY);
    }

    @Bean
    public Binding checkoutBinding(Queue checkoutQueue, TopicExchange bookingExchange) {
        return BindingBuilder.bind(checkoutQueue).to(bookingExchange).with(CHECKOUT_ROUTING_KEY);
    }
}