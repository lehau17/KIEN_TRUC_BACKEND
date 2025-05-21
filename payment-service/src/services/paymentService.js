const paymentRepository = require('../repository/paymentRepository');
const Payment = require('../models/paymentModel');
const { bookingDataSchema } = require('../validators/paymentValidator');
const stripe = require('../config/stripe');
const redisClient = require('../config/redisClient');
const { wrapWithBreaker } = require('../config/circuitBreaker');
const axiosInstance = require('../config/axiosConfig');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const CACHE_TTL = 10;

// 1. Tạo đơn thanh toán (với paymentIntentId)
const createPaymentForBooking = async (bookingData) => {
  // 1. Tạo PaymentIntent thật trên Stripe
  const paymentIntent = await createPaymentIntent({
    amount: bookingData.amount,
    currency: 'usd', // hoặc lấy từ bookingData nếu có
    bookingId: bookingData.bookingId,
    userId: bookingData.userId,
  });

  // 2. Lấy paymentIntentId và clientSecret từ Stripe trả về
  const paymentIntentId = paymentIntent.id;
  const clientSecret = paymentIntent.client_secret;

  // 3. Tạo bản ghi Payment trong DB với thông tin đầy đủ
  const paymentData = {
    bookingId: bookingData.bookingId,
    userId: bookingData.userId,
    amount: bookingData.amount,
    method: bookingData.paymentMethod,
    status: bookingData.status,
    paymentIntentId,               // lưu paymentIntentId
    clientSecret,                  // lưu luôn clientSecret
  };

  const newPayment = await paymentRepository.createPayment(paymentData);

  // 4. Xoá cache Redis liên quan
  await redisClient.del(`payment:all`);
  await redisClient.del(`payment:booking:${bookingData.bookingId}`);

  // 5. Trả về để frontend confirmCardPayment()
  return {
    payment: newPayment,
    clientSecret,
    paymentIntentId,
  };
};

// 2. Xử lý xác nhận thanh toán (khi khách đã chuyển khoản/stripe webhook,...)
const confirmPayment = async (clientSecret) => {
  // 1. Trích xuất paymentIntentId từ clientSecret
  const paymentIntentId = clientSecret.split('_secret_')[0];
  if (!paymentIntentId.startsWith('pi_')) {
    throw new Error('Client secret không hợp lệ');
  }

  // 2. Kiểm tra trạng thái PaymentIntent trên Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!paymentIntent || paymentIntent.status !== 'succeeded') {
    throw new Error('PaymentIntent chưa được thanh toán hoặc không hợp lệ');
  }

  // 3. Lấy Payment trong DB theo paymentIntentId
  const payment = await paymentRepository.findByPaymentIntentId(paymentIntentId);
  if (!payment) throw new Error('Payment not found');

  // 4. Cập nhật trạng thái payment sang 'paid'
  payment.status = 'paid';
  const updatedPayment = await paymentRepository.updatePayment(payment._id, payment);

  // 5. Xoá cache Redis nếu có
  await redisClient.del(`payment:all`);
  await redisClient.del(`payment:booking:${payment.bookingId}`);

  // 6. Gửi event payment đã thanh toán thành công
  await sendPaymentEvent(updatedPayment);

  return updatedPayment;
};

// 3. processBookingPayment chỉ làm nhiệm vụ validate dữ liệu
const processBookingPayment = async (bookingData) => {
  if (typeof bookingData === 'string') bookingData = JSON.parse(bookingData);

  const { error } = bookingDataSchema.validate(bookingData);
  if (error) throw new Error('Validation failed: ' + error.details[0].message);

  // Chỉ tạo payment nếu booking ở trạng thái PENDING_PAYMENT
  if (bookingData.status === 'PENDING_PAYMENT') {
    return await createPaymentForBooking(bookingData);
  }

  // Nếu trạng thái là 'paid' thì không cần xử lý gì thêm ở backend
  else if (bookingData.status === 'paid') {
    return { message: 'Booking đã được đánh dấu là paid, không thực hiện tạo thanh toán.' };
  }

  throw new Error('Invalid booking status');
};

