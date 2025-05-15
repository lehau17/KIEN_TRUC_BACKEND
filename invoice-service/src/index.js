require('dotenv').config();
const express = require('express');
const { mainRouter } = require("./routes");
const { connectDB } = require('./config/db');
const { listenToBookingEvents } = require('./services/eventListener');


const app = express();

app.use("/", mainRouter);

const startServer = async () => {
    await connectDB();
    await listenToBookingEvents();


    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`Invoice Service running on port ${PORT}`));
};

startServer();
