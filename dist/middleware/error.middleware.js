"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.APIError = void 0;
const logger_1 = require("../utils/logger");
/**
 * Custom error class for API errors
 */
class APIError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'APIError';
    }
}
exports.APIError = APIError;
/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    var _a;
    logger_1.logger.error(`Error: ${err.message}`, {
        error: err,
        stack: err.stack,
        path: req.path,
        method: req.method,
        requestId: req.headers['x-request-id'],
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
    });
    // Handle specific API errors
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code,
                details: err.details
            }
        });
    }
    // Handle validation errors (express-validator)
    if (err.name === 'ValidationError' || err.errors) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation error',
                code: 'VALIDATION_ERROR',
                details: err.errors || err.message
            }
        });
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            }
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            }
        });
    }
    // Handle Stripe errors
    if (err.type && err.type.startsWith('Stripe')) {
        const stripeErr = err;
        return res.status(400).json({
            success: false,
            error: {
                message: stripeErr.message,
                code: `STRIPE_${stripeErr.code || 'ERROR'}`,
                details: {
                    type: stripeErr.type,
                    param: stripeErr.param
                }
            }
        });
    }
    // Handle MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        let statusCode = 500;
        let code = 'DATABASE_ERROR';
        let message = 'Database error occurred';
        const mongoErr = err;
        if (mongoErr.code === 11000) {
            // Duplicate key error
            statusCode = 409;
            code = 'DUPLICATE_KEY';
            message = 'A record with this information already exists';
        }
        return res.status(statusCode).json({
            success: false,
            error: {
                message,
                code
            }
        });
    }
    // Default error response
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        error: {
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message || 'Internal server error',
            code: 'INTERNAL_ERROR'
        }
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map