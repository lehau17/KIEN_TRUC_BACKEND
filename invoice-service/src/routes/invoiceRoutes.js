const express = require('express');
const router = express.Router();

const invoiceController = require('../controllers/invoiceController');

// 📌 Lấy danh sách tất cả hóa đơn
router.get('/', invoiceController.getInvoices);

// 📌 Lấy chi tiết hóa đơn theo ID
router.get('/:id', invoiceController.getInvoice);

// 📌 Xuất chi tiết hóa đơn dưới dạng HTML
router.get('/:id/export', invoiceController.exportInvoice);

// 📌 Tạo hóa đơn mới
router.post('/', invoiceController.createInvoice);


module.exports = router;
