const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
    roomType: { type: String, enum: ["Standard", "Deluxe", "Suite"], required: true },
    status: { type: String, enum: ["available", "booked", "maintenance"], default: "available" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        rating: { type: Number, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    discount: { type: Number, min: 0, max: 100, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room
