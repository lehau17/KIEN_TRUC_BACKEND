// routes/review.router.js
const express = require("express");
const { wrapperRequestHandler } = require("../utils");
const ReviewController = require("../controller/review.controller");
const authThenMiddleware = require("../middlewares/auth.middleware");

const reviewRouter = express.Router();

reviewRouter.post("/", authThenMiddleware, wrapperRequestHandler(ReviewController.taoReview));
reviewRouter.get("/:roomId", wrapperRequestHandler(ReviewController.layDanhSachReviewTheoPhong));
reviewRouter.patch("/:id", authThenMiddleware, wrapperRequestHandler(ReviewController.capNhatReview));
reviewRouter.delete("/:reviewId", authThenMiddleware, wrapperRequestHandler(ReviewController.xoaReview));

module.exports = reviewRouter;
