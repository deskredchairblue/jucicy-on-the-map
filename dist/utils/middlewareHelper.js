"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbac = exports.refreshAuth = exports.auth = exports.useMiddleware = void 0;
/**
 * Helper function to use objects as Express middleware
 * This resolves TypeScript errors with middleware objects in routes
 *
 * @param middleware - The middleware object with methods
 * @param methodName - The method name to call from the middleware object
 */
const useMiddleware = (middleware, methodName) => {
    return (req, res, next) => {
        if (typeof middleware[methodName] === 'function') {
            return middleware[methodName](req, res, next);
        }
        next();
    };
};
exports.useMiddleware = useMiddleware;
/**
 * Helper to use the authenticateJWT method from authMiddleware
 */
const auth = (authMiddleware) => {
    return (0, exports.useMiddleware)(authMiddleware, 'authenticateJWT');
};
exports.auth = auth;
/**
 * Helper to use the validateRefreshToken method from authMiddleware
 */
const refreshAuth = (authMiddleware) => {
    return (0, exports.useMiddleware)(authMiddleware, 'validateRefreshToken');
};
exports.refreshAuth = refreshAuth;
/**
 * Helper to use the hasRole method from rbacMiddleware with specified roles
 */
const rbac = (rbacMiddleware, roles) => {
    if (typeof rbacMiddleware === 'function') {
        return rbacMiddleware(roles);
    }
    if (typeof rbacMiddleware.hasRole === 'function') {
        return rbacMiddleware.hasRole(roles);
    }
    return (req, res, next) => next();
};
exports.rbac = rbac;
//# sourceMappingURL=middlewareHelper.js.map