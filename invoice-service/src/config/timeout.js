// config/timeout.js
const axios = require('axios');

// Cấu hình timeout cho axios
const configureTimeout = (timeout) => {
    return {
        timeout: timeout || 5000  
    };
};

module.exports = {configureTimeout};
