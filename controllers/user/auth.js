import User from "../../models/user";
import { generateAccessToken, generateRefreshToken, authenticateToken } from "./services/auth";
import { sendSMS, sendEmail } from "./services/otp";

//Check if the user account is already registered or not using email or phone number
export async function isRegistered(req, res, next) {
    // Validate user login either using email or phone
    // When the email address is provided to login
    if (req.body.email != undefined) {
        // grab the email
        let email = req.body.email;

        // Check whether the provided email is valid email
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(401).json({ "error": "Invalid email address" });
        }

        // Find the user by email
        User.findOne({ email }).exec((err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ "error": "There was an error to process the request" });
            }
            /// if the user is not found
            if (user == null) {
                req.isRegistered = false;
            } else {
                // if the user found
                req.user = user;
                req.isRegistered = true;
                req.isEmail = true;
            }

            next();
        });
        //Check using phone number
    } else if (req.body.phone != undefined) {
        // when phone number is provided to login
        let phone = req.body.phone;

        // Check whether the provided phone number is valid phone number
        if (!/^\+91\d{10}$/.test(phone)) {
            return res.status(401).json({ "error": "Invalid phone number" });
        }

        // Find the user by phone number
        User.findOne({ phone }).exec((err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ "error": "There was an error to process the request" });
            }
            // if the user is not found
            if (user == null) {
                req.isRegistered = false;
            } else {
                // if the user found
                req.user = user;
                req.isRegistered = true;
                req.isPhone = true;
            }

            next();
        });
    } else {
        return res.status(400).json({ "error": "Please provide email or phone" });
    }
}


// ************************** OTP authentication ************************************
//Send OTP to verify the user account
export async function sendOTP(req, res) {

    // if the user is not registered
    // return the status 400 with error message
    if (req.isRegistered == false) {
        return res.status(400).json({ "error": "User is not registered" });
    }

    // When the user is registered
    if (req.isRegistered) {
        // Generate 4 digits OTP
        let value = Math.floor(1000 + Math.random() * 9000);
        let expiresAt = Date.now() + 600000; // 10 minutes

        // Save the OTP value and expiration time to the user
        const otp = {
            value, expiresAt
        }

        // Save the OTP to the users account databased
        // to verify the user account without password
        User.findByIdAndUpdate({ _id: req.user._id }, { otp }, { new: true }).exec((err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ "error": "There was an error to process the request" });
            }
            // if the user is not found
            if (user == null) {
                return res.status(400).json({ "error": "User is not registered" });
            } else {
                // if the user found
                // Send the OTP to the user
                if (req.isEmail) {
                    // If the user provided email to login
                    sendEmail("OTP", `Your OTP is ${value}`, user.email).then(() => {
                        return res.status(200).json({ "message": "OTP sent successfully" });
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).json({ "error": "There was an error to send the OTP" });
                    });
                } else if (req.isPhone) {
                    // if the user provided the phone number to login
                    sendSMS(`Your OTP is ${value}`, user.phone).then(() => {
                        return res.status(200).json({ "message": "OTP sent successfully" });
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).json({ "error": "There was an error to send the OTP" });
                    });
                }
            }
        });
    }
}

//Verify the otp
export async function verifyOTP(req, res, next) {
    // if the user is not registered
    // return the status 400 with error message
    if (req.isRegistered == false) {
        return res.status(400).json({ "error": "User is not registered" });
    }

    // When the user is registered
    if (req.isRegistered) {
        // grab the otp
        let otp = req.body.otp;
        // if the otp is not provided
        if (otp == undefined) {
            return res.status(400).json({ "error": "OTP is not provided" });
        }
        // if the otp is not equal to the saved otp
        if (parseInt(otp) != req.user.otp.value) {
            return res.status(400).json({ "error": "OTP is not valid" });
        }

        // if the otp has expired
        if (req.user.otp.expiresAt < Date.now()) {
            return res.status(400).json({ "error": "OTP has expired" });
        }

        // if the OTP is valid
        next();
    }
}

