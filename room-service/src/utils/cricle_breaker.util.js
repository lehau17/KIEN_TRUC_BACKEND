const CircuitBreaker = require('opossum');



function createBreaker(
    asyncFn, // hàm cần theo dõi trạng thái
     options = {}
    ) {
  const breaker = new CircuitBreaker(asyncFn, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
    ...options,
  });

  breaker.on('open', () => console.warn('⚡ Circuit opened'));
  breaker.on('halfOpen', () => console.log('🟡 Half open - thử lại'));
  breaker.on('close', () => console.log('✅ Circuit closed - bình thường trở lại'));

  return breaker;
}

module.exports = createBreaker;