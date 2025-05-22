require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { mainRouter } = require("./routes");
const { connectDB } = require('./config/db');
const { listenToBookingEvents, listenToPaymentEvents } = require('./services/eventListener');

const app = express();

// ✅ Middleware JSON để parse body
app.use(express.json());

const corsOptions = {
    origin: '*',
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
    exposedHeaders: ["Authorization"],
    credentials: true
};

app.use(cors(corsOptions));


// Nếu dùng app.options('*', cors()), sửa tương tự:
app.options('*', cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));


// ✅ Nếu dùng middleware khác, bỏ qua OPTIONS request
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ✅ Router chính
app.use("/", mainRouter);

// ✅ Khởi động server
const startServer = async () => {
    await connectDB();
    await listenToBookingEvents();
    await listenToPaymentEvents();
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`Invoice Service running on port ${PORT}`));
};

startServer();
