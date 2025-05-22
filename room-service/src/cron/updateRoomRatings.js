const cron = require('node-cron');
const { Room } = require('../model');
const Review = require('../model/review.model');


cron.schedule('* * * * *', async () => {
  console.log('🕐 Cron job started: Updating room ratings');

  try {
    // Lấy tất cả các phòng
    const rooms = await Room.find();

    for (const room of rooms) {
      // Lấy tất cả review của phòng đó
      const reviews = await Review.find({ roomId: room._id });

      if (reviews.length === 0) {
        room.rating = 5; // hoặc 0 tuỳ yêu cầu
      } else {
        // Tính trung bình rating
        const avgRating =
          reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

        room.rating = parseFloat(avgRating.toFixed(1));
      }

      await room.save();
    }

    console.log('✅ Room ratings updated successfully');
  } catch (err) {
    console.error('❌ Error updating room ratings:', err);
  }
});
