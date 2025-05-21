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

const findPaymentsByBookingIdAndStatus = async (bookingId, status) => {
  return await Payment.find({ bookingId, status }).sort({ createdAt: -1 });
};

module.exports = {
    createPayment,
    getPaymentById,
    getAllPayments,
    getPaymentsByUserId,
    findByPaymentIntentId,
    updatePayment,
    findPaymentsByBookingIdAndStatus
};
    