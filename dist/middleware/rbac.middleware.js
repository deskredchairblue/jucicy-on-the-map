"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacMiddleware = exports.hasRole = void 0;
/**
 * Middleware to check if user has required roles
 * @param allowedRoles Array of roles allowed to access the resource
 */
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (allowedRoles.includes(req.user.role)) {
            next();
        }
        else {
            res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
    };
};
exports.hasRole = hasRole;
// Default export for backward compatibility
exports.default = {
    hasRole: exports.hasRole
};
// Export the rbacMiddleware function for direct use in routes
exports.rbacMiddleware = exports.hasRole;
//# sourceMappingURL=rbac.middleware.js.map