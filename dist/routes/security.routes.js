"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const security_controller_1 = __importDefault(require("../controllers/security.controller"));
const middlewareHelper_1 = require("../utils/middlewareHelper");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
// Basic security endpoints
router.get('/status', (0, middlewareHelper_1.auth)(auth_middleware_1.default), security_controller_1.default.getStatus);
router.post('/alert', (0, middlewareHelper_1.auth)(auth_middleware_1.default), security_controller_1.default.alertActivity);
// Admin-only security operations
router.post('/ban', (0, middlewareHelper_1.auth)(auth_middleware_1.default), (0, middlewareHelper_1.rbac)(rbac_middleware_1.rbacMiddleware, ['admin']), security_controller_1.default.banUser);
router.post('/unban', (0, middlewareHelper_1.auth)(auth_middleware_1.default), (0, middlewareHelper_1.rbac)(rbac_middleware_1.rbacMiddleware, ['admin']), security_controller_1.default.unbanUser);
// User security operations
router.post('/analyze-ip', (0, middlewareHelper_1.auth)(auth_middleware_1.default), security_controller_1.default.analyzeIP);
router.post('/force-logout', (0, middlewareHelper_1.auth)(auth_middleware_1.default), security_controller_1.default.forceLogout);
router.delete('/delete-account', (0, middlewareHelper_1.auth)(auth_middleware_1.default), security_controller_1.default.deleteAccount);
// Security monitoring and logs
router.get('/audit-log', (0, middlewareHelper_1.auth)(auth_middleware_1.default), security_controller_1.default.getAuditLog);
router.post('/validate-privacy', (0, middlewareHelper_1.auth)(auth_middleware_1.default), security_controller_1.default.validatePrivacy);
// System-wide security controls (admin only)
router.post('/lockdown', (0, middlewareHelper_1.auth)(auth_middleware_1.default), (0, middlewareHelper_1.rbac)(rbac_middleware_1.rbacMiddleware, ['admin']), security_controller_1.default.lockdown);
exports.default = router;
//# sourceMappingURL=security.routes.js.map