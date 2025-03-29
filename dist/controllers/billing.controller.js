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
const billing_service_1 = __importDefault(require("../services/billing.service"));
class BillingController {
    constructor() {
        /**
         * Handle incoming webhooks from payment providers
         */
        this.handleWebhook = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const signature = req.headers['stripe-signature'];
            const payload = req.body;
            yield billing_service_1.default.handleWebhook(payload, signature);
            return res.status(200).json({ received: true });
        }));
        /**
         * Get available subscription plans
         */
        this.getPlans = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const plans = yield billing_service_1.default.getPlans();
            return res.status(200).json(plans);
        }));
        /**
         * Create a new subscription
         */
        this.createSubscription = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { planId, paymentMethodId, couponCode } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            if (!planId) {
                throw new errorHandler_1.ApiError('Plan ID is required', 400);
            }
            const subscription = yield billing_service_1.default.createSubscription(userId, planId, paymentMethodId, couponCode);
            return res.status(200).json(subscription);
        }));
        /**
         * Get current subscription
         */
        this.getSubscription = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const subscription = yield billing_service_1.default.getSubscription(userId);
            return res.status(200).json(subscription);
        }));
        /**
         * Add a payment method
         */
        this.addPaymentMethod = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { paymentMethodId, makeDefault } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            if (!paymentMethodId) {
                throw new errorHandler_1.ApiError('Payment method ID is required', 400);
            }
            const paymentMethod = yield billing_service_1.default.addPaymentMethod(userId, paymentMethodId, makeDefault);
            return res.status(200).json(paymentMethod);
        }));
        /**
         * Update a payment method
         */
        this.updatePaymentMethod = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const paymentMethodId = req.params.id;
            const { isDefault, billingDetails } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const paymentMethod = yield billing_service_1.default.updatePaymentMethod(userId, paymentMethodId, isDefault, billingDetails);
            return res.status(200).json(paymentMethod);
        }));
        /**
         * Delete a payment method
         */
        this.deletePaymentMethod = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const paymentMethodId = req.params.id;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            yield billing_service_1.default.deletePaymentMethod(userId, paymentMethodId);
            return res.status(200).json({ success: true });
        }));
        /**
         * Get invoices for a user
         */
        this.getInvoices = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { limit = 10, starting_after } = req.query;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const invoices = yield billing_service_1.default.getInvoices(userId, Number(limit), starting_after);
            return res.status(200).json(invoices);
        }));
        /**
         * Get a specific invoice
         */
        this.getInvoice = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const invoiceId = req.params.id;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const invoice = yield billing_service_1.default.getInvoice(userId, invoiceId);
            return res.status(200).json(invoice);
        }));
        /**
         * Cancel a subscription
         */
        this.cancelSubscription = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { atPeriodEnd = true } = req.body;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const result = yield billing_service_1.default.cancelSubscription(userId, atPeriodEnd);
            return res.status(200).json(result);
        }));
        /**
         * Resume a canceled subscription
         */
        this.resumeSubscription = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const result = yield billing_service_1.default.resumeSubscription(userId);
            return res.status(200).json(result);
        }));
        /**
         * Get all subscriptions (admin only)
         */
        this.getAllSubscriptions = (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { page = 1, limit = 20, status } = req.query;
            if (!userId) {
                throw new errorHandler_1.ApiError('User not authenticated', 401);
            }
            const subscriptions = yield billing_service_1.default.getAllSubscriptions(Number(page), Number(limit), status);
            return res.status(200).json(subscriptions);
        }));
    }
}
exports.default = new BillingController();
//# sourceMappingURL=billing.controller.js.map