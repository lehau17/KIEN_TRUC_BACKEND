const express = require("express");

const paymentRoutes = require("./paymentRoutes");

const mainRouter = express.Router();

mainRouter.use("/api/payment", paymentRoutes);

module.exports = { mainRouter };








