const amqp = require('amqplib');
require('dotenv').config();
const { processBookingPayment } = require('./invoiceService');

const listenToBookingEvents = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        const exchange = 'booking.exchange';      // Giống bên Spring
        const routingKey = 'CONFIRM';             // Giống bên Spring
        const queue = 'confirm.queue';            // Giống bên Spring

        // 🟡 Đổi từ 'direct' -> 'topic' để match với Spring Boot
        await channel.assertExchange(exchange, 'topic', { durable: true });

        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`🟢 Listening for messages on queue '${queue}' via exchange '${exchange}'`);

        channel.consume(queue, async (msg) => {
            console.log(`----Consume----`);
            if (msg !== null) {
                try {
                    const bookingData = JSON.parse(msg.content.toString());
                    console.log(`✅ Received [${msg.fields.routingKey}]:`, bookingData);

                    await processBookingPayment(bookingData);

                    channel.ack(msg);
                } catch (error) {
                    console.error('❌ Error processing booking event:', error);
                    channel.nack(msg, false, false); // Reject không requeue
                }
            }
        });
    } catch (error) {
        console.error('❌ Error setting up RabbitMQ listener:', error);
    }
};

module.exports = { listenToBookingEvents };
