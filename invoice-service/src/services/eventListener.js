const amqp = require('amqplib');
require('dotenv').config();
const { processBookingPayment } = require('../services/invoiceService');

const listenToBookingEvents = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        const exchange = 'booking.exchange'; // same as Java
        const routingKey = 'booking.routingKey'; // same as Java
        const queue = 'booking-queue'; // same as Java

        await channel.assertExchange(exchange, 'direct', { durable: true });
        await channel.assertQueue(queue, { durable: true });

        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`🟢 Listening for messages on queue '${queue}' via exchange '${exchange}'`);

        channel.consume(queue, async (msg) => {
            console.log("ABCXYZ");
            if (msg !== null) {
                try {
                    const bookingData = JSON.parse(msg.content.toString());
                    console.log(`✅ Received [${msg.fields.routingKey}]:`, bookingData);

                    await processBookingPayment(bookingData);

                    channel.ack(msg);
                } catch (error) {
                    console.error('❌ Error processing booking event:', error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('❌ Error setting up RabbitMQ listener:', error);
    }
};

module.exports = { listenToBookingEvents };
