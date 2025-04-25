const axios = require('axios');
const createBreaker = require('../utils/cricle_breaker.util');

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:5000';

// Hàm gọi tới user-service
async function getUserById(userId) {
    const res = await axios.get(`${userServiceUrl}/users/${userId}`);
    return res.data;
}

// Circuit breaker
const userBreaker = createBreaker(getUserById, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
});

// Hàm wrapper: gọi breaker và fallback nếu lỗi
async function safeGetUser(userId) {
    try {
        return await userBreaker.fire(userId);
    } catch (err) {
        console.warn(`⚠️ Không lấy được thông tin user ${userId}:`, err.message);
        return {
            id: userId,
            name: 'Không rõ',
            email: 'N/A',
        }; // fallback đơn giản
    }
}

module.exports = { safeGetUser };
