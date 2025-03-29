"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = __importDefault(require("../controllers/admin.controller"));
const auth_1 = require("../middleware/auth"); // Assuming you have auth middleware
const router = (0, express_1.Router)();
// Admin endpoints
router.get('/admin/logs/requests', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.getRequestLogs);
router.get('/admin/logs/errors', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.getErrorLogs);
router.get('/admin/logs/usage', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.getUsageLogs);
router.get('/admin/dashboard', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.getDashboard);
router.get('/admin/analytics/posthog', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.getPostHogAnalytics);
router.get('/admin/analytics/plausible', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.getPlausibleAnalytics);
router.get('/admin/users', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.getUsers);
router.post('/admin/user/assign-role', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.assignUserRole);
router.delete('/admin/user/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.deleteUser);
router.post('/admin/broadcast', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.broadcastAnnouncement);
router.post('/admin/metrics/report', auth_1.authenticate, (0, auth_1.authorize)(['admin']), admin_controller_1.default.reportMetrics);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map