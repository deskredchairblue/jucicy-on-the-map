"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gateway_controller_1 = __importDefault(require("../controllers/gateway.controller"));
const router = (0, express_1.Router)();
// Health check and API information endpoints
router.get('/health', gateway_controller_1.default.checkHealth);
router.get('/status', gateway_controller_1.default.getStatus);
router.get('/docs', gateway_controller_1.default.getDocs);
exports.default = router;
//# sourceMappingURL=gateway.routes.js.map