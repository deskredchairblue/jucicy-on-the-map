"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 4000,
    DATABASE_URL: process.env.DATABASE_URL || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    JWT_SECRET: process.env.JWT_SECRET || 'your_default_jwt_secret',
    // Add additional variables as needed
};
//# sourceMappingURL=env.js.map