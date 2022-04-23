import { User, OTP } from "../../models/user";
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
                return res.status(500).json({
                    status: 500,
                    data: null,
                    errors: true,
                    message: "There was an error while processing your request"
                });
            }
            /// if the user is not found
            if (user == null) {
                req.isRegistered = false;
                req.user.email = email;
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
                return res.status(500).json({
                    status: 500,
                    data: null,
                    errors: true,
                    message: "There was an error while processing your request"
                });
            }
            // if the user is not found
            if (user == null) {
                req.isRegistered = false;
                req.user.phone = phone;
            } else {
                // if the user found
                req.user = user;
                req.isRegistered = true;
                req.isPhone = true;
            }

            next();
        });
    } else {
        return res.status(400).json({
            status: 400,
            data: null,
            errors: true,
            message: "Please provide email or phone number"
        });
    }
};

// Register
export async function register(req, res) {

    // If the user is already register
    // send the response
    if (req.isRegistered) {
        return res.status(400).json({
            status: 400,
            data: null,
            errors: true,
            message: "User already registered"
        });
    }

    // Destruct the user details
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
            return res.status(500).json({
                status: 500,
                data: null,
                errors: true,
                message: "There was an error to process the request"
            });
        }

        // Send the response when the user is successfully registered
        return res.status(200).json({
            status: 200,
            data: user,
            errors: null,
            message: "User registered successfully"
        });
    });

}


// ************************** OTP authentication ************************************
//Send OTP to verify the user account
export async function sendOTP(req, res) {

    // Generate 4 digits OTP
    let value = Math.floor(1000 + Math.random() * 9000);
    let expiresAt = Date.now() + 600000; // 10 minutes

    // Save the OTP value and expiration time 
    // along with either email or phone number
    // if the email is provided then save email as otp _id
    // otherwise save the phone
    const otp = {
        user: req.isEmail ? req.user.email : req.isPhone && req.user.phone,
        value,
        expiresAt
    };

    // Save the OTP in the databases so that it clould be verified later
    const _otp = OTP(otp);
    // Save the OTP
    await _otp.save((err, otp) => {
        // if there is an error
        if (err) {
            console.log(err);
            return res.status(500).json({
                status: 500,
                data: null,
                errors: true,
                message: "There was an error while processing your request"
            });
        }
        // after saving the OTP, send the OTP to the user
        // Send the OTP to the user
        if (req.isEmail) {
            // If the user provided email to login
            sendEmail("OTP", `Your OTP is ${value}`, req.user.email)
                .then(() => {
                    // Send the response
                    return res.status(200).json({
                        status: 200,
                        data: { otpId: otp._id, isRegistered: req.isRegistered },
                        errors: false,
                        message: "OTP sent successfully"
                    });
                }).catch(err => {
                    // If there is an error while sending the email
                    console.log(err);
                    // Send the response
                    return res.status(500).json({
                        statu: 500,
                        data: null,
                        errors: true,
                        message: "Failed to send OTP on email"
                    })
                });
        } else if (req.isPhone) {
            // if the user provided the phone number to login
            sendSMS(`Your OTP is ${value}`, req.user.phone)
                .then(() => {
                    // Send the response on success
                    return res.status(200).json({
                        status: 200,
                        data: { otpId: otp._id, isRegistered: req.isRegistered },
                        errors: false,
                        message: "OTP sent successfully"
                    });
                }).catch(err => {
                    // If there is an error while sending the SMS
                    console.log(err);
                    // Send the response
                    return res.status(500).json({
                        status: 500,
                        data: null,
                        errors: true,
                        message: "Failed to send OTP on phone"
                    });
                });
        }
    });
};


