const rateLimit = require("express-rate-limit");

const invoiceRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 10, // Giới hạn 10 yêu cầu mỗi phút
    message: "Quá nhiều yêu cầu. Vui lòng thử lại sau một phút."
});

module.exports = { invoiceRateLimiter };
