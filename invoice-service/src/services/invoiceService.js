const invoiceRepository = require('../repository/invoiceRepository');

const fetchAllInvoices = async () => {
    return await invoiceRepository.getAllInvoices();
};

const fetchInvoiceById = async (id) => {
    return await invoiceRepository.getInvoiceById(id);
};

const createNewInvoice = async (invoiceData) => {
    return await invoiceRepository.createInvoice(invoiceData);
};

// ✅ Xử lý sự kiện booking nhận từ RabbitMQ
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

        // Tạo hóa đơn trong database
        const newInvoice = await invoiceRepository.createInvoice(invoiceData);
        console.log("✅ Invoice created successfully:", newInvoice);
        
        return newInvoice;
    } catch (error) {
        console.error("❌ Error processing booking payment:", error);
        throw error;
    }
};

module.exports = { fetchAllInvoices, fetchInvoiceById, createNewInvoice, processBookingPayment };
