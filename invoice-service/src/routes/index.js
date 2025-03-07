import express from "express";
import authRouter from "./auth.router.js";
import invoiceRoutes from "./invoiceRoutes.js";

const mainRouter = express.Router();

// auth
mainRouter.use("/auth", authRouter);

// invoice
mainRouter.use("/invoices", invoiceRoutes);

export default mainRouter;
