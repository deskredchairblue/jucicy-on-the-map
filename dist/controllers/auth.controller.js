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
const auth_service_1 = __importDefault(require("../services/auth.service"));
class AuthController {
    constructor() {
        /**
         * Login user and return JWT tokens
         */
        this.login = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new errorHandler_1.ApiError('Email and password are required', 400);
            }
            const result = yield auth_service_1.default.login(email, password);
            return res.status(200).json(result);
        }));
        /**
         * Register a new user
         */
        this.register = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password, firstName, lastName } = req.body;
            if (!email || !password) {
                throw new errorHandler_1.ApiError('Email and password are required', 400);
            }
            const result = yield auth_service_1.default.register({
                email,
                password,
                firstName,
                lastName
            });
            return res.status(201).json(result);
        }));
        /**
         * Log out current user
         */
        this.logout = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            yield auth_service_1.default.logout(userId);
            return res.status(200).json({ message: 'Successfully logged out' });
        }));
        /**
         * Refresh access token using refresh token
         */
        this.refreshToken = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new errorHandler_1.ApiError('Refresh token is required', 400);
            }
            const result = yield auth_service_1.default.refreshToken(refreshToken);
            return res.status(200).json(result);
        }));
        /**
         * Validate current session
         */
        this.validateSession = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const session = yield auth_service_1.default.validateSession(userId);
            return res.status(200).json(session);
        }));
        /**
         * Send password reset email
         */
        this.forgotPassword = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            if (!email) {
                throw new errorHandler_1.ApiError('Email is required', 400);
            }
            yield auth_service_1.default.forgotPassword(email);
            return res.status(200).json({ message: 'Password reset email sent' });
        }));
        /**
         * Reset password using reset token
         */
        this.resetPassword = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { token, password } = req.body;
            if (!token || !password) {
                throw new errorHandler_1.ApiError('Token and password are required', 400);
            }
            yield auth_service_1.default.resetPassword(token, password);
            return res.status(200).json({ message: 'Password has been reset successfully' });
        }));
        /**
         * Verify email with verification token
         */
        this.verifyEmail = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { token } = req.params;
            if (!token) {
                throw new errorHandler_1.ApiError('Verification token is required', 400);
            }
            yield auth_service_1.default.verifyEmail(token);
            return res.status(200).json({ message: 'Email verified successfully' });
        }));
        /**
         * Change user password (authenticated)
         */
        this.changePassword = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { currentPassword, newPassword } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            if (!currentPassword || !newPassword) {
                throw new errorHandler_1.ApiError('Current password and new password are required', 400);
            }
            yield auth_service_1.default.changePassword(userId, currentPassword, newPassword);
            return res.status(200).json({ message: 'Password changed successfully' });
        }));
        /**
         * Register a new device for push notifications
         */
        this.registerDevice = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { deviceToken, deviceType } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            if (!deviceToken || !deviceType) {
                throw new errorHandler_1.ApiError('Device token and type are required', 400);
            }
            yield auth_service_1.default.registerDevice(userId, deviceToken, deviceType);
            return res.status(200).json({ message: 'Device registered successfully' });
        }));
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map