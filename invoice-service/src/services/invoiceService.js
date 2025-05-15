const invoiceRepository = require('../repository/invoiceRepository');
const Invoice = require('../models/invoiceModel');
const { bookingDataSchema } = require('../validators/invoiceValidator');
const redisClient = require('../config/redisClient');
const { wrapWithBreaker } = require('../config/circuitBreaker');
const axios = require('axios');
const axiosInstance = require('../config/axiosConfig');

const CACHE_TTL = 10; //10s




// ✅ Tạo hóa đơn mới
const processBookingPayment = async (bookingData) => {
    try {
        if (typeof bookingData === 'string') {
            bookingData = JSON.parse(bookingData);
        }

        bookingData.status = bookingData.status.toLowerCase();
        const { error } = bookingDataSchema.validate(bookingData);
        if (error) throw new Error('Validation failed: ' + error.details[0].message);

        const invoiceData = {
            bookingId: bookingData.bookingId,
            userId: bookingData.userId,
            amount: bookingData.amount,
            paymentMethod: bookingData.paymentMethod,
            status: 'paid',
            roomId: bookingData.roomId
        };

        const newInvoice = await invoiceRepository.createInvoice(invoiceData);

        // ❌ Xóa cache liên quan
        await redisClient.del(`invoice:all`);
        await redisClient.del(`invoice:booking:${bookingData.bookingId}`);

        console.log("✅ Invoice created successfully:", newInvoice);
        return newInvoice;
    } catch (error) {
        console.error("❌ Error processing booking payment:", error.message);
        throw error;
    }
};

// ✅ Cập nhật hóa đơn
const updateInvoice = async (bookingData) => {
    try {
        if (typeof bookingData === 'string') {
            bookingData = JSON.parse(bookingData);
        }

        bookingData.status = bookingData.status.toLowerCase();
        const { error } = bookingDataSchema.validate(bookingData);
        if (error) throw new Error('Validation failed: ' + error.details[0].message);

        let invoice = await Invoice.findOne({ bookingId: bookingData.bookingId });

        if (invoice) {
            invoice.amount = bookingData.amount;
            invoice.paymentMethod = bookingData.paymentMethod;
            invoice.status = 'paid';
            await invoice.save();

            // ❌ Xóa cache
            await redisClient.del(`invoice:${invoice._id}`);
            await redisClient.del(`invoice:export:${invoice._id}`);
            await redisClient.del(`invoice:booking:${bookingData.bookingId}`);
            await redisClient.del(`invoice:all`);

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

// ✅ Lấy tất cả hóa đơn (có cache)
const fetchAllInvoices = wrapWithBreaker(async () => {
    const cacheKey = `invoice:all`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log(`🔁 Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
    }

    const invoices = await invoiceRepository.getAllInvoices();
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(invoices));
    return invoices;
}, 'fetchAllInvoices');


// ✅ Lấy hóa đơn theo ID (có cache)
const fetchInvoiceById = wrapWithBreaker(async (id) => {
    const cacheKey = `invoice:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log(`🔁 Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
    }

    const invoice = await invoiceRepository.getInvoiceById(id);
    if (invoice) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(invoice));
    }

    return invoice;
}, 'fetchInvoiceById');


// ✅ Xuất HTML hóa đơn (có cache)
const exportInvoiceHTML = wrapWithBreaker(async (id) => {
    const cacheKey = `invoice:export:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log(`🔁 HTML cache hit for ${cacheKey}`);
        return cached;
    }

    const invoice = await invoiceRepository.getInvoiceById(id);
    if (!invoice) return null;

    const html = `
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

    await redisClient.setEx(cacheKey, CACHE_TTL, html);
    return html;
}, 'exportInvoiceHTML');


// ✅ Tạo hóa đơn mới
const createInvoice = async (invoiceData) => {
    try {
        // Kiểm tra và validate dữ liệu
        const { error } = bookingDataSchema.validate(invoiceData);
        if (error) throw new Error('Validation failed: ' + error.details[0].message);

        // Tạo hóa đơn mới từ dữ liệu đầu vào
        const newInvoice = new Invoice({
            bookingId: invoiceData.bookingId,
            userId: invoiceData.userId,
            roomId: invoiceData.roomId,
            amount: invoiceData.amount,
            paymentMethod: invoiceData.paymentMethod,
            status: 'unpaid', // Mặc định là chưa thanh toán
        });

        // Lưu hóa đơn vào cơ sở dữ liệu
        await newInvoice.save();

        // ❌ Xóa cache liên quan đến hóa đơn (nếu có)
        await redisClient.del(`invoice:all`);
        await redisClient.del(`invoice:booking:${invoiceData.bookingId}`);

        console.log('✅ Invoice created successfully:', newInvoice);
        return newInvoice;
    } catch (error) {
        console.error('❌ Error creating invoice:', error.message);
        throw error;
    }
};

// ✅ Lấy danh sách hóa đơn theo userId (có cache)
const fetchInvoicesByUserId = wrapWithBreaker(async (userId) => {
    const cacheKey = `invoice:user:${userId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log(`🔁 Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
    }

    const invoices = await invoiceRepository.getInvoicesByUserId(userId);
    if (invoices) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(invoices));
    }

    return invoices;
}, 'fetchInvoicesByUserId');


// Lấy thông tin booking từ Booking Service với retry và timeout và cache Redis
const getBookingsFromBookingService = async () => {
    const cacheKey = 'bookings:data';  // Cache key cho dữ liệu bookings
    const cached = await redisClient.get(cacheKey);

    if (cached) {
        console.log(`🔁 Cache hit for ${cacheKey}`);
        return JSON.parse(cached);  // Trả về dữ liệu từ cache
    }

    try {
        // Gửi request đến Booking Service
        const response = await axiosInstance.get('/api/bookings');
        console.log('Raw response:', response.data);  // Log raw response

        // Kiểm tra nếu không có data hoặc data rỗng
        if (!response.data || !response.data.data || response.data.data.length === 0) {
            throw new Error('No bookings data received');
        }

        // Lưu vào cache Redis
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(response.data.data));

        console.log('Bookings data:', response.data.data);
        return response.data.data;
    } catch (error) {
        // Kiểm tra loại lỗi và log thông báo chi tiết
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Connection refused by Booking Service:', error.message);
        } else if (error.response) {
            // Lỗi có response từ server
            console.error(`❌ Error fetching bookings from Booking Service: ${error.response.status} - ${error.response.statusText}`);
        } else {
            // Các lỗi không liên quan đến response
            console.error('❌ Error fetching bookings from Booking Service:', error.message);
        }
        throw error;
    }
};








module.exports = {
    processBookingPayment,
    updateInvoice,
    fetchAllInvoices,
    fetchInvoiceById,
    exportInvoiceHTML,
    createInvoice,
    fetchInvoicesByUserId,
    getBookingsFromBookingService
};
