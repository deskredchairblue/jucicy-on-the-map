"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = __importDefault(require("../controllers/notification.controller"));
const middlewareHelper_1 = require("../utils/middlewareHelper");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const router = (0, express_1.Router)();
// All routes require authentication
router.get('/', (0, middlewareHelper_1.auth)(auth_middleware_1.default), notification_controller_1.default.getAllNotifications);
router.get('/unread', (0, middlewareHelper_1.auth)(auth_middleware_1.default), notification_controller_1.default.getUnreadNotifications);
router.post('/read', (0, middlewareHelper_1.auth)(auth_middleware_1.default), notification_controller_1.default.markNotificationsAsRead);
router.get('/preferences', (0, middlewareHelper_1.auth)(auth_middleware_1.default), notification_controller_1.default.getPreferences);
router.put('/preferences', (0, middlewareHelper_1.auth)(auth_middleware_1.default), notification_controller_1.default.updatePreferences);
router.get('/in-app', (0, middlewareHelper_1.auth)(auth_middleware_1.default), notification_controller_1.default.getInAppNotifications);
router.delete('/:id', (0, middlewareHelper_1.auth)(auth_middleware_1.default), notification_controller_1.default.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map