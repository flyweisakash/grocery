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
    verifyOTP
} from "../../controllers/user/auth";


// Login and Register routes
// Before anything, do verify whether the user is registred or not
// Register the user by verifying the OTP
router.post("/initiate", isRegistered, sendOTP);
// if the user is not register, then register the user
// verify the OTP before save the user in the database
router.post("/register", isRegistered, verifyOTP, register);
// Verify the OTP and then login the user
router.post("/login", isRegistered, verifyOTP, login);
// Generate new Access token when it gets expired
// userId and the refreshToken should be provided in order to generate new token
router.post("/generate-new-token", generateNewToken);
// Logout the user
// Set the token value to null in the database, when logout the user
router.get("/logout", logout);

// Export the router
module.exports = router;

