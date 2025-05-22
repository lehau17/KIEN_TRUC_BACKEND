const axios = require('axios');
const axiosRetry = require('axios-retry');
const createBreaker = require('../utils/cricle_breaker.util');

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:5000';

// Thiết lập retry cho axios (3 lần, delay tăng dần)
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 500, // 500ms, 1000ms, 1500ms
    retryCondition: (error) => {
        // Retry khi timeout, network error, hoặc status >= 500
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
    },
});

// Hàm gọi tới user-service
async function getUserById(userId) {
    const res = await axios.get(`${userServiceUrl}/users/${userId}`);
    return res.data;
}

// Circuit breaker
const userBreaker = createBreaker(getUserById, {
    timeout: 3000, // ms
    errorThresholdPercentage: 50,
    resetTimeout: 10000, // ms
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
