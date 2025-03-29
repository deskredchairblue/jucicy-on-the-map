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
const user_service_1 = __importDefault(require("../services/user.service"));
class UserController {
    constructor() {
        /**
         * Get current user profile
         */
        this.getProfile = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const profile = yield user_service_1.default.getProfile(userId);
            return res.status(200).json(profile);
        }));
        /**
         * Update user profile
         */
        this.updateProfile = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { firstName, lastName, bio, avatar } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const profile = yield user_service_1.default.updateProfile(userId, {
                firstName,
                lastName,
                bio,
                avatar
            });
            return res.status(200).json(profile);
        }));
        /**
         * Get user settings
         */
        this.getSettings = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const settings = yield user_service_1.default.getSettings(userId);
            return res.status(200).json(settings);
        }));
        /**
         * Update user settings
         */
        this.updateSettings = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { theme, notifications, language, timezone } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const settings = yield user_service_1.default.updateSettings(userId, {
                theme,
                notifications,
                language,
                timezone
            });
            return res.status(200).json(settings);
        }));
        /**
         * Get user activity log
         */
        this.getActivityLog = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { page = 1, limit = 10 } = req.query;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const activityLog = yield user_service_1.default.getActivityLog(userId, Number(page), Number(limit));
            return res.status(200).json(activityLog);
        }));
        /**
         * Update user preferences
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
            const updatedPreferences = yield user_service_1.default.updatePreferences(userId, preferences);
            return res.status(200).json(updatedPreferences);
        }));
    }
}
exports.default = new UserController();
//# sourceMappingURL=user.controller.js.map