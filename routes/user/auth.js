import express from "express";
const router = express.Router();

// Logic and controllers to perform the operation on the data
import {
    generateNewToken,
    isRegistered,
    login,
    logout,
    register,
    sendOTP,
    verifyAccount,
    verifyOTP
} from "../../controllers/user/auth";


// Login and Register routes
// Before anything, do verify whether the user is registred or not
// Send the OTP to emial or phone
router.post("/send-otp", isRegistered, sendOTP);
// Verify the OTP and then login the user
router.post("/login", isRegistered, verifyOTP, login);
// Register the user
router.post("/register", isRegistered, register);
// verify the user account, when user register the account
router.post("/verify-account", isRegistered, verifyOTP, verifyAccount);
// Generate new Access token when it gets expired
// userId and the refreshToken should be provided in order to generate new token
router.post("/generate-new-token", generateNewToken);
// Logout the user
// Set the token value to null in the database, when logout the user
router.get("/logout", logout);

// Export the router
module.exports = router;

