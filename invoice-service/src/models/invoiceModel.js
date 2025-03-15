// models/invoiceModel.js (Model hóa đơn)
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    bookingId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;