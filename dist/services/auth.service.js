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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errorHandler_1 = require("../utils/errorHandler");
const token_1 = require("../utils/token");
const database_1 = require("../database");
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthService {
    /**
     * Login a user with email and password
     */
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user repository
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const sessionRepository = database_1.AppDataSource.getRepository(Session_1.Session);
                // Find user by email
                const user = yield userRepository.findOne({
                    where: { email },
                    select: ['id', 'email', 'password', 'role', 'status', 'permissions'],
                });
                // Check if user exists
                if (!user) {
                    throw new errorHandler_1.ApiError('Invalid email or password', 401);
                }
                // Check if user is active
                if (user.status !== User_1.UserStatus.ACTIVE) {
                    throw new errorHandler_1.ApiError('Account is inactive or suspended', 403);
                }
                // Verify password
                const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    throw new errorHandler_1.ApiError('Invalid email or password', 401);
                }
                // Generate tokens
                const tokens = (0, token_1.generateTokens)({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                });
                // Create session
                const session = new Session_1.Session();
                session.user = user;
                session.token = tokens.refreshToken;
                session.deviceInfo = 'Web'; // Default
                session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
                yield sessionRepository.save(session);
                return {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    },
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Login error: ${error}`);
                throw new errorHandler_1.ApiError('Authentication failed', 500);
            }
        });
    }
    /**
     * Register a new user
     */
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user repository
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                // Check if user already exists
                const existingUser = yield userRepository.findOne({
                    where: { email: userData.email },
                });
                if (existingUser) {
                    throw new errorHandler_1.ApiError('Email already registered', 409);
                }
                // Hash password
                const hashedPassword = yield bcryptjs_1.default.hash(userData.password, 12);
                // Create new user
                const user = new User_1.User();
                user.email = userData.email;
                user.password = hashedPassword;
                user.firstName = userData.firstName || '';
                user.lastName = userData.lastName || '';
                user.emailVerified = false;
                // Generate verification token
                user.emailVerificationToken = Math.random().toString(36).substring(2, 15);
                // Save user
                const savedUser = yield userRepository.save(user);
                // Generate tokens
                const tokens = (0, token_1.generateTokens)({
                    userId: savedUser.id,
                    email: savedUser.email,
                    role: savedUser.role,
                    permissions: savedUser.permissions,
                });
                // TODO: Send verification email
                return {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    user: {
                        id: savedUser.id,
                        email: savedUser.email,
                        role: savedUser.role,
                    },
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Registration error: ${error}`);
                throw new errorHandler_1.ApiError('Registration failed', 500);
            }
        });
    }
    /**
     * Logout a user and invalidate their session
     */
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionRepository = database_1.AppDataSource.getRepository(Session_1.Session);
                // Delete all user sessions
                yield sessionRepository.delete({ user: { id: userId } });
                return true;
            }
            catch (error) {
                logger_1.default.error(`Logout error: ${error}`);
                throw new errorHandler_1.ApiError('Logout failed', 500);
            }
        });
    }
    /**
     * Refresh access token using refresh token
     */
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify refresh token
                const decoded = (0, token_1.verifyRefreshToken)(refreshToken);
                const sessionRepository = database_1.AppDataSource.getRepository(Session_1.Session);
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                // Find session with this token
                const session = yield sessionRepository.findOne({
                    where: { token: refreshToken },
                    relations: ['user'],
                });
                if (!session) {
                    throw new errorHandler_1.ApiError('Invalid refresh token', 401);
                }
                // Check if session is expired
                if (session.expiresAt < new Date()) {
                    yield sessionRepository.delete(session.id);
                    throw new errorHandler_1.ApiError('Session expired', 401);
                }
                // Get user
                const user = yield userRepository.findOne({
                    where: { id: decoded.userId },
                    select: ['id', 'email', 'role', 'status', 'permissions'],
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                if (user.status !== User_1.UserStatus.ACTIVE) {
                    throw new errorHandler_1.ApiError('Account is inactive or suspended', 403);
                }
                // Generate new tokens
                const tokens = (0, token_1.generateTokens)({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                });
                // Update session
                session.token = tokens.refreshToken;
                session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
                yield sessionRepository.save(session);
                return {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Refresh token error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to refresh token', 500);
            }
        });
    }
    /**
     * Validate current session
     */
    validateSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { id: userId },
                    select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'emailVerified'],
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                return {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        status: user.status,
                        emailVerified: user.emailVerified,
                    },
                    isValid: true,
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Validate session error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to validate session', 500);
            }
        });
    }
    /**
     * Send password reset email
     */
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { email },
                });
                if (!user) {
                    // Don't reveal user existence, just return success
                    return true;
                }
                // Generate reset token
                const resetToken = Math.random().toString(36).substring(2, 15);
                // Set reset token and expiration
                user.passwordResetToken = resetToken;
                user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
                yield userRepository.save(user);
                // TODO: Send password reset email
                return true;
            }
            catch (error) {
                logger_1.default.error(`Forgot password error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to process password reset request', 500);
            }
        });
    }
    /**
     * Reset password using reset token
     */
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { passwordResetToken: token },
                });
                if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
                    throw new errorHandler_1.ApiError('Invalid or expired reset token', 400);
                }
                // Hash new password
                const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 12);
                // Update user password
                user.password = hashedPassword;
                user.passwordResetToken = null;
                user.passwordResetExpires = null;
                yield userRepository.save(user);
                // Invalidate all sessions
                const sessionRepository = database_1.AppDataSource.getRepository(Session_1.Session);
                yield sessionRepository.delete({ user: { id: user.id } });
                return true;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Reset password error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to reset password', 500);
            }
        });
    }
    /**
     * Verify email with verification token
     */
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { emailVerificationToken: token },
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('Invalid verification token', 400);
                }
                // Update user
                user.emailVerified = true;
                user.emailVerificationToken = null;
                yield userRepository.save(user);
                return true;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Verify email error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to verify email', 500);
            }
        });
    }
    /**
     * Change user password (authenticated)
     */
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { id: userId },
                    select: ['id', 'password'],
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // Verify current password
                const isPasswordValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    throw new errorHandler_1.ApiError('Current password is incorrect', 400);
                }
                // Hash new password
                const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 12);
                // Update user password
                user.password = hashedPassword;
                yield userRepository.save(user);
                return true;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Change password error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to change password', 500);
            }
        });
    }
    /**
     * Register a new device for push notifications
     */
    registerDevice(userId, deviceToken, deviceType) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementation would depend on your notification system
            try {
                // Store device info in database...
                return true;
            }
            catch (error) {
                logger_1.default.error(`Register device error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to register device', 500);
            }
        });
    }
}
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map