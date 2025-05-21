require('dotenv').config();
const express = require('express');
const {mainRouter} = require("./routes");
const { connectDB } = require('./config/db');
const { listenToBookingEvents } = require('./services/eventListener');
const paymentController = require('./controllers/paymentController');
const cors = require('cors');
const app = express();


app.use(cors({
  origin: 'http://127.0.0.1:5500',
}));

app.use(express.json());


app.use("/", mainRouter);

const startServer = async () => {
    await connectDB();
    await listenToBookingEvents();

    
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
};

startServer();
