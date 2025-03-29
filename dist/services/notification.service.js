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
const database_1 = require("../database");
const User_1 = require("../models/User");
const Notification_1 = require("../models/Notification");
const logger_1 = __importDefault(require("../utils/logger"));
class NotificationService {
    /**
     * Get all notifications for a user
     */
    getAll(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
                const notifications = yield notificationRepository.find({
                    where: { user: { id: userId } },
                    order: { createdAt: 'DESC' }
                });
                return notifications;
            }
            catch (error) {
                logger_1.default.error(`Get all notifications error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get notifications', 500);
            }
        });
    }
    /**
     * Get unread notifications for a user
     */
    getUnread(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
                const notifications = yield notificationRepository.find({
                    where: {
                        user: { id: userId },
                        read: false
                    },
                    order: { createdAt: 'DESC' }
                });
                return notifications;
            }
            catch (error) {
                logger_1.default.error(`Get unread notifications error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get unread notifications', 500);
            }
        });
    }
    /**
     * Mark notifications as read
     */
    markAsRead(userId, notificationIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
                // Get notifications for this user
                const notifications = yield notificationRepository.find({
                    where: {
                        user: { id: userId },
                        id: notificationIds // TypeORM expects In operator
                    }
                });
                if (notifications.length === 0) {
                    return { success: true, count: 0 };
                }
                // Mark all as read
                yield notificationRepository.update(notifications.map(n => n.id), { read: true });
                return { success: true, count: notifications.length };
            }
            catch (error) {
                logger_1.default.error(`Mark notifications as read error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to mark notifications as read', 500);
            }
        });
    }
    /**
     * Delete a notification
     */
    delete(userId, notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
                // Find notification
                const notification = yield notificationRepository.findOne({
                    where: {
                        id: notificationId,
                        user: { id: userId }
                    }
                });
                if (!notification) {
                    throw new errorHandler_1.ApiError('Notification not found', 404);
                }
                // Delete notification
                yield notificationRepository.remove(notification);
                return { success: true };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Delete notification error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to delete notification', 500);
            }
        });
    }
    /**
     * Create a new notification
     */
    create(userId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
                // Find user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // Create notification
                const notification = new Notification_1.Notification();
                notification.user = user;
                notification.message = message;
                notification.read = false;
                yield notificationRepository.save(notification);
                return notification;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Create notification error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to create notification', 500);
            }
        });
    }
    /**
     * Get notification preferences
     */
    getPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Notification preferences would typically be stored in a separate table
                // For simplicity, returning mock preferences
                return {
                    email: {
                        marketing: true,
                        accountUpdates: true,
                        securityAlerts: true
                    },
                    inApp: {
                        announcements: true,
                        activityUpdates: true
                    },
                    push: {
                        enabled: true,
                        quietHours: {
                            enabled: false,
                            start: '22:00',
                            end: '08:00'
                        }
                    }
                };
            }
            catch (error) {
                logger_1.default.error(`Get notification preferences error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get notification preferences', 500);
            }
        });
    }
    /**
     * Update notification preferences
     */
    updatePreferences(userId, preferences) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                // Find user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // User preferences would typically be stored in a separate table
                // For simplicity, just return the provided preferences
                return preferences;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Update notification preferences error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to update notification preferences', 500);
            }
        });
    }
    /**
     * Get in-app notifications
     */
    getInApp(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
                // Get recent unread notifications
                const notifications = yield notificationRepository.find({
                    where: {
                        user: { id: userId },
                        read: false
                    },
                    order: { createdAt: 'DESC' },
                    take: 10
                });
                return notifications;
            }
            catch (error) {
                logger_1.default.error(`Get in-app notifications error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get in-app notifications', 500);
            }
        });
    }
}
exports.default = new NotificationService();
//# sourceMappingURL=notification.service.js.map