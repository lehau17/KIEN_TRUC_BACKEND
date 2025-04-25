import Redis from 'ioredis';

// ⚡️ Khởi tạo Redis client
export const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
});

// ⚡️ Hàm yêu cầu khoá redis
export async function yeuCauKhoa(
    key: string,
    ttl: number = 5000,       // TTL khóa (ms)
    timeout: number = 2000,    // thời gian tối đa chờ lấy được khoá (ms)
    delay: number = 100        // thời gian chờ giữa 2 lần thử lấy khóa (ms)
): Promise<string | null> {
    const value = Date.now().toString();
    const end = Date.now() + timeout;

    while (Date.now() < end) {
        const acquired = await redis.set(key, value, 'PX', ttl, 'NX');
        if (acquired) {
            return value; // ✅ Lấy được khoá
        }
        await sleep(delay); // đợi 1 khoảng rồi thử lại
    }

    return null; // ❌ Không lấy được khoá sau timeout
}

// ⚡️ Hàm mở khóa redis
export async function moKhoa(
    key: string,
    value: string,
) {
    const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
    await redis.eval(script, 1, key, value);
}

// ⚡️ Sleep helper
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
