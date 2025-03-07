const amqp = require('amqplib');
const { processBookingPayment } = require('../services/invoiceService');

const listenToBookingEvents = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = process.env.RABBITMQ_QUEUE;  // booking_queue

        await channel.assertQueue(queue, { durable: true });
        console.log(`Listening for messages on queue: ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    // Chuyển dữ liệu từ buffer sang JSON
                    const bookingData = JSON.parse(msg.content.toString());
                    console.log('✅ Received booking event:', bookingData);

                    // Gửi dữ liệu sang invoiceService để xử lý
                    await processBookingPayment(bookingData);

                    // Xác nhận đã xử lý xong message
                    channel.ack(msg);
                } catch (error) {
                    console.error('❌ Error processing booking event:', error);
                    channel.nack(msg, false, false); // Không requeue message
                }
            }
        });
    } catch (error) {
        console.error('❌ Error setting up RabbitMQ listener:', error);
    }
};

module.exports = { listenToBookingEvents };
