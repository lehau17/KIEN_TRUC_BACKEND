const opossum = require('opossum');

const defaultOptions = {
    timeout: 3000, // 3s timeout
    errorThresholdPercentage: 50, // nếu 50% request lỗi → mở circuit
    resetTimeout: 10000, // sau 10s sẽ thử lại
};

const wrapWithBreaker = (fn, name = 'default') => {
    const breaker = new opossum(fn, defaultOptions);

    breaker.fallback(() => {
        console.warn(`⚠️ Circuit breaker fallback for ${name}`);
        throw new Error(`Service temporarily unavailable [${name}]`);
    });

    breaker.on('open', () => console.warn(`🔌 Circuit for ${name} opened`));
    breaker.on('close', () => console.log(`🔁 Circuit for ${name} closed`));
    breaker.on('halfOpen', () => console.log(`🌓 Circuit for ${name} is half-open`));

    return breaker.fire.bind(breaker);
};

module.exports = { wrapWithBreaker };
