const express = require('express');
const app = express();
const port = 8080;

// Dữ liệu giả lập để trả về từ API
const bookingsData = {
  bookings: [
    {
      "bookingId": '1',
      "userId": 'user123',
      "roomId": 'room456',
      "amount": "500",
      "paymentMethod": 'credit_card',
      "status": 'confirmed',
    },
    {
      "bookingId": '2',
      "userId": 'user789',
      "roomId": 'room321',
      "amount": "300",
      "paymentMethod": 'paypal',
      "status": 'pending',
    },
  ],
};

// Định nghĩa route GET để trả về dữ liệu giả lập
app.get('/api/bookings', (req, res) => {
  res.status(200).json(bookingsData);  // Trả về dữ liệu bookings giả lập dưới dạng JSON
});

// Lắng nghe tại port 8080
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
