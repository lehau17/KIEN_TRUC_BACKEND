const amqp = require('amqplib');
require('dotenv').config();
const { processBookingPayment, updateInvoice } = require('./invoiceService');
const Invoice = require('../models/invoiceModel');
const { bookingDataSchema } = require('../validators/invoiceValidator');

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

                // 🔁 Check invoice đã tồn tại chưa
                const existingInvoice = await Invoice.findOne({ bookingId: bookingData.bookingId });

                if (existingInvoice) {
                    console.log(`🔁 Invoice exists. Updating invoice for bookingId: ${bookingData.bookingId}`);
                    await updateInvoice(bookingData);
                } else {
                    console.log(`🆕 No invoice found. Creating new invoice for bookingId: ${bookingData.bookingId}`);
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

const listenToPaymentEvents = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const exchange = 'payment.exchange';
    const queue = 'invoice_payment_queue'; // tên queue riêng
    const routingKey = 'PAYMENT_CONFIRMED';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    console.log('📥 [Invoice Service] Listening for PAYMENT_CONFIRMED events...');

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const paymentData = JSON.parse(msg.content.toString());
        console.log('✅ [Invoice Service] Received PAYMENT_CONFIRMED:', paymentData);

        // Có thể xử lý thêm tại đây nếu cần sau này

        channel.ack(msg); // xác nhận đã xử lý
      }
    });
  } catch (err) {
    console.error('❌ [Invoice Service] RabbitMQ listener error:', err.message);
  }
};

module.exports = { listenToBookingEvents, listenToPaymentEvents };
