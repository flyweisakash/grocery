import express from "express";
import { checkEmail, checkGST, checkPhone, register } from "../../controllers/vendor/auth";
const router = express.Router();

// Register the vendor account
// before do check the email, phone and GST number
// they should be unique
router.post("/regiter", checkEmail, checkPhone, checkGST, register);

// login the vendor account

