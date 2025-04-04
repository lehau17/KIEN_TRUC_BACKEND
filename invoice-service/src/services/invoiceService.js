const invoiceRepository = require('../repository/invoiceRepository');
const Invoice = require('../models/invoiceModel');

const processBookingPayment = async (bookingData) => {
    try {
        console.log("🔄 Processing booking payment for:", bookingData);

        const invoiceData = {
            bookingId: bookingData.bookingId,
            userId: bookingData.userId,
            amount: bookingData.amount,
            paymentMethod: bookingData.paymentMethod,
            status: "paid",
        };

        const newInvoice = await invoiceRepository.createInvoice(invoiceData);
        console.log("✅ Invoice created successfully:", newInvoice);
        return newInvoice;
    } catch (error) {
        console.error("❌ Error processing booking payment:", error);
        throw error;
    }
};

const updateInvoice = async (bookingData) => {
    try {
        const { bookingId, amount, paymentMethod } = bookingData;
        let invoice = await Invoice.findOne({ bookingId });

        if (invoice) {
            invoice.amount = amount;
            invoice.paymentMethod = paymentMethod;
            invoice.status = 'paid';
            await invoice.save();
            console.log(`✅ Invoice updated for Booking ID: ${bookingId}`);
            return true;
        } else {
            console.log(`⚠️ No invoice found for Booking ID: ${bookingId}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error updating invoice:', error);
        return false;
    }
};

// 📌 Lấy danh sách tất cả hóa đơn
const fetchAllInvoices = async () => {
    return await invoiceRepository.getAllInvoices();
};

// 📌 Lấy chi tiết hóa đơn theo ID
const fetchInvoiceById = async (id) => {
    return await invoiceRepository.getInvoiceById(id);
};

// 📌 Xuất hóa đơn dưới dạng HTML
const exportInvoiceHTML = async (id) => {
    const invoice = await invoiceRepository.getInvoiceById(id);
    if (!invoice) return null;

    return `
        <html>
            <head>
                <title>Invoice ${invoice._id}</title>
            </head>
            <body>
                <h1>Invoice Details</h1>
                <p><strong>Booking ID:</strong> ${invoice.bookingId}</p>
                <p><strong>User ID:</strong> ${invoice.userId}</p>
                <p><strong>Amount:</strong> $${invoice.amount}</p>
                <p><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
                <p><strong>Status:</strong> ${invoice.status}</p>
            </body>
        </html>
    `;
};

module.exports = { processBookingPayment, updateInvoice, fetchAllInvoices, fetchInvoiceById, exportInvoiceHTML };
