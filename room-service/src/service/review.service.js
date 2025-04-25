const Review = require("../model/review.model");
const ErrorWithStatus = require("../utils/errorWithStatus.util");
const { redis, yeuCauKhoa, moKhoa } = require("../config/redis.config");
const { getOrSetCache } = require("../utils/cache.util");

class ReviewService {
    static async taoReview({ roomId, userId, comment, rating }) {
        if (!roomId || !userId || !rating) {
            throw new ErrorWithStatus("Thiếu thông tin bắt buộc!", 400);
        }

        const lockKey = `lock:reviews:room:${roomId}`;
        const lockValue = await yeuCauKhoa(lockKey, 5000, 2000, 100);
        if (!lockValue) {
            console.warn("⚠️ Không lấy được lock khi tạo review.");
            throw new ErrorWithStatus("Đang có nhiều người gửi review cùng lúc, vui lòng thử lại!", 429);
        }

        try {
            const review = new Review({ roomId, userId, comment, rating });
            await review.save();

            // Xoá cache để dữ liệu được cập nhật lại
            await redis.del(`reviews:room:${roomId}`);

            return review;
        } finally {
            await moKhoa(lockKey, lockValue);
        }
    }

    static async layDanhSachReviewTheoPhong(roomId) {
        const cacheKey = `reviews:room:${roomId}`;
        const lockKey = `lock:${cacheKey}`;

        return await getOrSetCache(cacheKey, async () => {
            const lockValue = await yeuCauKhoa(lockKey, 5000, 2000, 100);
            if (!lockValue) {
                console.warn(`⚠️ Không lấy được lock khi load reviews phòng ${roomId}`);
                return null;
            }

            try {
                return await Review.find({ roomId })
                    // .populate("userId", "name email") // mở nếu cần
                    .sort({ createdAt: -1 });
            } finally {
                await moKhoa(lockKey, lockValue);
            }
        }, 300); // cache 5 phút
    }

    static async xoaReview(reviewId, userId) {
        const review = await Review.findOne({ _id: reviewId, userId });
        if (!review) {
            throw new ErrorWithStatus("Không tìm thấy hoặc không có quyền xoá!", 403);
        }

        await review.deleteOne();

        // Xoá cache liên quan đến room
        await redis.del(`reviews:room:${review.roomId}`);

        return review;
    }


    static async capNhatReview(reviewId, userId, updateData) {
        const review = await Review.findOne({ _id: reviewId, userId });
        if (!review) throw new ErrorWithStatus("Không tìm thấy hoặc không có quyền cập nhật!", 403);

        if (updateData.comment !== undefined) review.comment = updateData.comment;
        if (updateData.rating !== undefined) review.rating = updateData.rating;

        await review.save();

        // Xoá cache liên quan
        await redis.del(`reviews:room:${review.roomId}`);

        return review;
    }
}

module.exports = ReviewService;
