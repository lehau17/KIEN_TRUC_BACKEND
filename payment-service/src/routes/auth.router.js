import express from "express";
import { createUserController, loginController } from "../controller/auth.controller.js";
import { wrapperRequest } from "../utils/wrapperRequest.js";

 const authRouter = express.Router();

authRouter.post("/register", wrapperRequest(createUserController));
authRouter.post("/login", wrapperRequest(loginController));


export default authRouter
