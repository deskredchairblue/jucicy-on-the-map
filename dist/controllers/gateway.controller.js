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
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../utils/errorHandler");
/**
 * API Gateway Controller
 * Handles API routing and traffic management
 */
class GatewayController {
    constructor() {
        /**
         * Health check endpoint
         */
        this.checkHealth = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            return res.status(200).json({ status: 'healthy', timestamp: new Date() });
        }));
        /**
         * Get API status and statistics
         */
        this.getStatus = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            // Mock status data
            const statusData = {
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
                serverTime: new Date(),
                memory: process.memoryUsage(),
                endpoints: {
                    total: 45,
                    active: 45
                }
            };
            return res.status(200).json(statusData);
        }));
        /**
         * Get API documentation
         */
        this.getDocs = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            return res.status(200).json({
                name: 'Core API',
                version: '1.0.0',
                description: 'API Documentation',
                docsUrl: '/api/docs'
            });
        }));
    }
}
exports.default = new GatewayController();
//# sourceMappingURL=gateway.controller.js.map