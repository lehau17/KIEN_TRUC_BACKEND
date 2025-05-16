const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },    // ID booking liên quan
  userId: { type: String, required: true },       // ID user thanh toán
  amount: { type: Number, required: true },       // Số tiền thanh toán (đơn vị nhỏ nhất: ví dụ cent hoặc VND)

  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'canceled'],  // trạng thái thanh toán
    default: 'pending' 
  },
  paymentMethod: { type: String, default: 'stripe' }, // ví dụ: stripe, momo, cash, v.v.

  paymentIntentId: { type: String, required: true, unique: true },  // ID PaymentIntent từ Stripe, để tracking và xử lý webhook
  
  clientSecret: { type: String, required: true},
  
  currency: { type: String, default: 'vnd' },       // đơn vị tiền tệ

  metadata: { type: Object, default: {} },           // lưu trữ thêm dữ liệu tùy ý (vd: info booking, note)

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Tự động cập nhật updatedAt khi save
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
