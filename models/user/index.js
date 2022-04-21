import mongoose from "mongoose";

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
    },
    active: {
        type: Boolean,
        default: false
    },
    otp: {
        value: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date,
            default: null
        }
    }
}, { timestamps: true });


module.exports = mongoose.model("user", userSchema);