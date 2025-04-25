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

// 📌 Xuất chi tiết hóa đơn dưới dạng HTML
const exportInvoice = async (req, res) => {
    try {
        const invoiceHTML = await invoiceService.exportInvoiceHTML(req.params.id);
        if (!invoiceHTML) {
            return res.status(404).send('<h1>Invoice Not Found</h1>');
        }
        res.send(invoiceHTML);
    } catch (error) {
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
};

const createInvoice = async (req, res) => {
    try {
        const invoiceData = req.body;
        const newInvoice = await invoiceService.createInvoice(invoiceData);
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInvoicesByUser = async (req, res) => {
    try {
        const { userId } = req.params; // Lấy userId từ params
        const invoices = await invoiceService.fetchInvoicesByUserId(userId);

        if (!invoices || invoices.length === 0) {
            return res.status(404).json({ message: 'No invoices found for this user' });
        }

        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 📌 Lấy danh sách tất cả booking từ Booking Service và trả về dưới dạng JSON
const getBookings = async (req, res) => {
    try {
        const bookings = await invoiceService.getBookingsFromBookingService();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getInvoices,
    getInvoice,
    exportInvoice,
    createInvoice,
    getInvoicesByUser,
    getBookings
};
