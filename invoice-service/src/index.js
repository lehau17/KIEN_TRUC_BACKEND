require('dotenv').config();
const express = require('express');
const invoiceRoutes = require('./routes/invoiceRoutes');
const { connectDB } = require('./config/db');
const { listenToBookingEvents } = require('./services/eventListener');
const invoiceService = require('./services/invoiceService');

const app = express();
app.use(express.json());
app.use('/api/invoices', invoiceRoutes);

const startServer = async () => {
    await connectDB();
    listenToBookingEvents();

    // Test tạo hóa đơn
    try {
        const invoiceData = {
            bookingId: "BK123456",
            userId: "USER789",
            amount: 500,
            paymentMethod: "credit_card",
            status: "paid"
        };
        const savedInvoice = await invoiceService.createNewInvoice(invoiceData);
        console.log("Hóa đơn mới đã lưu:", savedInvoice);
    } catch (error) {
        console.error("Lỗi khi tạo hóa đơn:", error);
    }

    const PORT = process.env.PORT || 5004;
    app.listen(PORT, () => console.log(`Invoice Service running on port ${PORT}`));
};

startServer();
