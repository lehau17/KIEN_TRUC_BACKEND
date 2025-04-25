const invoiceService = require('../services/invoiceService');

const getInvoices = async (req, res) => {
    try {
        const invoices = await invoiceService.fetchAllInvoices();
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInvoice = async (req, res) => {
    try {
        const invoice = await invoiceService.fetchInvoiceById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getInvoices, getInvoice };
