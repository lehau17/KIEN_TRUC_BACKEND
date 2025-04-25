const axios = require('axios');
const axiosRetry = require('axios-retry').default;

// Hàm tính thời gian chờ giữa các lần thử lại (dùng thuật toán exponential backoff)
// retryCount = số lần thử lại hiện tại (bắt đầu từ 1)
// Trả về: thời gian chờ tính bằng milliseconds (ms)
const exponentialDelay = (retryCount) => {
    return Math.pow(2, retryCount) * 1000;  // 1000ms, 2000ms, 4000ms...
};

// Hàm cấu hình retry cho một instance của axios
const configureRetry = (axiosInstance) => {
    axiosRetry(axiosInstance, {
        retries: 3,  // Số lần thử lại tối đa (nếu vẫn lỗi sau 3 lần thì throw lỗi)
        retryDelay: exponentialDelay,  // Dùng hàm exponentialDelay để tăng dần thời gian chờ

        // Điều kiện để thử lại (retryCondition):
        retryCondition: (error) => {
            return (
                // 1. Lỗi mạng như: không kết nối được, bị từ chối kết nối (ECONNREFUSED)
                // 2. Lỗi timeout (code === 'ECONNABORTED')
                // 3. Server trả về lỗi 500 (Internal Server Error) trong khi gọi GET
                axiosRetry.isNetworkOrIdempotentRequestError(error) || 
                error.code === 'ECONNABORTED' || 
                error.response?.status === 500
            );
        }
    });

    // Thêm interceptor để log ra thông tin mỗi khi retry
    axiosInstance.interceptors.request.use((config) => {
        const retryCount = config['axios-retry']?.retryCount || 0;
        if (retryCount > 0) {
            console.log(`🔁 Đang thử lại lần #${retryCount} cho đường dẫn ${config.url}`);
        }
        return config;
    });
};

module.exports = { configureRetry };
