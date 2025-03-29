"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billing_controller_1 = __importDefault(require("../controllers/billing.controller"));
const middlewareHelper_1 = require("../utils/middlewareHelper");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
// Public webhook routes
router.post('/webhook', billing_controller_1.default.handleWebhook);
// User billing information routes
router.get('/plans', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.getPlans);
// Subscription management routes
router.post('/subscribe', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.createSubscription);
router.get('/subscription', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.getSubscription);
// Payment method management
router.post('/payment-method', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.addPaymentMethod);
router.put('/payment-method/:id', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.updatePaymentMethod);
router.delete('/payment-method/:id', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.deletePaymentMethod);
// Invoice management
router.get('/invoices', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.getInvoices);
router.get('/invoice/:id', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.getInvoice);
// Subscription management
router.post('/cancel', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.cancelSubscription);
router.post('/resume', (0, middlewareHelper_1.auth)(auth_middleware_1.default), billing_controller_1.default.resumeSubscription);
// Admin routes
router.get('/admin/subscriptions', (0, middlewareHelper_1.auth)(auth_middleware_1.default), (0, middlewareHelper_1.rbac)(rbac_middleware_1.rbacMiddleware, ['admin']), billing_controller_1.default.getAllSubscriptions);
exports.default = router;
//# sourceMappingURL=billing.routes.js.map