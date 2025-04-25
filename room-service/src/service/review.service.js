// service/review.service.js
const Review = require("../models/review.model");
const ErrorWithStatus = require("../utils/errorWithStatus.util");

class ReviewService {
    static async taoReview({ roomId, userId, comment, rating }) {
        if (!roomId || !userId || !rating) {
            throw new ErrorWithStatus("Thiếu thông tin bắt buộc!", 400);
        }

        const review = new Review({ roomId, userId, comment, rating });
        await review.save();
        return review;
    }

    static async layDanhSachReviewTheoPhong(roomId) {
        return await Review.find({ roomId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
    }

    static async xoaReview(reviewId, userId) {
        const review = await Review.findOne({ _id: reviewId, userId });
        if (!review) throw new ErrorWithStatus("Không tìm thấy hoặc không có quyền xoá!", 403);

        await review.deleteOne();
        return review;
    }
}

module.exports = ReviewService;
