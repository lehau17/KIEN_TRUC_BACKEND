const CircuitBreaker = require('opossum');



function createBreaker(
    asyncFn,
    options = {}
) {
    const breaker = new CircuitBreaker(asyncFn, {
        timeout: 3000, //Thời gian tối đa để một request hoàn thành.
        errorThresholdPercentage: 50, // ti le loi
        resetTimeout: 10000, //Sau khi breaker mở (OPEN), đợi bao lâu để chuyển sang trạng thái thử lại (HALF_OPEN).
        rollingCountTimeout: 10000, //Tổng khoảng thời gian sliding window được dùng để tính toán tỷ lệ lỗi.
        rollingCountBuckets: 10, // được chia thành bao nhiêu phần nhỏ (bucket) để thống kê
        ...options,
    });

    breaker.on('open', () => console.warn('⚡ Circuit opened'));
    breaker.on('halfOpen', () => console.log('🟡 Half open - thử lại'));
    breaker.on('close', () => console.log('✅ Circuit closed - bình thường trở lại'));

    return breaker;
}

module.exports = createBreaker;
