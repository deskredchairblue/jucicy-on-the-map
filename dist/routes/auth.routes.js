"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const middlewareHelper_1 = require("../utils/middlewareHelper");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const router = (0, express_1.Router)();
// Public routes
router.post('/login', auth_controller_1.default.login);
router.post('/register', auth_controller_1.default.register);
router.post('/refresh-token', (0, middlewareHelper_1.refreshAuth)(auth_middleware_1.default), auth_controller_1.default.refreshToken);
router.post('/forgot-password', auth_controller_1.default.forgotPassword);
router.post('/reset-password', auth_controller_1.default.resetPassword);
router.post('/verify-email/:token', auth_controller_1.default.verifyEmail);
// Protected routes
router.post('/logout', (0, middlewareHelper_1.auth)(auth_middleware_1.default), auth_controller_1.default.logout);
router.get('/session', (0, middlewareHelper_1.auth)(auth_middleware_1.default), auth_controller_1.default.validateSession);
router.post('/device/register', (0, middlewareHelper_1.auth)(auth_middleware_1.default), auth_controller_1.default.registerDevice);
router.post('/change-password', (0, middlewareHelper_1.auth)(auth_middleware_1.default), auth_controller_1.default.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map