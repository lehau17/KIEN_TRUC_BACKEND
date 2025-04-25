const mongoose = require("mongoose");


// co them danh gia phong 
const ReviewSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    userId: { type : String, require:true },
    comment: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
