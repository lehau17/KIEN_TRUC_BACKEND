const invoiceRepository = require('../repository/invoiceRepository');
const Invoice = require('../models/invoiceModel');
const { bookingDataSchema } = require('../validators/invoiceValidator');

const processBookingPayment = async (bookingData) => {
    try {
        if (typeof bookingData === 'string') {
            bookingData = JSON.parse(bookingData);
        }

        // ✅ chuẩn hóa status về lowercase trước khi validate
        bookingData.status = bookingData.status.toLowerCase();

        const { error } = bookingDataSchema.validate(bookingData);
        if (error) throw new Error('Validation failed: ' + error.details[0].message);

        const invoiceData = {
            bookingId: bookingData.bookingId,
            userId: bookingData.userId,
            amount: bookingData.amount,
            paymentMethod: bookingData.paymentMethod,
            status: 'paid',
        };

        const newInvoice = await invoiceRepository.createInvoice(invoiceData);
        console.log("✅ Invoice created successfully:", newInvoice);
        return newInvoice;
    } catch (error) {
        console.error("❌ Error processing booking payment:", error.message);
        throw error;
    }
};

const updateInvoice = async (bookingData) => {
    try {
        if (typeof bookingData === 'string') {
            bookingData = JSON.parse(bookingData);
        }

        // ✅ chuẩn hóa status về lowercase trước khi validate
        bookingData.status = bookingData.status.toLowerCase();

        const { error } = bookingDataSchema.validate(bookingData);
        if (error) throw new Error('Validation failed: ' + error.details[0].message);

        let invoice = await Invoice.findOne({ bookingId: bookingData.bookingId });

        if (invoice) {
            invoice.amount = bookingData.amount;
            invoice.paymentMethod = bookingData.paymentMethod;
            invoice.status = 'paid';
            await invoice.save();
            console.log(`✅ Invoice updated for Booking ID: ${bookingData.bookingId}`);
            return true;
        } else {
            console.log(`⚠️ No invoice found for Booking ID: ${bookingData.bookingId}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error updating invoice:', error.message);
        throw error;
    }
};


const fetchAllInvoices = async () => {
    return await invoiceRepository.getAllInvoices();
};

const fetchInvoiceById = async (id) => {
    return await invoiceRepository.getInvoiceById(id);
};

const exportInvoiceHTML = async (id) => {
    const invoice = await invoiceRepository.getInvoiceById(id);
    if (!invoice) return null;

    return `
        <html>
            <head><title>Invoice ${invoice._id}</title></head>
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

module.exports = {
    processBookingPayment,
    updateInvoice,
    fetchAllInvoices,
    fetchInvoiceById,
    exportInvoiceHTML
};
