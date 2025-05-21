const express = require('express');
const { paymentRateLimiter } = require('../config/rateLimiter');
const { rateLimiterServer } = require('../config/rateLimiterServer');

const router = express.Router();

const paymentController = require('../controllers/paymentController');

// 📌 Lấy danh sách tất cả thanh toán (Áp dụng Rate Limiter)
router.get('/', paymentRateLimiter, paymentController.getPayments);

// 📌 Lấy danh sách booking liên quan đến thanh toán (nếu cần)
router.get('/bookings', rateLimiterServer, paymentRateLimiter, paymentController.getBookings);

// 📌 Xuất thông tin thanh toán dưới dạng HTML
router.get('/:id/export', paymentController.exportPayment);

// 📌 Lấy chi tiết thanh toán theo ID (Áp dụng Rate Limiter)
router.get('/:id', paymentRateLimiter, paymentController.getPayment);

// 📌 Tạo thanh toán mới
router.post('/', paymentController.createPayment);

// 📌 Lấy danh sách thanh toán theo userId (Áp dụng Rate Limiter)
router.get('/user/:userId', paymentRateLimiter, paymentController.getPaymentsByUser);

// 📌 Lấy danh sách thanh toán theo userId, status = PENDING_PAYMENT (Áp dụng Rate Limiter)
router.get('/user/:userId/pending', paymentRateLimiter, paymentController.getPendingPaymentsByUser);

// Xác nhận thanh toán (confirm payment)
router.post('/confirm-payment', paymentController.confirmPayment);

router.post('/get-payment-intent', paymentController.getPaymentIntent);

module.exports = router;
