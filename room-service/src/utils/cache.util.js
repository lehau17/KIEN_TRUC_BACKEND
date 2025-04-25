const redis = require("../config/redis.config");

async function getOrSetCache(key, fetchFunction, ttl = 300) {
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached);
    }

    const freshData = await fetchFunction();
    await redis.set(key, JSON.stringify(freshData), 'EX', ttl); // TTL in seconds
    return freshData;
}

module.exports = { getOrSetCache };
