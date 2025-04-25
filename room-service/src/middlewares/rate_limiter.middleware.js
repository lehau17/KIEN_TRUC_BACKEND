const rateLimit = require('express-rate-limit');



const limiter = rateLimit.rateLimit({
    windowMs: 10000, // 10 giay
    max: 5, // Giới hạn so lượng mỗi IP
    message: {
        message  : 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'
    },
    standardHeaders: true, // Gửi thông tin trong header
    legacyHeaders: false, // Không dùng X-RateLimit headers cũ
  });


module.exports = limiter