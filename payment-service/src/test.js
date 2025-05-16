require('dotenv').config();
const amqp = require('amqplib');

const bookingEvent = {
  bookingId: '5',
  userId: 'user123',
  roomId: 'room101', 
  amount: 500,
  paymentMethod: 'credit',
  status: 'pending',
};

async function sendBookingEvent() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const exchange = 'booking.exchange';
    const routingKey = 'CONFIRM';

    await channel.assertExchange(exchange, 'topic', { durable: true });

    const messageBuffer = Buffer.from(JSON.stringify(bookingEvent));

    channel.publish(exchange, routingKey, messageBuffer);
    console.log('✅ Booking event sent:', bookingEvent);

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error('❌ Error sending booking event:', err.message);
  }
}

sendBookingEvent();
