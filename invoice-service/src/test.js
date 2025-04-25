const amqp = require('amqplib');
require('dotenv').config();

const sendBookingEvent = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        const exchange = 'booking.exchange';
        const routingKey = 'CONFIRM';

        await channel.assertExchange(exchange, 'topic', { durable: true });

        const bookingPayload = {
            bookingId: 'BOOK123456',
            userId: 'USER7890',
            amount: 150.00,
            paymentMethod: 'momo',
            status: 'PAID'
        };

        const messageBuffer = Buffer.from(JSON.stringify(bookingPayload));
        channel.publish(exchange, routingKey, messageBuffer);

        console.log(`📤 Sent booking event to exchange '${exchange}' with routingKey '${routingKey}':`);
        console.log(bookingPayload);

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);

    } catch (error) {
        console.error('❌ Error sending booking event:', error.message);
    }
};

sendBookingEvent();
