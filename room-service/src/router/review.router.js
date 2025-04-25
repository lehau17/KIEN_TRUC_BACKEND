// routes/review.router.js
const express = require("express");
const { wrapperRequestHandler } = require("../utils");
const ReviewController = require("../controller/review.controller");

const reviewRouter = express.Router();

reviewRouter.post("/", wrapperRequestHandler(ReviewController.taoReview));
reviewRouter.get("/:roomId", wrapperRequestHandler(ReviewController.layDanhSachReviewTheoPhong));
reviewRouter.delete("/:reviewId", wrapperRequestHandler(ReviewController.xoaReview));

module.exports = reviewRouter;
