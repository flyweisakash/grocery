'use strict'
import dotenv from "dotenv";
dotenv.config();

// required environment variables
[
    "PORT",
    "DB_NAME",
    "DB_URL",
    "DB_USER",
    "DB_PASS"
].forEach((name) => {
    if (!process.env[name]) {
        throw new Error(`Environment variable ${name} is missing`);
    }
})

const config = {
    env: process.env.NODE_ENV,
    server: {
        port: Number(process.env.PORT),
        dbName: String(process.env.DB_NAME),
        url: String(process.env.DB_URL),
        user: String(process.env.DB_USER),
        password: String(process.env.DB_PASS)
    }
}

module.exports = config;