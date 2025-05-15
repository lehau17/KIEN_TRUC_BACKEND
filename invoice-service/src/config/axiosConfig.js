const axios = require('axios');
const axiosRetry = require('axios-retry').default;

// Hàm tính delay giữa các lần retry (exponential backoff)
const exponentialDelay = (retryCount) => {
    return Math.pow(2, retryCount) * 1000;  // Delay = 1000ms, 2000ms, 4000ms...
};

// Cấu hình axios instance với timeout và retry
const axiosInstance = axios.create({
    baseURL: 'http://booking-service:8080', // API base URL
    timeout: 50000,  // Timeout sau 5 giây
    headers: { 'Accept': 'application/json' }  // Đảm bảo phản hồi ở dạng JSON
});

// Cấu hình retry cho axios instance
const configureRetry = () => {
    axiosRetry(axiosInstance, {
        retries: 3,  // Thử lại tối đa 3 lần
        retryDelay: exponentialDelay,  // Tính toán delay giữa các lần thử lại
        retryCondition: (error) => {
            // Retry khi gặp lỗi mạng, timeout hoặc lỗi server (5xx)
            return (
                axiosRetry.isNetworkOrIdempotentRequestError(error) ||  // Lỗi mạng
                error.code === 'ECONNABORTED' ||                        // Timeout
                error.response?.status >= 500 && error.response?.status < 600 // Lỗi server 5xx
            );
        }
    });

    // Log mỗi lần retry
    axiosInstance.interceptors.request.use((config) => {
        const retryCount = config['axios-retry']?.retryCount || 0;
        if (retryCount > 0) {
            console.log(`🔁 Retry attempt #${retryCount} for ${config.url}`);
        }
        return config;
    });
};

// Áp dụng cấu hình retry cho axios instance
configureRetry();

module.exports = axiosInstance;
