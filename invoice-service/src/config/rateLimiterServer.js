const redisClient = require('../config/redisClient');  // Sử dụng redisClient đã cấu hình
const RATE_LIMIT_KEY = 'server:rate-limit';  // Key dùng để lưu trữ số lượng yêu cầu

const MAX_REQUESTS = 1; // Giới hạn tối đa 100 yêu cầu
const WINDOW_SIZE = 60 * 1000; // Cửa sổ thời gian 1 phút (60s)

const rateLimiterServer = async (req, res, next) => {
    const currentTime = Date.now();
    
    try {
        // Kiểm tra số yêu cầu hiện tại từ server (lưu trữ trong Redis)
        const currentCount = await redisClient.get(RATE_LIMIT_KEY);
        
        if (currentCount && currentCount >= MAX_REQUESTS) {
            // Nếu số lượng yêu cầu đã vượt quá giới hạn, trả về lỗi
            return res.status(429).json({
                message: "Server đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau một phút."
            });
        }

        // Nếu chưa vượt quá giới hạn, tăng số yêu cầu trong Redis
        await redisClient.multi()
            .incr(RATE_LIMIT_KEY) // Tăng số lượng yêu cầu
            .expire(RATE_LIMIT_KEY, WINDOW_SIZE / 1000) // Thiết lập thời gian sống của key (1 phút)
            .exec();

        // Tiến hành xử lý yêu cầu nếu chưa vượt quá giới hạn
        next();
    } catch (error) {
        console.error("❌ Error in rate limiting server:", error);
        res.status(500).json({ message: "Lỗi server khi kiểm tra rate limiting." });
    }
};

module.exports = { rateLimiterServer };
