const amqp = require('amqplib');
require('dotenv').config();
const { processBookingPayment, updatePayment } = require('./paymentService');
const Payment = require('../models/paymentModel');
const { bookingDataSchema } = require('../validators/paymentValidator');

const listenToBookingEvents = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        const exchange = 'booking.exchange';
        const routingKey = 'CONFIRM';
        const queue = 'confirm.queue';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`🟢 Listening for messages on queue '${queue}' via exchange '${exchange}'`);

        channel.consume(queue, async (msg) => {
            console.log(`----Consume----`);
            if (!msg) return;

            try {
                // ✅ Parse chuỗi JSON có thể bị lồng
                let bookingData = JSON.parse(msg.content.toString());
                if (typeof bookingData === 'string') {
                    bookingData = JSON.parse(bookingData);
                }

                console.log("📦 bookingData typeof:", typeof bookingData);
                console.log("📦 bookingData content:", bookingData);
                console.log(`✅ Received [${msg.fields.routingKey}]:`, bookingData);

                // ✅ Validate dữ liệu
                const { error } = bookingDataSchema.validate(bookingData);
                if (error) {
                    console.warn(`⚠️ Validation error: ${error.details[0].message}`);
                    return channel.nack(msg, false, false);
                }

                // 🔁 Check payment đã tồn tại chưa
                const existingPayment = await Payment.findOne({ bookingId: bookingData.bookingId });

                if (existingPayment) {
                    console.log(`🔁 Payment exists. Updating payment for bookingId: ${bookingData.bookingId}`);
                    await updatePayment(bookingData);
                } else {
                    console.log(`🆕 No payment found. Creating new payment for bookingId: ${bookingData.bookingId}`);
                    await processBookingPayment(bookingData);
                }

                channel.ack(msg);
            } catch (err) {
                console.error('❌ Error processing message:', err.message);
                channel.nack(msg, false, false);
            }
        });
    } catch (err) {
        console.error('❌ Error setting up RabbitMQ listener:', err.message);
    }
};

module.exports = { listenToBookingEvents };
