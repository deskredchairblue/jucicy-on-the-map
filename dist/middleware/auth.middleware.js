"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.hasPermission = exports.hasRole = exports.validateRefreshToken = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
/**
 * Middleware to protect routes that require authentication
 */
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid authorization format' });
    }
    const token = tokenParts[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        // Add user data to request
        req.user = {
            userId: decoded.userId,
            id: decoded.userId, // Map userId to id for backward compatibility
            role: decoded.role,
            email: decoded.email,
            permissions: decoded.permissions || []
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticateJWT = authenticateJWT;
/**
 * Validate refresh token
 */
const validateRefreshToken = (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.REFRESH_TOKEN_SECRET);
        // Add user data to request
        req.user = {
            userId: decoded.userId,
            id: decoded.userId, // Map userId to id for backward compatibility
            role: decoded.role,
            email: decoded.email,
            permissions: decoded.permissions || []
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};
exports.validateRefreshToken = validateRefreshToken;
/**
 * Check if user has required role
 */
const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (roles.includes(req.user.role)) {
            next();
        }
        else {
            res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
    };
};
exports.hasRole = hasRole;
/**
 * Check if user has required permissions
 */
const hasPermission = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userPermissions = req.user.permissions || [];
        // Check if user has admin role (full access)
        if (req.user.role === 'admin') {
            return next();
        }
        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every(permission => userPermissions.includes(permission));
        if (hasAllPermissions) {
            next();
        }
        else {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
    };
};
exports.hasPermission = hasPermission;
// Export as object for convenience
exports.authMiddleware = {
    authenticateJWT: exports.authenticateJWT,
    validateRefreshToken: exports.validateRefreshToken,
    hasRole: exports.hasRole,
    hasPermission: exports.hasPermission
};
// Export as default for backward compatibility
exports.default = exports.authMiddleware;
//# sourceMappingURL=auth.middleware.js.map