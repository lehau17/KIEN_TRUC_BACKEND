const redis = require("../config/redis.config");


// Key : key mình set dô redis
// fetchFunction : hàm mình cần gọi nếu cache không có
// thời gian sôngs của data trong cache
async function getOrSetCache(key, fetchFunction, ttl = 300) {
    const cached = await redis.get(key);
    // Nếu có cache, trả về cho người dùng
    if (cached != null) {
        return JSON.parse(cached);
    }
    // Nếu không có, gọi hàm lấy data
    const freshData = await fetchFunction();
    // lấy đc data set lại vào cache
    if (freshData != null) {
        await redis.set(key, JSON.stringify(freshData), 'EX', ttl); // TTL in seconds
    }
    return freshData;
}

module.exports = { getOrSetCache };
