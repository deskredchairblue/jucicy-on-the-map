"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLoginToken = exports.verifyRefreshToken = exports.verifyToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
/**
 * Generate JWT and refresh tokens for a user
 */
const generateTokens = (payload) => {
    // Create JWT token
    const accessToken = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, { expiresIn: config_1.JWT_EXPIRES_IN });
    // Create refresh token with longer expiration
    const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.REFRESH_TOKEN_SECRET, { expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.REFRESH_TOKEN_SECRET);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Added for compatibility with existing code
 */
exports.generateLoginToken = exports.generateTokens;
//# sourceMappingURL=token.js.map