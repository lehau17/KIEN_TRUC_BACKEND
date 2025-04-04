const amqp = require('amqplib');
require('dotenv').config();

const sendBookingEvent = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL); // Kết nối với RabbitMQ
        const channel = await connection.createChannel(); // Tạo channel

        // Đọc giá trị từ .env hoặc mặc định "booking-exchange"
        const exchange = process.env.RABBITMQ_EXCHANGE || 'booking.exchange'; 
        const routingKey = 'booking.routingKey'; // Khớp với routingKeyPattern trong Node.js (booking.*)

        // Tạo exchange kiểu topic
        await channel.assertExchange(exchange, 'direct', { durable: true });

        // Tạo dữ liệu booking mà bạn muốn gửi
        const bookingData = {
            bookingId: "BK1234567891011",
            userId: "USER789", // Đây là thông tin bắt buộc!
            amount: 500,
            paymentMethod: "credit_card",
            status: 'pending'
        };

        // Gửi sự kiện đến RabbitMQ với exchange, routingKey và dữ liệu
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(bookingData)), {
            persistent: true // Đảm bảo message không bị mất nếu RabbitMQ restart
        });

        console.log(`📩 Sent booking event to exchange "${exchange}" with routingKey "${routingKey}":`, bookingData);

        setTimeout(() => {
            connection.close(); // Đóng kết nối
            process.exit(0); // Dừng tiến trình
        }, 500);
    } catch (error) {
        console.error("❌ Error sending booking event:", error);
    }
};

// Gọi hàm để gửi sự kiện
sendBookingEvent();