//Verify the otp
export async function verifyOTP(req, res, next) {

    // grab the otpId and otp to verify in the database
    let _id = req.body.otpId;
    let _otp = req.body.otp;

    // the user will be etiher user email or phone
    // to will use to delete all the OTP created by user
    let user = req.isEmail ? req.user.email : req.isPhone && req.user.phone;

    // if the otp is not provided
    if (_otp == undefined || _otp == null || _otp == "") {
        // return the status 400 with error message
        return res.status(400).json({
            status: 400,
            data: null,
            errors: true,
            message: "Please provide the OTP"
        });
    };

    // if the otpid is not provided
    if (_id == undefined || _id == null || _id == "") {
        // return the status 400 with error message
        return res.status(400).json({
            status: 400,
            data: null,
            errors: true,
            message: "otpId not provided"
        });
    };

    // Find the OTP in the database
    // here the id is either user email or phone
    OTP.findOne({ _id }, (err, otp) => {
        // if there is an error
        if (err) {
            console.log(err);
            return res.status(500).json({
                status: 500,
                data: null,
                errors: true,
                message: "There was an error while processing your request"
            });
        }

        // if the OTP is not found
        if (!otp) {
            // return the status 400 with error message
            return res.status(400).json({
                status: 400,
                data: null,
                errors: true,
                message: "OTP not found in database"
            });
        }

        // if the OTP is expired
        if (otp.expiresAt < Date.now()) {
            // return the status 400 with error message
            return res.status(400).json({
                status: 400,
                data: null,
                errors: true,
                message: "OTP expired"
            });
        }

        //if the OTP is not valid
        if (parseInt(otp.value) != parseInt(_otp)) {
            return res.status(401).json({
                status: 401,
                body: null,
                errors: true,
                message: "Invald OTP"
            });
        }

        // if the OTP is valid
        if (parseInt(otp.value) == parseInt(_otp)) {

            //Once the OTP is verified, delete the data from databases
            // either using user's email or phone
            // the id will contain the either user email or phone
            OTP.deleteMany({ user }, (err, otp) => {
                // if there is an error
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        status: 500,
                        data: null,
                        errors: true,
                        message: "There was an error while processing your request"
                    });
                }

                // pass the control to the next middleware
                next();
            });
        }
    });
}

// Login the user after verifying the OTP
export async function login(req, res) {

    //Check whether the user is registered or not
    // if the user is not registered, send the status 400 with error message
    if (req.isRegistered == false) {
        return res.status(400).json({
            status: 400,
            data: null,
            errors: true,
            message: "User is not registered"
        });
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
        status: 200,
        data: {
            _id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            phone: req.user.phone,
            refreshToken,
            accessToken
        },
        errors: false,
        message: "Successfully loggedIn"
    });

};

// Check if the user is loggedIn
export async function isLoggedIn(req, res, next) {

    // When authorization is provided
    const authToken = req.headers.authorization;

    // when no tokens cookie is found
    if (!req.cookies.tokens || !authToken) {
        return res.status(401).json({
            status: 401,
            data: null,
            errors: true,
            message: "Unauthorized"
        });
    }

    // When the authorization tokens are not provided
    if (req.cookies.tokens == undefined || authToken == "") {
        return res.status(401).json({
            status: 401,
            data: null,
            errors: true,
            message: "No authorization token is provided"
        });
    }

    // When the authorization tokens are provided
    const tokens = {};

    if (!!authToken) {
        if (authToken.substr(0, 6) != "Bearer") {
            return res.status(401).json({
                status: 401,
                data: null,
                errors: true,
                message: "Bearer is missing from the token"
            });
        } else {
            tokens.accessToken = authToken.substr(8, authToken.length - 1);
        }
    } else if (req.cookies.tokens) {
        tokens = JSON.parse(req.cookies.tokens);
    }

    // Destruct the AccessToken and refreshToken
    const accessToken = tokens.accessToken;

    //Verify the accessToken and refreshToken
    // Decode the information from the accessToken
    authenticateToken(accessToken, (err, data) => {
        if (err) {
            // If the accessToken is not valid
            console.log(err);
            res.clearCookie("tokens");
            return res.status(403).json({
                status: 403,
                data: null,
                errors: true,
                message: "Access token has expired, please login again"
            });
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
        return res.status(401).json({
            status: 401,
            data: null,
            errors: true,
            message: "Invalid authorization token"
        });
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
        return res.status(400).json({
            status: 400,
            data: null,
            errors: true,
            message: "Refresh Token is not provided"
        });
    }

    // When the refresh token is provided
    // Verify the refresh token
    authenticateToken(refreshToken, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(403).json({
                status: 403,
                data: null,
                errors: true,
                message: "Refresh token is not valid"
            });
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
        return res.sendStatus({
            status: 200,
            data: {
                _id: req.user._id,
                fullName: req.user.fullName,
                email: req.user.email,
                phone: req.user.phone,
                refreshToken,
                accessToken
            },
            errors: false,
            message: "Successfully Created new Access Token"
        });
    });
}

// Logout the user
export async function logout(req, res) {
    // clear the cookie and send the response
    res.clearCookie("tokens");
    // send the response
    return res.status(200).json({
        status: 200,
        data: null,
        errors: false,
        message: "Logged out successfully"
    });
}