const amqp = require('amqplib');

const receiveBookingEvent = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'booking_queue';

        await channel.assertQueue(queue, { durable: true });

        console.log("📩 Waiting for messages in", queue);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                console.log("📥 Received booking event:", JSON.parse(msg.content.toString()));
                channel.ack(msg); // Xác nhận đã xử lý message
            }
        });

    } catch (error) {
        console.error("❌ Error receiving booking event:", error);
    }
};

// Gọi hàm để lắng nghe queue
receiveBookingEvent();