const updatePayment = async (bookingData) => {
  try {
    if (typeof bookingData === 'string') bookingData = JSON.parse(bookingData);

    const { error } = bookingDataSchema.validate(bookingData);
    if (error) throw new Error('Validation failed: ' + error.details[0].message);

    let payment = await Payment.findOne({ bookingId: bookingData.bookingId });

    if (payment) {
      payment.amount = bookingData.amount;
      payment.method = bookingData.paymentMethod;
      payment.status = 'paid';
      await payment.save();

      await redisClient.del(`payment:${payment._id}`);
      await redisClient.del(`payment:booking:${bookingData.bookingId}`);
      await redisClient.del(`payment:all`);

      console.log(`✅ Payment updated for Booking ID: ${bookingData.bookingId}`);
      return true;
    } else {
      console.log(`⚠️ No payment found for Booking ID: ${bookingData.bookingId}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating payment:', error.message);
    throw error;
  }
};

const fetchAllPayments = wrapWithBreaker(async () => {
  const cacheKey = `payment:all`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log(`🔁 Cache hit for ${cacheKey}`);
    return JSON.parse(cached);
  }

  const payments = await paymentRepository.getAllPayments();
  await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(payments));
  return payments;
}, 'fetchAllPayments');

const fetchPaymentById = wrapWithBreaker(async (id) => {
  const cacheKey = `payment:${id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log(`🔁 Cache hit for ${cacheKey}`);
    return JSON.parse(cached);
  }

  const payment = await paymentRepository.getPaymentById(id);
  if (payment) {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(payment));
  }

  return payment;
}, 'fetchPaymentById');

const exportPaymentHTML = wrapWithBreaker(async (id) => {
  const cacheKey = `payment:export:${id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log(`🔁 HTML cache hit for ${cacheKey}`);
    return cached;
  }

  const payment = await paymentRepository.getPaymentById(id);
  if (!payment) return null;

  const html = `
        <html>
            <head><title>Payment ${payment._id}</title></head>
            <body>
                <h1>Payment Details</h1>
                <p><strong>Booking ID:</strong> ${payment.bookingId}</p>
                <p><strong>User ID:</strong> ${payment.userId}</p>
                <p><strong>Amount:</strong> $${payment.amount}</p>
                <p><strong>Method:</strong> ${payment.method}</p>
                <p><strong>Status:</strong> ${payment.status}</p>
            </body>
        </html>
    `;

  await redisClient.setEx(cacheKey, CACHE_TTL, html);
  return html;
}, 'exportPaymentHTML');

const createPayment = async (paymentData) => {
  try {
    const { error } = bookingDataSchema.validate(paymentData);
    if (error) throw new Error('Validation failed: ' + error.details[0].message);

    const newPayment = new Payment({
      bookingId: paymentData.bookingId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      method: paymentData.paymentMethod,
      status: 'unpaid'
    });

    await newPayment.save();

    await redisClient.del(`payment:all`);
    await redisClient.del(`payment:booking:${paymentData.bookingId}`);

    console.log('✅ Payment created successfully:', newPayment);
    return newPayment;
  } catch (error) {
    console.error('❌ Error creating payment:', error.message);
    throw error;
  }
};

const fetchPaymentsByUserId = wrapWithBreaker(async (userId) => {
  const cacheKey = `payment:user:${userId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log(`🔁 Cache hit for ${cacheKey}`);
    return JSON.parse(cached);
  }

  const payments = await paymentRepository.getPaymentsByUserId(userId);
  if (payments) {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(payments));
  }

  return payments;
}, 'fetchPaymentsByUserId');

const getBookingsFromBookingService = async () => {
  const cacheKey = 'bookings:data';  // Cache key cho dữ liệu bookings
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log(`🔁 Cache hit for ${cacheKey}`);
    return JSON.parse(cached);  // Trả về dữ liệu từ cache
  }

  try {
    // Gửi request đến Booking Service
    const response = await axiosInstance.get('/api/bookings');
    console.log('Raw response:', response.data);  // Log raw response

    // Kiểm tra nếu không có data hoặc data rỗng
    if (!response.data || !response.data.bookings || response.data.bookings.length === 0) {
      throw new Error('No bookings data received');
    }

    // Lưu vào cache Redis
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(response.data.bookings));

    console.log('Bookings data:', response.data.bookings);
    return response.data.bookings;
  } catch (error) {
    // Kiểm tra loại lỗi và log thông báo chi tiết
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused by Booking Service:', error.message);
    } else if (error.response) {
      // Lỗi có response từ server
      console.error(`❌ Error fetching bookings from Booking Service: ${error.response.status} - ${error.response.statusText}`);
    } else {
      // Các lỗi không liên quan đến response
      console.error('❌ Error fetching bookings from Booking Service:', error.message);
    }
    throw error;
  }
};

const createPaymentIntent = async ({ amount, currency = 'usd', bookingId, userId }) => {
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: {
      bookingId,
      userId,
    },
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never', // Tránh redirect để phù hợp với frontend test
    },
  });

  return paymentIntent;
};



const getPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error('Stripe error: ' + error.message);
  }
};

async function sendPaymentEvent(payment) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const exchange = 'payment.exchange';
    const routingKey = 'PAYMENT_CONFIRMED';

    await channel.assertExchange(exchange, 'topic', { durable: true });

    const messageBuffer = Buffer.from(JSON.stringify(payment));

    channel.publish(exchange, routingKey, messageBuffer);
    console.log('✅ Payment event sent:', payment);

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error('❌ Error sending payment event:', err.message);
  }
}

const getPendingPaymentsByUserId = async (userId) => {
  if (!userId) throw new Error('Thiếu userId');
  return await paymentRepository.findPaymentsByUserIdAndStatus(userId, 'PENDING_PAYMENT');
};

module.exports = {
  processBookingPayment,
  updatePayment,
  fetchAllPayments,
  fetchPaymentById,
  exportPaymentHTML,
  createPayment,
  fetchPaymentsByUserId,
  getBookingsFromBookingService,
  createPaymentIntent,
  confirmPayment,
  getPaymentIntent,
  getPendingPaymentsByUserId

};