// src/redis.js
const Redis = require('ioredis');
const { v4: uuidv4 } = require("uuid");
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));




// key : value
async function khoa(key, ttl = 5000) {
    // sinh ra giá trị ngẫu nhiên để set vào redis
    const lockValue = uuidv4();
    // set du lieu do redis
    // px : tính băng giây
    // ttl : thời gian sống
    // NX : mình chỉ cấp key trong trường hợp key đó chưa tồn tại
    const result = await redis.set(key, lockValue, "PX", ttl, "NX");

    return result === "OK" ? lockValue : null;
}





async function yeuCauKhoa(key, ttl = 5000, timeout = 2000, retryDelay = 100) {
    const start = Date.now();
    let lockValue;
    // 

    while ((Date.now() - start) < timeout) {
        lockValue = await khoa(key, ttl);
        if (lockValue) return lockValue;
        await new Promise((res) => setTimeout(res, retryDelay));
    }

    return null; // Hết thời gian chờ / Timeout
}



// không đảm bảo tính nguyên tử
// async function releaseLock(key, lockValue) {
//     const currentValue = await redis.get(key);
//     if (currentValue === lockValue) {
//       return await redis.del(key); // Chỉ xoá nếu đúng chủ nhân
//     }
//     return 0; // Không phải người giữ lock, không xoá
//   }



// đảm bảo tính nguyên tử (automic)
async function moKhoa(key, lockValue) {
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1]
      then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    return await redis.eval(luaScript, 1, key, lockValue);
}


module.exports = {
  redis,
    khoa, moKhoa, yeuCauKhoa
}








