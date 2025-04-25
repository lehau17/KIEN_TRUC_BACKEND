const express = require("express");

const invoiceRoutes = require("./invoiceRoutes");

const mainRouter = express.Router();

mainRouter.use("/api/invoices", invoiceRoutes);

module.exports = { mainRouter };








