import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Fullname is required"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email address is required"]
    },
    phone: {
        type: String,
        unique: true,
        required: [true, "Phone number is required"]
    }
}, { timestamps: true });

// OTP Schema
// save the either user email or phone as OTP id to verify and otp
// and delete the OTP when not longer needed
const otpSchema = new mongoose.Schema({
    user: {
        type: String,
        unique: false,
        required: [true, "User details is required"]
    },
    value: {
        type: Number,
        required: [true, "OTP is required"]
    },
    expiresAt: {
        type: Date,
        required: [true, "Expiry time is required"]
    }
}, { timestamps: true });

// export User and OTP Schema
export const User = mongoose.model("User", userSchema);
export const OTP = mongoose.model("OTP", otpSchema);

module.exports = { User, OTP };