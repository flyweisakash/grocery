import mongoose from "mongoose";

const addressSchema = mongoose.Schema({
    user: {
        type: mongoose.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    fullName: {
        type: String,
        required: [true, "Fullname is required in the address"]
    },
    addressLine: {
        type: String,
        required: [true, "Addreess line is required"]
    },
    area: {
        type: String,
        required: [true, "Area is required in the address field"]
    },
    state: {
        type: String,
        required: [true, "State is required in the address field"]
    },
    pinCode: {
        type: String,
        required: [true, "Pin code is required in the address field"]
    },
    contact: {
        type: String,
        required: [true, "Contact is required in the address field"]
    },
    alternateContact: {
        type: String,
        required: [true, "Alternate contact is required in the address field"]
    }
}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);