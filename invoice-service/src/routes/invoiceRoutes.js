const express = require('express');
const { fetchAllInvoices, fetchInvoiceById, exportInvoiceHTML } = require('../services/invoiceService');

const router = express.Router();

// 📌 Lấy danh sách tất cả hóa đơn
router.get('/', async (req, res) => {
    try {
        const invoices = await fetchAllInvoices();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 📌 Lấy chi tiết hóa đơn theo ID
router.get('/:id', async (req, res) => {
    try {
        const invoice = await fetchInvoiceById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 📌 Xuất chi tiết hóa đơn dưới dạng HTML
router.get('/:id/export', async (req, res) => {
    try {
        const invoiceHTML = await exportInvoiceHTML(req.params.id);
        if (!invoiceHTML) {
            return res.status(404).send('<h1>Invoice Not Found</h1>');
        }
        res.send(invoiceHTML);
    } catch (error) {
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
});

module.exports = router;
    