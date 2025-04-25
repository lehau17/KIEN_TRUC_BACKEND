// controller/review.controller.js
const ReviewService = require("../service/review.service");
const { ObjectIdSchema } = require("../schemas/objectID.schema");
const { SuccessResponse, CreatedResponse } = require("../utils/response");
const { ReviewSchema, ReviewUpdateSchema } = require("../schemas/review.schema");

class ReviewController {
    // 📌 Tạo review
    static async taoReview(req, res, next) {
        ReviewSchema.parse(req.body)
        const { roomId, comment, rating } = req.body;
        const userId = req.user.id; // lay tu token
        const review = await ReviewService.taoReview({ roomId, userId, comment, rating });
        new CreatedResponse(review, "Đánh giá đã được tạo.").response(res);
    }

    // 📌 Lấy review theo phòng
    static async layDanhSachReviewTheoPhong(req, res, next) {
        const { roomId } = req.params;
        ObjectIdSchema.parse(roomId);
        const reviews = await ReviewService.layDanhSachReviewTheoPhong(roomId);
        new SuccessResponse(reviews, "Lấy danh sách đánh giá thành công.").response(res);
    }

    // 📌 Xoá review (chỉ chủ review)
    static async xoaReview(req, res, next) {
        const { reviewId } = req.params;
        const userId = req.user.id;
        ObjectIdSchema.parse(reviewId);
        const review = await ReviewService.xoaReview(reviewId, userId);
        new SuccessResponse(review, "Đánh giá đã xoá.").response(res);
    }


    static async capNhatReview(req, res, next) {
        const { id } = req.params;
        const userId = req.user.id;
        ObjectIdSchema.parse(id);
        const updateData = ReviewUpdateSchema.parse(req.body);

        const updatedReview = await ReviewService.capNhatReview(id, userId, updateData);
        new SuccessResponse(updatedReview, "Đánh giá đã được cập nhật.").response(res);
    }
}

module.exports = ReviewController;
