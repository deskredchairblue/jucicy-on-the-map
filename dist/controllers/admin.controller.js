"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_service_1 = __importDefault(require("../services/admin.service"));
const errorHandler_1 = require("../utils/errorHandler"); // Assuming you have ApiError
const logger_1 = __importDefault(require("../utils/logger")); // Assuming you have a logger
class AdminController {
    /**
     * Retrieves request logs.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static getRequestLogs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const logs = yield admin_service_1.default.getRequestLogs();
                res.json({ success: true, data: logs });
            }
            catch (error) {
                logger_1.default.error(`AdminController.getRequestLogs error: ${error}`);
                res.status(500).json({ success: false, error: 'Failed to fetch request logs' });
            }
        });
    }
    /**
     * Retrieves error logs.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static getErrorLogs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const logs = yield admin_service_1.default.getErrorLogs();
                res.json({ success: true, data: logs });
            }
            catch (error) {
                logger_1.default.error(`AdminController.getErrorLogs error: ${error}`);
                res.status(500).json({ success: false, error: 'Failed to fetch error logs' });
            }
        });
    }
    /**
     * Retrieves usage logs.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static getUsageLogs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const logs = yield admin_service_1.default.getUsageLogs();
                res.json({ success: true, data: logs });
            }
            catch (error) {
                logger_1.default.error(`AdminController.getUsageLogs error: ${error}`);
                res.status(500).json({ success: false, error: 'Failed to fetch usage logs' });
            }
        });
    }
    /**
     * Retrieves dashboard data.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static getDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dashboard = yield admin_service_1.default.getDashboard();
                res.json({ success: true, data: dashboard });
            }
            catch (error) {
                logger_1.default.error(`AdminController.getDashboard error: ${error}`);
                res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
            }
        });
    }
    /**
     * Retrieves PostHog analytics.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static getPostHogAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const analytics = yield admin_service_1.default.getPostHogAnalytics();
                res.json({ success: true, data: analytics });
            }
            catch (error) {
                logger_1.default.error(`AdminController.getPostHogAnalytics error: ${error}`);
                res.status(500).json({ success: false, error: 'Failed to fetch PostHog analytics' });
            }
        });
    }
    /**
     * Retrieves Plausible analytics.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static getPlausibleAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const analytics = yield admin_service_1.default.getPlausibleAnalytics();
                res.json({ success: true, data: analytics });
            }
            catch (error) {
                logger_1.default.error(`AdminController.getPlausibleAnalytics error: ${error}`);
                res.status(500).json({ success: false, error: 'Failed to fetch Plausible analytics' });
            }
        });
    }
    /**
     * Retrieves all users.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield admin_service_1.default.getUsers();
                res.json({ success: true, data: users });
            }
            catch (error) {
                logger_1.default.error(`AdminController.getUsers error: ${error}`);
                res.status(500).json({ success: false, error: 'Failed to fetch users' });
            }
        });
    }
    /**
     * Assigns a role to a user.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static assignUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, role } = req.body;
                if (!userId || !role) {
                    throw new errorHandler_1.ApiError('User ID and role are required', 400);
                }
                const result = yield admin_service_1.default.assignUserRole(userId, role);
                res.json({ success: true, data: result });
            }
            catch (error) {
                logger_1.default.error(`AdminController.assignUserRole error: ${error}`);
                if (error instanceof errorHandler_1.ApiError) {
                    res.status(error.statusCode).json({ success: false, error: error.message });
                }
                else {
                    res.status(500).json({ success: false, error: 'Failed to assign user role' });
                }
            }
        });
    }
    /**
     * Deletes a user.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.ApiError('User ID is required', 400);
                }
                const result = yield admin_service_1.default.deleteUser(id);
                res.json({ success: true, data: result });
            }
            catch (error) {
                logger_1.default.error(`AdminController.deleteUser error: ${error}`);
                if (error instanceof errorHandler_1.ApiError) {
                    res.status(error.statusCode).json({ success: false, error: error.message });
                }
                else {
                    res.status(500).json({ success: false, error: 'Failed to delete user' });
                }
            }
        });
    }
    /**
     * Broadcasts an announcement.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static broadcastAnnouncement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { message } = req.body;
                if (!message) {
                    throw new errorHandler_1.ApiError('Message is required', 400);
                }
                const result = yield admin_service_1.default.broadcastAnnouncement(message);
                res.json({ success: true, data: result });
            }
            catch (error) {
                logger_1.default.error(`AdminController.broadcastAnnouncement error: ${error}`);
                if (error instanceof errorHandler_1.ApiError) {
                    res.status(error.statusCode).json({ success: false, error: error.message });
                }
                else {
                    res.status(500).json({ success: false, error: 'Failed to broadcast announcement' });
                }
            }
        });
    }
    /**
     * Reports metrics.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     */
    static reportMetrics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const report = yield admin_service_1.default.reportMetrics();
                res.json({ success: true, data: report });
            }
            catch (error) {
                logger_1.default.error(`AdminController.reportMetrics error: ${error}`);
                res.status(500).json({ success: false, error: 'Failed to report metrics' });
            }
        });
    }
}
exports.default = AdminController;
//# sourceMappingURL=admin.controller.js.map