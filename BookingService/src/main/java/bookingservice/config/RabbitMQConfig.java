package bookingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "booking.exchange";
    public static final String PAYMENT_EXCHANGE = "payment.exchange";

    public static final String CONFIRM_QUEUE = "confirm.queue";
    public static final String CHECKIN_QUEUE = "checkin.queue";
    public static final String CHECKOUT_QUEUE = "checkout.queue";
    public static final String PENDING_QUEUE = "pending.queue";
    public static final String PAYMENT_CONFIRMED_QUEUE = "payment.confirmed.queue";

    public static final String CONFIRM_ROUTING_KEY = "CONFIRM";
    public static final String CHECKIN_ROUTING_KEY = "CHECKIN";
    public static final String CHECKOUT_ROUTING_KEY = "CHECKOUT";
    public static final String PENDING_ROUTING_KEY = "PENDING";
    public static final String PAYMENT_CONFIRMED_ROUTING_KEY = "PAYMENT_CONFIRMED";

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
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
    public Queue pendingQueue() {
        return new Queue(PENDING_QUEUE, true);
    }

    @Bean
    public Queue paymentConfirmedQueue() {
        return new Queue(PAYMENT_CONFIRMED_QUEUE, true);
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

    @Bean
    public Binding pendingBinding(Queue pendingQueue, TopicExchange bookingExchange) {
        return BindingBuilder.bind(pendingQueue).to(bookingExchange).with(PENDING_ROUTING_KEY);
    }

    @Bean
    public Binding paymentConfirmedBinding(Queue paymentConfirmedQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(paymentConfirmedQueue).to(paymentExchange).with(PAYMENT_CONFIRMED_ROUTING_KEY);
    }
}