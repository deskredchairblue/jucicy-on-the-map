"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const middlewareHelper_1 = require("../utils/middlewareHelper");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const router = (0, express_1.Router)();
// All routes require authentication
router.get('/profile', (0, middlewareHelper_1.auth)(auth_middleware_1.default), user_controller_1.default.getProfile);
router.put('/profile', (0, middlewareHelper_1.auth)(auth_middleware_1.default), user_controller_1.default.updateProfile);
router.get('/settings', (0, middlewareHelper_1.auth)(auth_middleware_1.default), user_controller_1.default.getSettings);
router.put('/settings', (0, middlewareHelper_1.auth)(auth_middleware_1.default), user_controller_1.default.updateSettings);
router.get('/activity', (0, middlewareHelper_1.auth)(auth_middleware_1.default), user_controller_1.default.getActivityLog);
router.post('/preferences', (0, middlewareHelper_1.auth)(auth_middleware_1.default), user_controller_1.default.updatePreferences);
exports.default = router;
//# sourceMappingURL=user.routes.js.map