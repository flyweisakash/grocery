"use strict"
import dotenv from "dotenv";
dotenv.config();

// required environment variables
[
    "TWILIO_SID",
    "TWILIO_TOKEN",
    "TWILIO_PHONE",
    "JWT_SECRET",
    "SENDGRID_API_KEY"
].forEach(name => {
    if(!process.env[name]) {
        throw new Error(`Environment variable ${name} is missing`);
    }
});

const config = {
    auth: {
        jwtSecret: process.env.JWT_SECRET
    },
    twilio: {
        sid: process.env.TWILIO_SID,
        token: process.env.TWILIO_TOKEN,
        phone: process.env.TWILIO_PHONE
    },
    sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY
    }
}

module.exports = config;



