const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: [true, 'Booking ID is required']
    },
    userId: {
        type: String,
        required: [true, 'User ID is required']
    },
    roomId: {
        type: String,
        required: [true, 'Room ID is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment Method is required']
    },
    status: {
        type: String,
        default: 'unpaid'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
