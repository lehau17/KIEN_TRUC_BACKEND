const amqp = require('amqplib');
require('dotenv').config()
const sendBookingEvent = async () => {
    try {
        console.log("RabbitMQ URL:", process.env.RABBITMQ_URL);
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'booking_queue';

        await channel.assertQueue(queue, { durable: true });

        const bookingData = {
            bookingId: "BK123456789",
            userId: "USER789",
            amount: 500,
            paymentMethod: "credit_card"
        };

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(bookingData)), { persistent: true });
        console.log("📩 Sent booking event:", bookingData);

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error("❌ Error sending booking event:", error);
    }
};

// Gọi hàm đúng tên
sendBookingEvent();
