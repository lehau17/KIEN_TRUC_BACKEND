const express = require('express');
const { invoiceRateLimiter } = require('../config/rateLimiter');
const { rateLimiterServer } = require('../config/rateLimiterServer');

const router = express.Router();

const invoiceController = require('../controllers/invoiceController');

// 📌 Lấy danh sách tất cả hóa đơn (Áp dụng Rate Limiter)
router.get('/', invoiceRateLimiter, invoiceController.getInvoices);

router.get('/bookings', rateLimiterServer,invoiceRateLimiter, invoiceController.getBookings);
// 📌 Lấy chi tiết hóa đơn theo ID (Áp dụng Rate Limiter)
router.get('/:id', invoiceRateLimiter, invoiceController.getInvoice);

// 📌 Xuất chi tiết hóa đơn dưới dạng HTML
router.get('/:id/export', invoiceController.exportInvoice);

// 📌 Tạo hóa đơn mới
router.post('/', invoiceController.createInvoice);

// 📌 Lấy danh sách hóa đơn theo userId (Áp dụng Rate Limiter)
router.get('/user/:userId', invoiceRateLimiter, invoiceController.getInvoicesByUser);




module.exports = router;
