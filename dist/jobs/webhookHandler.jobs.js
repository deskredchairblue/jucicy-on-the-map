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
exports.webhookHandlerJob = void 0;
const payment_service_1 = require("../services/payment.service");
/**
 * Processes incoming webhook events.
 * For a production system, consider validating the webhook signature.
 */
const webhookHandlerJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = req.body;
        // Optionally, validate the webhook signature here.
        // Example: const isValid = paymentService.validateWebhook(req);
        // if (!isValid) { throw new Error('Invalid webhook signature'); }
        // Process the event using your payment service
        yield payment_service_1.paymentService.handleWebhook(event);
        // Respond to the webhook sender indicating success.
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        res.status(400).json({ error: 'Webhook processing failed' });
    }
});
exports.webhookHandlerJob = webhookHandlerJob;
//# sourceMappingURL=webhookHandler.jobs.js.map