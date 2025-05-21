const paymentService = require('../services/paymentService');

const getPayments = async (req, res) => {
    try {
        const payments = await paymentService.fetchAllPayments();
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPayment = async (req, res) => {
    try {
        const payment = await paymentService.fetchPaymentById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportPayment = async (req, res) => {
    try {
        const paymentHTML = await paymentService.exportPaymentHTML(req.params.id);
        if (!paymentHTML) {
            return res.status(404).send('<h1>Payment Not Found</h1>');
        }
        res.send(paymentHTML);
    } catch (error) {
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
};

const createPayment = async (req, res) => {
    try {
        const paymentData = req.body;
        const newPayment = await paymentService.createPayment(paymentData);
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPaymentsByUser = async (req, res) => {
    try {
        const payments = await paymentService.fetchPaymentsByUserId(req.params.userId);
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Lấy danh sách tất cả booking từ Booking Service và trả về dưới dạng JSON
const getBookings = async (req, res) => {
    try {
        const bookings = await paymentService.getBookingsFromBookingService();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, bookingId, userId } = req.body;

    // Tạo payment intent qua service
    const paymentIntent = await paymentService.createPaymentIntent({ amount, currency, bookingId, userId });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const confirmPayment = async (req, res) => {
  try {
    const { clientSecret } = req.body;
    if (!clientSecret) return res.status(400).json({ message: 'Thiếu clientSecret' });

    const updatedPayment = await paymentService.confirmPayment(clientSecret);
    res.json(updatedPayment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getPaymentIntent = async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) {
    return res.status(400).json({ message: 'Missing paymentIntentId' });
  }

  try {
    const paymentIntent = await paymentService.getPaymentIntent(paymentIntentId);
    res.json(paymentIntent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPendingPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await paymentService.getPendingPaymentsByUserId(userId);
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
    getPayments,
    getPayment,
    exportPayment,
    createPayment,
    getPaymentsByUser,
    getBookings,
    createPaymentIntent,
    confirmPayment,
    getPaymentIntent,
    getPendingPaymentsByUser
};