// Verify the account via OTP and update the account status
// Update the Active status to true
// Once the account is verified, login the user and generate the access token
export async function verifyAccount(req, res, next) {
    // if the user is not registered
    // return the status 400 with error message
    if (req.isRegistered == false) {
        return res.status(400).json({ "error": "User is not registered" });
    }

    // When the user is registered
    if (req.isRegistered) {
        // Update the account status to verified
        User.findByIdAndUpdate({ _id: req.user._id }, { active: true }, { new: true }).exec((err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ "error": "There was an error to process the request" });
            }
            // if the user is not found
            if (user == null) {
                return res.status(400).json({ "error": "User is not registered" });
            } else {
                // if the user found, login the user and generate the access token
                req.user = user;
                next();
            }
        });
    }
}

// Login
export async function login(req, res) {

    // Check whether the user account is active or not
    if (req.user.active == false) {
        return res.status(400).json({ "error": "Account is not verified" });
    }

    //Check whether the user is registered or not
    // if the user is not registered, send the status 400 with error message
    if (req.isRegistered == false) {
        return res.status(400).json({ "error": "User is not registered" });
    }

    // user object
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email
    }

    //Send the Final Response
    /* Generate the Access and Refresh token */

    //Access Token
    // Access token will expire in 60 minutes
    let accessToken = generateAccessToken(user);
    // Refresh Token
    // Refresh token does not expire until the user logs out
    let refreshToken = generateRefreshToken(user);

    // Set the cookie
    res.cookie(
        "tokens",
        JSON.stringify({ accessToken, refreshToken }),
        { expires: new Date(Date.now() + 48 * 60 * 60 * 1000) }
    );
    
    // Send the response including user object
    // user object is attatched with the req object
    return res.status(200).json({
        _id: req.user._id,
        fullName:  req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        refreshToken
    });

};

// Register
export async function register(req, res) {

    // If the user is already register
    // send the response
    if (req.isRegistered) {
        return res.status(400).json({ "error": "User already registered" });
    }

    const { fullName, email, phone } = req.body;

    // New user document
    let user = User({
        fullName,
        email,
        phone
    });

    // Save the document
    await user.save((err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ "error": "There was an error to process the request" });
        }

        return res.status(200).json(user);
    });

}

// Check if the user is loggedIn
export async function isLoggedIn(req, res, next) {

    // when no tokens cookie is found
    if (!req.cookies.tokens) {
        return res.status(401).json({ "error": "Unauthorized" });
    }

    // When the authorization tokens are not provided
    if (req.cookies.tokens == undefined) {
        return res.status(401).json({ "error": "No authorization token is provided" });
    }

    // When the authorization tokens are provided
    const tokens = JSON.parse(req.cookies.tokens);
    // Destruct the AccessToken and refreshToken
    const accessToken = tokens.accessToken;

    //Verify the accessToken and refreshToken
    // Decode the information from the accessToken
    authenticateToken(accessToken, (err, data) => {
        if (err) {
            // If the accessToken is not valid
            console.log(err);
            res.clearCookie("tokens");
            return res.status(403).json({ "error": "Access token has expired, please login again" });
        }
        // attatch with the auth object in the request
        req.auth = data;
        next();
    });

}

// Check if the user is authenticated
export async function isAuthenticated(req, res, next) {
    // When provided authorization token is not valid
    // Match the decoded information from the AccessToken
    // against the user information
    if (req.user._id != req.auth._id) {
        return res.status(401).json({ "error": "Invalid authorization token" });
    }

    // When the authorization token is valid
    if (req.user._id == req.auth._id) {
        next();
    }
}

// When the Acces token expires
export async function generateNewToken(req, res) {
    // get the refresh token
    const refreshToken = req.body.refreshToken;
    // when the refresh token is not provided
    if (refreshToken == undefined) {
        return res.status(400).json({ "error": "Refresh token is not provided" });
    }

    // When the refresh token is provided
    // Verify the refresh token
    authenticateToken(refreshToken, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ "error": "Refresh token is not valid" });
        }
        // When the refresh token is valid
        // Generate the new Access token
        // Attach the new tokens to the response
        let accessToken = generateAccessToken(data);
        // Set the cookie
        res.cookie(
            "tokens",
            JSON.stringify({ accessToken, refreshToken }),
            { expires: new Date(Date.now() + 48 * 60 * 60 * 1000) }
        );
        // Send the response status OK
        return res.sendStatus(200);
    });
}

// Logout the user
export async function logout(req, res) {
    // clear the cookie and send the response
    res.clearCookie("tokens");
    return res.status(200).json({ "message": "Logged out successfully" });
}