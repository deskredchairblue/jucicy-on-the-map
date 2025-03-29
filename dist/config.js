"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.PAYPAL_CLIENT_SECRET = exports.PAYPAL_CLIENT_ID = exports.STRIPE_WEBHOOK_SECRET = exports.STRIPE_SECRET_KEY = exports.REFRESH_TOKEN_EXPIRES_IN = exports.REFRESH_TOKEN_SECRET = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.FRONTEND_URL = exports.MONGODB_URI = exports.DATABASE_URL = exports.PORT = exports.NODE_ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Node environment
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
// Database
exports.DATABASE_URL = process.env.DATABASE_URL || 'postgres://username:password@postgres:5432/corenode';
exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/corenode';
// Frontend URL
exports.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// JWT Configuration
exports.JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret_change_in_production';
exports.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
// Payment providers
exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
exports.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
exports.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
exports.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
// Export as a config object
exports.config = {
    NODE_ENV: exports.NODE_ENV,
    PORT: exports.PORT,
    DATABASE_URL: exports.DATABASE_URL,
    MONGODB_URI: exports.MONGODB_URI,
    FRONTEND_URL: exports.FRONTEND_URL,
    JWT_SECRET: exports.JWT_SECRET,
    JWT_EXPIRES_IN: exports.JWT_EXPIRES_IN,
    REFRESH_TOKEN_SECRET: exports.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN: exports.REFRESH_TOKEN_EXPIRES_IN,
    STRIPE_SECRET_KEY: exports.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: exports.STRIPE_WEBHOOK_SECRET,
    PAYPAL_CLIENT_ID: exports.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: exports.PAYPAL_CLIENT_SECRET
};
// Make sure critical secrets are set in production
if (exports.NODE_ENV === 'production') {
    const missingSecrets = [];
    if (!process.env.JWT_SECRET)
        missingSecrets.push('JWT_SECRET');
    if (!process.env.REFRESH_TOKEN_SECRET)
        missingSecrets.push('REFRESH_TOKEN_SECRET');
    if (!process.env.STRIPE_SECRET_KEY)
        missingSecrets.push('STRIPE_SECRET_KEY');
    if (missingSecrets.length > 0) {
        throw new Error(`Missing required environment variables in production: ${missingSecrets.join(', ')}`);
    }
}
//# sourceMappingURL=config.js.map