const {redis} = require("../config/redis.config");


// Key : key mình set dô redis
// fetchFunction : hàm mình cần gọi nếu cache không có
// thời gian sôngs của data trong cache
async function getOrSetCache(
    key, // key cua redis
    fetchFunction, // ham lay du lieu tu database
     ttl = 300 // thoi gian song cua redis
    ) {
    // 1. lay du lieu o redis
    const duLieuORedis = await redis.get(key);
    // Nếu có cache, trả về cho người dùng => dung chuong tirnh
    if (duLieuORedis != null) {
        return JSON.parse(duLieuORedis);
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
