const Payment = require('../models/paymentModel');

const createPayment = async (paymentData) => {
    try {
        const payment = new Payment(paymentData);
        return await payment.save();
    } catch (error) {
        throw new Error('Error creating payment: ' + error.message);
    }
};

const getPaymentById = async (id) => {
    try {
        return await Payment.findById(id);
    } catch (error) {
        throw new Error('Error fetching payment: ' + error.message);
    }
};

const getAllPayments = async () => {
    try {
        return await Payment.find();
    } catch (error) {
        throw new Error('Error fetching payments: ' + error.message);
    }
};

const getPaymentsByUserId = async (userId) => {
    try {
        return await Payment.find({ userId });
    } catch (error) {
        throw new Error('Error fetching payments for user: ' + error.message);
    }
};

const findByPaymentIntentId = async (paymentIntentId) => {
  return await Payment.findOne({ paymentIntentId });
};

const updatePayment = async (paymentId, updateData) => {
  return await Payment.findByIdAndUpdate(paymentId, updateData, { new: true });
};

const findClientSecretByBookingIdAndStatus = async (bookingId, status) => {
  // Lấy payment mới nhất theo createdAt giảm dần
  const payment = await Payment.findOne({ bookingId, status }).sort({ createdAt: -1 });
  // Nếu có payment thì trả về clientSecret, không thì trả về null
  return payment ? payment.clientSecret : null;
};


module.exports = {
    createPayment,
    getPaymentById,
    getAllPayments,
    getPaymentsByUserId,
    findByPaymentIntentId,
    updatePayment,
    findClientSecretByBookingIdAndStatus
};
    