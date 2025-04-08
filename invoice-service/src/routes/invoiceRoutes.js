const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Lấy danh sách tất cả hóa đơn
router.get('/', invoiceController.getInvoices);

// Lấy thông tin hóa đơn theo ID
router.get('/:id', invoiceController.getInvoice);

module.exports = router;