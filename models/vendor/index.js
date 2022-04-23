import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuidv4";
import crypto from "crypto";

// Vendor schema
const VendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    ownerName: {
        type: String,
        required: [true, "Owner name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        verified: {
            type: Boolean,
            default: false,
        },
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        verified: {
            type: Boolean,
            default: false,
        },
    },
    gstNumber: {
        type: String,
        required: [true, "GST number is required"],
        unique: true,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    city: {
        type: String,
        required: [true, "City is required"],
    },
    state: {
        type: String,
        required: [true, "State is required"],
    },
    zip: {
        type: String,
        required: [true, "Zip is required"],
    },
    password: {
        hash: {
            type: String,
            required: [true, "Password is required"],
        },
        salt: {
            type: String,
            required: [true, "Salt is required"],
        },
    }
}, { timestamps: true });

//virtuals to make the plainPassword into a hash and salt
VendorSchema.virtual("plainPassword").get(function () {
    return this.__plainPassword;
}).set(function (value) {
    this.__plainPassword = value;
    this.password.salt = this.makeSalt();
    this.password.hash = this.encryptPassword(value, this.password.salt);
});

// encrypt password
VendorSchema.methods.encryptPassword = function (plainText, salt) {
    return crypto
        .createHmac("sha256", salt)
        .update(plainText)
        .digest("hex");
};

// make salt
VendorSchema.methods.makeSalt = function () {
    return uuidv4();
};

// authenticate user
VendorSchema.methods.authenticate = function (plainText) {
    return this.encryptPassword(plainText, this.password.salt) === this.password.hash;
};

module.exports = mongoose.model("Vendor", VendorSchema);