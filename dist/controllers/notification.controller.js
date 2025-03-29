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
const errorHandler_1 = require("../utils/errorHandler");
const notification_service_1 = __importDefault(require("../services/notification.service"));
class NotificationController {
    constructor() {
        /**
         * Get all notifications for the current user
         */
        this.getAllNotifications = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const notifications = yield notification_service_1.default.getAll(userId);
            return res.status(200).json(notifications);
        }));
        /**
         * Get unread notifications for the current user
         */
        this.getUnreadNotifications = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const notifications = yield notification_service_1.default.getUnread(userId);
            return res.status(200).json(notifications);
        }));
        /**
         * Mark notifications as read
         */
        this.markNotificationsAsRead = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { notificationIds } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            if (!notificationIds || !Array.isArray(notificationIds)) {
                throw new errorHandler_1.ApiError('Notification IDs array is required', 400);
            }
            const result = yield notification_service_1.default.markAsRead(userId, notificationIds);
            return res.status(200).json(result);
        }));
        /**
         * Delete a notification
         */
        this.deleteNotification = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const notificationId = req.params.id;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            if (!notificationId) {
                throw new errorHandler_1.ApiError('Notification ID is required', 400);
            }
            yield notification_service_1.default.delete(userId, notificationId);
            return res.status(200).json({ message: 'Notification deleted successfully' });
        }));
        /**
         * Get notification preferences
         */
        this.getPreferences = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const prefs = yield notification_service_1.default.getPreferences(userId);
            return res.status(200).json(prefs);
        }));
        /**
         * Update notification preferences
         */
        this.updatePreferences = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { preferences } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            if (!preferences) {
                throw new errorHandler_1.ApiError('Preferences object is required', 400);
            }
            const result = yield notification_service_1.default.updatePreferences(userId, preferences);
            return res.status(200).json(result);
        }));
        /**
         * Get in-app notifications
         */
        this.getInAppNotifications = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const notifications = yield notification_service_1.default.getInApp(userId);
            return res.status(200).json(notifications);
        }));
    }
}
exports.default = new NotificationController();
//# sourceMappingURL=notification.controller.js.map