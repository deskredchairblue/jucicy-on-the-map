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
const logger_1 = __importDefault(require("../utils/logger"));
class UserService {
    /**
     * Get user profile
     */
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { id: userId },
                    select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'emailVerified', 'createdAt']
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                return {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Get profile error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get user profile', 500);
            }
        });
    }
    /**
     * Update user profile
     */
    updateProfile(userId, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // Update user fields if provided
                if (profileData.firstName !== undefined)
                    user.firstName = profileData.firstName;
                if (profileData.lastName !== undefined)
                    user.lastName = profileData.lastName;
                // Save updated user
                yield userRepository.save(user);
                return {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Update profile error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to update user profile', 500);
            }
        });
    }
    /**
     * Get user settings
     */
    getSettings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // User settings would typically be stored in a separate table
                // For simplicity, returning mock settings
                return {
                    theme: 'light',
                    notifications: {
                        email: true,
                        push: true
                    },
                    language: 'en',
                    timezone: 'UTC'
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Get settings error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get user settings', 500);
            }
        });
    }
    /**
     * Update user settings
     */
    updateSettings(userId, settingsData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // User settings would typically be stored in a separate table
                // For simplicity, returning mock updated settings
                return {
                    theme: settingsData.theme || 'light',
                    notifications: {
                        email: ((_a = settingsData.notifications) === null || _a === void 0 ? void 0 : _a.email) !== undefined ? settingsData.notifications.email : true,
                        push: ((_b = settingsData.notifications) === null || _b === void 0 ? void 0 : _b.push) !== undefined ? settingsData.notifications.push : true
                    },
                    language: settingsData.language || 'en',
                    timezone: settingsData.timezone || 'UTC'
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Update settings error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to update user settings', 500);
            }
        });
    }
    /**
     * Get user activity log
     */
    getActivityLog(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Activity log would typically be stored in a separate table
                // For simplicity, returning mock activity log
                const totalItems = 20;
                const totalPages = Math.ceil(totalItems / limit);
                const mockActivityItems = Array.from({ length: Math.min(limit, totalItems) }, (_, i) => ({
                    id: `activity-${i + 1 + (page - 1) * limit}`,
                    type: 'login',
                    description: 'User logged in',
                    ip: '192.168.1.1',
                    userAgent: 'Mozilla/5.0',
                    timestamp: new Date(Date.now() - i * 86400000)
                }));
                return {
                    items: mockActivityItems,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                };
            }
            catch (error) {
                logger_1.default.error(`Get activity log error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get user activity log', 500);
            }
        });
    }
    /**
     * Update user preferences
     */
    updatePreferences(userId, preferences) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // User preferences would typically be stored in a separate table
                // For simplicity, returning the provided preferences
                return preferences;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Update preferences error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to update user preferences', 500);
            }
        });
    }
}
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map