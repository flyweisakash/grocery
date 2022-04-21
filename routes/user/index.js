import express from "express";
const router = express.Router();

// Logic and controllers to perform the operation on the data
import {
    getUserById,
    getUser,
    updateUser,
    addNewAddress,
    updateAddress,
    deleteAddress,
    getAllAddresses, getAddress
} from "../../controllers/user"
import { isAuthenticated, isLoggedIn } from "../../controllers/user/auth";

// Middleware to get the user details from the database
router.param("userId", getUserById);

// Get the user details
// getUser middleware execuated before getUser so on in the following requests
// using userId param
router.get("/:userId", isLoggedIn, isAuthenticated, getUser);
// Update the user details
router.put("/:userId", isLoggedIn, isAuthenticated, updateUser);
// Add new address
router.post("/:userId/address", isLoggedIn, isAuthenticated, addNewAddress);
// Update the address
router.put("/:userId/address/:addressId", isLoggedIn, isAuthenticated, updateAddress);
// Delete the address
router.delete("/:userId/address/:addressId", isLoggedIn, isAuthenticated, deleteAddress);
// Get all the addresses
router.get("/:userId/address", isLoggedIn, isAuthenticated, getAllAddresses);
// Get the address
router.get("/:userId/address/:addressId", isLoggedIn, isAuthenticated, getAddress);

// Export the router
module.exports = router;
