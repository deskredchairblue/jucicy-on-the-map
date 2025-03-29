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
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const User_1 = require("../models/User");
const Subscription_1 = require("../models/Subscription");
// Initialize Stripe client
const stripe = new stripe_1.default(config_1.config.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15', // Use the correct Stripe API version
});
class PaymentService {
    /**
     * Get all available pricing plans
     */
    getPlans() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch products with active prices
                const products = yield stripe.products.list({
                    active: true,
                    expand: ['data.default_price'],
                });
                // Format response
                const plans = products.data.map(product => {
                    const price = product.default_price;
                    return {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        features: product.metadata.features ?
                            JSON.parse(product.metadata.features) : [],
                        price: {
                            id: price.id,
                            unitAmount: price.unit_amount,
                            currency: price.currency,
                            interval: price.type === 'recurring' && price.recurring ?
                                price.recurring.interval : null,
                        },
                        metadata: product.metadata,
                    };
                });
                return plans;
            }
            catch (error) {
                logger_1.logger.error('Error fetching plans:', error);
                throw new Error('Unable to fetch pricing plans');
            }
        });
    }
    /**
     * Create a checkout session for subscription purchase
     */
    createCheckoutSession(userId, planId, successUrl, cancelUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user
                const user = yield User_1.User.findOne({ _id: userId });
                if (!user) {
                    throw new Error('User not found');
                }
                // Default URLs
                const defaultSuccessUrl = `${config_1.config.FRONTEND_URL}/billing/success`;
                const defaultCancelUrl = `${config_1.config.FRONTEND_URL}/billing/cancel`;
                // Create checkout session
                const session = yield stripe.checkout.sessions.create({
                    customer_email: user.email,
                    client_reference_id: userId,
                    payment_method_types: ['card'],
                    mode: 'subscription',
                    line_items: [
                        {
                            price: planId,
                            quantity: 1,
                        },
                    ],
                    success_url: successUrl || defaultSuccessUrl,
                    cancel_url: cancelUrl || defaultCancelUrl,
                    metadata: {
                        userId,
                    },
                });
                return session;
            }
            catch (error) {
                logger_1.logger.error('Error creating checkout session:', error);
                throw new Error('Unable to create checkout session');
            }
        });
    }
    /**
     * Create a billing portal session for subscription management
     */
    createBillingPortalSession(userId, returnUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user
                const user = yield User_1.User.findOne({ _id: userId });
                if (!user) {
                    throw new Error('User not found');
                }
                // Get subscription to find Stripe customer ID
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription || !subscription.stripeCustomerId) {
                    throw new Error('No active subscription found');
                }
                // Create billing portal session
                const session = yield stripe.billingPortal.sessions.create({
                    customer: subscription.stripeCustomerId,
                    return_url: returnUrl || `${config_1.config.FRONTEND_URL}/settings/billing`,
                });
                return session;
            }
            catch (error) {
                logger_1.logger.error('Error creating billing portal session:', error);
                throw new Error('Unable to create billing portal session');
            }
        });
    }
    /**
     * Get current billing status for user
     */
    getBillingStatus(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get subscription
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription) {
                    return {
                        active: false,
                        plan: null,
                        currentPeriod: null,
                        cancelAtPeriodEnd: false,
                    };
                }
                // Get product information
                const product = yield stripe.products.retrieve(subscription.planId);
                // Get price information
                const price = yield stripe.prices.retrieve(subscription.priceId);
                return {
                    active: subscription.status === 'active',
                    plan: {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                    },
                    currentPeriod: {
                        start: subscription.currentPeriodStart,
                        end: subscription.currentPeriodEnd,
                    },
                    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                    status: subscription.status,
                    trialEnd: subscription.trialEnd,
                };
            }
            catch (error) {
                logger_1.logger.error('Error fetching billing status:', error);
                throw new Error('Unable to fetch billing status');
            }
        });
    }
    /**
     * Construct webhook event from Stripe
     */
    constructWebhookEvent(payload, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return stripe.webhooks.constructEvent(payload, signature, config_1.config.STRIPE_WEBHOOK_SECRET);
            }
            catch (error) {
                logger_1.logger.error('Error constructing webhook event:', error);
                throw new Error('Invalid webhook signature');
            }
        });
    }
    /**
     * Handle webhook events from Stripe
     */
    handleWebhookEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (event.type) {
                    case 'checkout.session.completed': {
                        const session = event.data.object;
                        yield this.handleCheckoutSessionCompleted(session);
                        break;
                    }
                    case 'customer.subscription.updated': {
                        const subscription = event.data.object;
                        yield this.handleSubscriptionUpdated(subscription);
                        break;
                    }
                    case 'customer.subscription.deleted': {
                        const subscription = event.data.object;
                        yield this.handleSubscriptionDeleted(subscription);
                        break;
                    }
                    case 'invoice.payment_succeeded': {
                        const invoice = event.data.object;
                        yield this.handleInvoicePaymentSucceeded(invoice);
                        break;
                    }
                    case 'invoice.payment_failed': {
                        const invoice = event.data.object;
                        yield this.handleInvoicePaymentFailed(invoice);
                        break;
                    }
                    default:
                        logger_1.logger.info(`Unhandled event type: ${event.type}`);
                }
            }
            catch (error) {
                logger_1.logger.error(`Error handling webhook event ${event.type}:`, error);
                throw new Error(`Error processing webhook: ${error.message}`);
            }
        });
    }
    /**
     * Handle checkout session completed event
     */
    handleCheckoutSessionCompleted(session) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                const customerId = session.customer;
                const subscriptionId = session.subscription;
                if (!userId || !customerId || !subscriptionId) {
                    throw new Error('Missing required data in checkout session');
                }
                // Get subscription details
                const subscriptionData = yield stripe.subscriptions.retrieve(subscriptionId);
                // Get default payment method
                const paymentMethodId = subscriptionData.default_payment_method;
                // Get price and product details
                const priceId = subscriptionData.items.data[0].price.id;
                const productId = subscriptionData.items.data[0].price.product;
                // Create or update subscription in our database
                yield Subscription_1.Subscription.updateOne({ userId }, {
                    userId,
                    stripeSubscriptionId: subscriptionId,
                    stripeCustomerId: customerId,
                    status: subscriptionData.status,
                    planId: productId,
                    priceId,
                    currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
                    cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
                    defaultPaymentMethodId: paymentMethodId,
                    trialEnd: subscriptionData.trial_end
                        ? new Date(subscriptionData.trial_end * 1000)
                        : null,
                }, { upsert: true });
                // Update user subscription status
                yield User_1.User.updateOne({ _id: userId }, {
                    subscriptionStatus: 'active',
                    stripeCustomerId: customerId,
                });
                logger_1.logger.info(`Subscription created for user ${userId}`);
            }
            catch (error) {
                logger_1.logger.error('Error handling checkout session completed:', error);
                throw error;
            }
        });
    }
    /**
     * Handle subscription updated event
     */
    handleSubscriptionUpdated(subscriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find subscription by Stripe subscription ID
                const subscription = yield Subscription_1.Subscription.findOne({
                    stripeSubscriptionId: subscriptionData.id,
                });
                if (!subscription) {
                    logger_1.logger.warn(`Subscription not found: ${subscriptionData.id}`);
                    return;
                }
                // Update subscription details
                subscription.status = subscriptionData.status;
                subscription.currentPeriodStart = new Date(subscriptionData.current_period_start * 1000);
                subscription.currentPeriodEnd = new Date(subscriptionData.current_period_end * 1000);
                subscription.cancelAtPeriodEnd = subscriptionData.cancel_at_period_end;
                if (subscriptionData.trial_end) {
                    subscription.trialEnd = new Date(subscriptionData.trial_end * 1000);
                }
                // Check if plan changed
                const priceId = subscriptionData.items.data[0].price.id;
                if (subscription.priceId !== priceId) {
                    subscription.priceId = priceId;
                    subscription.planId = subscriptionData.items.data[0].price.product;
                }
                yield subscription.save();
                // Update user subscription status
                yield User_1.User.updateOne({ _id: subscription.userId }, {
                    subscriptionStatus: subscriptionData.status,
                });
                logger_1.logger.info(`Subscription updated for user ${subscription.userId}`);
            }
            catch (error) {
                logger_1.logger.error('Error handling subscription updated:', error);
                throw error;
            }
        });
    }
    /**
     * Handle subscription deleted event
     */
    handleSubscriptionDeleted(subscriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find subscription by Stripe subscription ID
                const subscription = yield Subscription_1.Subscription.findOne({
                    stripeSubscriptionId: subscriptionData.id,
                });
                if (!subscription) {
                    logger_1.logger.warn(`Subscription not found: ${subscriptionData.id}`);
                    return;
                }
                // Update subscription status
                subscription.status = 'canceled';
                yield subscription.save();
                // Update user subscription status
                yield User_1.User.updateOne({ _id: subscription.userId }, {
                    subscriptionStatus: 'inactive',
                });
                logger_1.logger.info(`Subscription canceled for user ${subscription.userId}`);
            }
            catch (error) {
                logger_1.logger.error('Error handling subscription deleted:', error);
                throw error;
            }
        });
    }
    /**
     * Handle invoice payment succeeded event
     */
    handleInvoicePaymentSucceeded(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Only process subscription invoices
                if (!invoice.subscription) {
                    return;
                }
                // Find subscription by Stripe subscription ID
                const subscription = yield Subscription_1.Subscription.findOne({
                    stripeSubscriptionId: invoice.subscription,
                });
                if (!subscription) {
                    logger_1.logger.warn(`Subscription not found: ${invoice.subscription}`);
                    return;
                }
                // Update payment status
                subscription.lastPaymentStatus = 'succeeded';
                subscription.lastPaymentDate = new Date();
                yield subscription.save();
                logger_1.logger.info(`Payment succeeded for subscription ${subscription.stripeSubscriptionId}`);
            }
            catch (error) {
                logger_1.logger.error('Error handling invoice payment succeeded:', error);
                throw error;
            }
        });
    }
    /**
     * Handle invoice payment failed event
     */
    handleInvoicePaymentFailed(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Only process subscription invoices
                if (!invoice.subscription) {
                    return;
                }
                // Find subscription by Stripe subscription ID
                const subscription = yield Subscription_1.Subscription.findOne({
                    stripeSubscriptionId: invoice.subscription,
                });
                if (!subscription) {
                    logger_1.logger.warn(`Subscription not found: ${invoice.subscription}`);
                    return;
                }
                // Update payment status
                subscription.lastPaymentStatus = 'failed';
                yield subscription.save();
                // TODO: Notify user about payment failure
                logger_1.logger.info(`Payment failed for subscription ${subscription.stripeSubscriptionId}`);
            }
            catch (error) {
                logger_1.logger.error('Error handling invoice payment failed:', error);
                throw error;
            }
        });
    }
    /**
     * Get invoice history for user
     */
    getInvoices(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get subscription to find Stripe customer ID
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription || !subscription.stripeCustomerId) {
                    return [];
                }
                // Get invoices from Stripe
                const invoices = yield stripe.invoices.list({
                    customer: subscription.stripeCustomerId,
                    limit: 24, // Last 2 years of monthly invoices
                });
                // Format response
                return invoices.data.map(invoice => ({
                    id: invoice.id,
                    number: invoice.number,
                    date: new Date(invoice.created * 1000),
                    amount: invoice.total,
                    currency: invoice.currency,
                    status: invoice.status,
                    pdfUrl: invoice.invoice_pdf,
                    description: invoice.description || 'Subscription payment',
                }));
            }
            catch (error) {
                logger_1.logger.error('Error fetching invoices:', error);
                throw new Error('Unable to fetch invoice history');
            }
        });
    }
    /**
     * Get invoice details
     */
    getInvoiceDetail(userId, invoiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get subscription to verify user has access to this invoice
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription || !subscription.stripeCustomerId) {
                    throw new Error('No active subscription found');
                }
                // Get invoice from Stripe
                const invoice = yield stripe.invoices.retrieve(invoiceId);
                // Verify the invoice belongs to this user
                if (invoice.customer !== subscription.stripeCustomerId) {
                    throw new Error('Invoice not found');
                }
                // Format line items
                const lineItems = invoice.lines.data.map(item => ({
                    id: item.id,
                    description: item.description,
                    amount: item.amount,
                    currency: item.currency,
                    period: {
                        start: new Date(item.period.start * 1000),
                        end: new Date(item.period.end * 1000),
                    },
                    quantity: item.quantity,
                }));
                // Format response
                return {
                    id: invoice.id,
                    number: invoice.number,
                    date: new Date(invoice.created * 1000),
                    dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
                    amount: {
                        subtotal: invoice.subtotal,
                        total: invoice.total,
                        tax: invoice.tax,
                        discount: invoice.discount,
                    },
                    currency: invoice.currency,
                    status: invoice.status,
                    pdfUrl: invoice.invoice_pdf,
                    hostedInvoiceUrl: invoice.hosted_invoice_url,
                    description: invoice.description,
                    lineItems,
                };
            }
            catch (error) {
                logger_1.logger.error('Error fetching invoice detail:', error);
                throw new Error('Unable to fetch invoice details');
            }
        });
    }
    /**
     * Add payment method for user
     */
    addPaymentMethod(userId_1, paymentMethodId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, paymentMethodId, setAsDefault = false) {
            try {
                // Get subscription to find Stripe customer ID
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription || !subscription.stripeCustomerId) {
                    throw new Error('No active subscription found');
                }
                // Attach payment method to customer
                yield stripe.paymentMethods.attach(paymentMethodId, {
                    customer: subscription.stripeCustomerId,
                });
                // Set as default payment method if requested
                if (setAsDefault) {
                    yield stripe.customers.update(subscription.stripeCustomerId, {
                        invoice_settings: {
                            default_payment_method: paymentMethodId,
                        },
                    });
                    // Update subscription
                    subscription.defaultPaymentMethodId = paymentMethodId;
                    yield subscription.save();
                }
                return { success: true };
            }
            catch (error) {
                logger_1.logger.error('Error adding payment method:', error);
                throw new Error('Unable to add payment method');
            }
        });
    }
    /**
     * Remove payment method
     */
    removePaymentMethod(userId, paymentMethodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get subscription to find Stripe customer ID and verify ownership
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription || !subscription.stripeCustomerId) {
                    throw new Error('No active subscription found');
                }
                // Get payment methods to verify ownership
                const paymentMethods = yield stripe.paymentMethods.list({
                    customer: subscription.stripeCustomerId,
                    type: 'card',
                });
                // Check if payment method belongs to this customer
                const paymentMethod = paymentMethods.data.find(pm => pm.id === paymentMethodId);
                if (!paymentMethod) {
                    throw new Error('Payment method not found');
                }
                // Check if it's the default payment method
                if (subscription.defaultPaymentMethodId === paymentMethodId) {
                    throw new Error('Cannot remove default payment method. Please set another as default first.');
                }
                // Detach payment method
                yield stripe.paymentMethods.detach(paymentMethodId);
                return { success: true };
            }
            catch (error) {
                logger_1.logger.error('Error removing payment method:', error);
                throw new Error('Unable to remove payment method');
            }
        });
    }
    /**
     * List payment methods for user
     */
    getPaymentMethods(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get subscription to find Stripe customer ID
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription || !subscription.stripeCustomerId) {
                    return [];
                }
                // Get payment methods from Stripe
                const paymentMethods = yield stripe.paymentMethods.list({
                    customer: subscription.stripeCustomerId,
                    type: 'card',
                });
                // Format response
                return paymentMethods.data.map(pm => ({
                    id: pm.id,
                    type: pm.type,
                    isDefault: pm.id === subscription.defaultPaymentMethodId,
                    card: pm.card ? {
                        brand: pm.card.brand,
                        last4: pm.card.last4,
                        expMonth: pm.card.exp_month,
                        expYear: pm.card.exp_year,
                        country: pm.card.country,
                    } : null,
                    billingDetails: pm.billing_details,
                    created: new Date(pm.created * 1000),
                }));
            }
            catch (error) {
                logger_1.logger.error('Error fetching payment methods:', error);
                throw new Error('Unable to fetch payment methods');
            }
        });
    }
    /**
     * Get usage statistics for user
     */
    getUsageStatistics(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Implementation will depend on how you track usage in your application
                // This is a placeholder implementation
                // Get current subscription details
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription) {
                    throw new Error('No active subscription found');
                }
                // TODO: Get actual usage statistics from your usage tracking system
                // This could be from a database, analytics service, etc.
                return {
                    storage: {
                        used: 2.5, // GB
                        limit: 10, // GB
                        percentage: 25, // %
                    },
                    api: {
                        used: 5000, // requests
                        limit: 10000, // requests
                        percentage: 50, // %
                    },
                    sessions: {
                        used: 120, // minutes
                        limit: 500, // minutes
                        percentage: 24, // %
                    },
                    // Add other metrics as needed
                };
            }
            catch (error) {
                logger_1.logger.error('Error fetching usage statistics:', error);
                throw new Error('Unable to fetch usage statistics');
            }
        });
    }
    /**
     * Estimate cost for usage or plan upgrade
     */
    estimateCost(userId, planId, projectedUsage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get current subscription
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription && !planId) {
                    throw new Error('No subscription found and no plan specified');
                }
                // If plan ID is provided, get plan details
                let targetPlan = null;
                if (planId) {
                    const product = yield stripe.products.retrieve(planId, {
                        expand: ['default_price'],
                    });
                    const price = product.default_price;
                    targetPlan = {
                        id: product.id,
                        name: product.name,
                        price: {
                            id: price.id,
                            unitAmount: price.unit_amount,
                            currency: price.currency,
                            interval: price.type === 'recurring' && price.recurring ?
                                price.recurring.interval : null,
                        },
                    };
                }
                // Calculate base cost
                const baseCost = targetPlan ?
                    (targetPlan.price.unitAmount || 0) / 100 : // Convert from cents
                    yield this.getCurrentSubscriptionCost(userId);
                // Calculate additional costs based on projected usage
                // This is just an example, actual implementation will depend on your pricing model
                let additionalCosts = 0;
                if (projectedUsage) {
                    if (projectedUsage.storage && projectedUsage.storage > 10) {
                        additionalCosts += (projectedUsage.storage - 10) * 2; // $2 per GB over limit
                    }
                    if (projectedUsage.api && projectedUsage.api > 10000) {
                        additionalCosts += (projectedUsage.api - 10000) * 0.001; // $0.001 per request over limit
                    }
                    // Add other metrics as needed
                }
                return {
                    baseCost,
                    additionalCosts,
                    totalCost: baseCost + additionalCosts,
                    currency: targetPlan ? targetPlan.price.currency : 'usd',
                };
            }
            catch (error) {
                logger_1.logger.error('Error estimating cost:', error);
                throw new Error('Unable to estimate cost');
            }
        });
    }
    /**
     * Get current subscription cost
     * Helper method for estimateCost
     */
    getCurrentSubscriptionCost(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscription = yield Subscription_1.Subscription.findOne({ userId });
                if (!subscription) {
                    return 0;
                }
                const price = yield stripe.prices.retrieve(subscription.priceId);
                return price.unit_amount ? price.unit_amount / 100 : 0; // Convert from cents
            }
            catch (error) {
                logger_1.logger.error('Error getting current subscription cost:', error);
                return 0;
            }
        });
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map