require('dotenv').config();
const express = require('express');
const {mainRouter} = require("../src/routes");
const { connectDB } = require('./config/db');
const { listenToBookingEvents } = require('./services/eventListener');
const invoiceService = require('./services/invoiceService');

const app = express();
app.use(express.json());
app.use("/", mainRouter);

const startServer = async () => {
    await connectDB();
    listenToBookingEvents();

    
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`Invoice Service running on port ${PORT}`));
};

startServer();
