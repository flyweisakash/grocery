import jwt from "jsonwebtoken";
import config from "../../../config/auth";

export function generateAccessToken(payload) {
    return jwt.sign(payload, config.auth.jwtSecret, { expiresIn: '24h' });
};

export function generateRefreshToken(payload) {
    return jwt.sign(payload, config.auth.jwtSecret);
};

export function authenticateToken(token, callback) {
    return jwt.verify(token, config.auth.jwtSecret, callback);
};