import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Không trùng email
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Lưu thời gian tạo
    },
});

// Xuất Model
const User = mongoose.model("User", userSchema);
export default User;
