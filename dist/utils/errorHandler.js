"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.asyncHandler = void 0;
const logger_1 = __importDefault(require("./logger"));
/**
 * Async wrapper for controller functions to avoid try/catch repetition
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            logger_1.default.error(`Error in controller: ${error.message}`);
            // Send error response
            res.status(500).json({
                message: 'An error occurred',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        });
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Custom API error class with status code
 */
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=errorHandler.js.map