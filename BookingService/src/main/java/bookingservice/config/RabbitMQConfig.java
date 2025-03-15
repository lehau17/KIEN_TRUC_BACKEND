package bookingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "booking-exchange";

    public static final String BOOKING_QUEUE = "booking-queue";
    public static final String BOOKING_ROUTING_KEY = "booking.routingKey";

    public static final String CONFIRM_QUEUE = "confirm-queue";
    public static final String CONFIRM_ROUTING_KEY = "confirm.routingKey";

    public static final String CANCEL_QUEUE = "cancel-queue";
    public static final String CANCEL_ROUTING_KEY = "cancel.routingKey";

    public static final String CHECKIN_QUEUE = "checkin-queue";
    public static final String CHECKIN_ROUTING_KEY = "checkin.routingKey";

    public static final String CHECKOUT_QUEUE = "checkout-queue";
    public static final String CHECKOUT_ROUTING_KEY = "checkout.routingKey";

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue bookingQueue() {
        return new Queue(BOOKING_QUEUE);
    }

    @Bean
    public Queue confirmQueue() {
        return new Queue(CONFIRM_QUEUE);
    }

    @Bean
    public Queue cancelQueue() {
        return new Queue(CANCEL_QUEUE);
    }

    @Bean
    public Queue checkinQueue() {
        return new Queue(CHECKIN_QUEUE);
    }

    @Bean
    public Queue checkoutQueue() {
        return new Queue(CHECKOUT_QUEUE);
    }

    @Bean
    public Binding bookingBinding(Queue bookingQueue, DirectExchange exchange) {
        return BindingBuilder.bind(bookingQueue).to(exchange).with(BOOKING_ROUTING_KEY);
    }

    @Bean
    public Binding confirmBinding(Queue confirmQueue, DirectExchange exchange) {
        return BindingBuilder.bind(confirmQueue).to(exchange).with(CONFIRM_ROUTING_KEY);
    }

    @Bean
    public Binding cancelBinding(Queue cancelQueue, DirectExchange exchange) {
        return BindingBuilder.bind(cancelQueue).to(exchange).with(CANCEL_ROUTING_KEY);
    }

    @Bean
    public Binding checkinBinding(Queue checkinQueue, DirectExchange exchange) {
        return BindingBuilder.bind(checkinQueue).to(exchange).with(CHECKIN_ROUTING_KEY);
    }

    @Bean
    public Binding checkoutBinding(Queue checkoutQueue, DirectExchange exchange) {
        return BindingBuilder.bind(checkoutQueue).to(exchange).with(CHECKOUT_ROUTING_KEY);
    }
}
