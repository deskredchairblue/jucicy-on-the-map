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
const stripe_1 = __importDefault(require("stripe"));
const database_1 = require("../database");
const User_1 = require("../models/User");
const Subscription_1 = require("../models/Subscription");
const Invoice_1 = require("../models/Invoice");
const errorHandler_1 = require("../utils/errorHandler");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
// Initialize Stripe
const stripe = new stripe_1.default(config_1.config.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
class BillingService {
    /**
     * Handle webhooks from payment providers
     */
    handleWebhook(payload, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify and construct the event
                const event = stripe.webhooks.constructEvent(payload, signature, config_1.config.STRIPE_WEBHOOK_SECRET);
                // Handle the event based on its type
                switch (event.type) {
                    case 'customer.subscription.created':
                    case 'customer.subscription.updated':
                        yield this.handleSubscriptionUpdated(event.data.object);
                        break;
                    case 'customer.subscription.deleted':
                        yield this.handleSubscriptionDeleted(event.data.object);
                        break;
                    case 'invoice.payment_succeeded':
                        yield this.handleInvoicePaymentSucceeded(event.data.object);
                        break;
                    case 'invoice.payment_failed':
                        yield this.handleInvoicePaymentFailed(event.data.object);
                        break;
                    default:
                        logger_1.default.debug(`Unhandled event type: ${event.type}`);
                }
                return true;
            }
            catch (error) {
                logger_1.default.error(`Error processing webhook: ${error.message}`);
                throw new errorHandler_1.ApiError(`Error processing webhook: ${error.message}`, 500);
            }
        });
    }
    /**
     * Get available subscription plans
     */
    getPlans() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch plans from Stripe
                const prices = yield stripe.prices.list({
                    active: true,
                    expand: ['data.product']
                });
                // Format the plans
                const plans = prices.data.map(price => {
                    var _a, _b, _c;
                    const product = price.product;
                    return {
                        id: price.id,
                        name: product.name,
                        description: product.description,
                        price: {
                            amount: price.unit_amount,
                            currency: price.currency,
                            interval: (_a = price.recurring) === null || _a === void 0 ? void 0 : _a.interval,
                            intervalCount: (_b = price.recurring) === null || _b === void 0 ? void 0 : _b.interval_count
                        },
                        features: ((_c = product.metadata) === null || _c === void 0 ? void 0 : _c.features) ? JSON.parse(product.metadata.features) : [],
                        active: price.active
                    };
                });
                return plans;
            }
            catch (error) {
                logger_1.default.error(`Get plans error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get subscription plans', 500);
            }
        });
    }
    /**
     * Create a new subscription
     */
    createSubscription(userId, priceId, paymentMethodId, couponCode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const subscriptionRepository = database_1.AppDataSource.getRepository(Subscription_1.Subscription);
                // Get the user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // Check if user already has a Stripe customer ID
                let customerId = user.stripeCustomerId;
                if (!customerId) {
                    // Create a new customer
                    const customer = yield stripe.customers.create({
                        email: user.email,
                        name: user.getFullName(),
                        metadata: { userId: user.id }
                    });
                    customerId = customer.id;
                    // Save the customer ID
                    user.stripeCustomerId = customerId;
                    yield userRepository.save(user);
                }
                // If a payment method is provided, attach it to the customer
                if (paymentMethodId) {
                    yield stripe.paymentMethods.attach(paymentMethodId, {
                        customer: customerId
                    });
                    // Set as default payment method
                    yield stripe.customers.update(customerId, {
                        invoice_settings: {
                            default_payment_method: paymentMethodId
                        }
                    });
                }
                // Check if the user already has an active subscription
                const existingSubscription = yield subscriptionRepository.findOne({
                    where: {
                        user: { id: userId },
                        status: Subscription_1.SubscriptionStatus.ACTIVE
                    }
                });
                if (existingSubscription) {
                    throw new errorHandler_1.ApiError('User already has an active subscription', 409);
                }
                // Create the subscription in Stripe
                const subscriptionData = {
                    customer: customerId,
                    items: [{ price: priceId }],
                    expand: ['latest_invoice.payment_intent']
                };
                // Add coupon if provided
                if (couponCode) {
                    subscriptionData.coupon = couponCode;
                }
                const stripeSubscription = yield stripe.subscriptions.create(subscriptionData);
                // Create the subscription in the database
                const subscription = new Subscription_1.Subscription();
                subscription.user = user;
                subscription.externalId = stripeSubscription.id;
                subscription.planId = priceId;
                subscription.status = this.mapStripeStatusToSubscriptionStatus(stripeSubscription.status);
                subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
                subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
                // Get plan details
                const price = yield stripe.prices.retrieve(priceId, {
                    expand: ['product']
                });
                const product = price.product;
                subscription.planName = product.name;
                subscription.amount = price.unit_amount || 0;
                subscription.currency = price.currency;
                subscription.interval = ((_a = price.recurring) === null || _a === void 0 ? void 0 : _a.interval) || 'month';
                yield subscriptionRepository.save(subscription);
                // Get the invoice
                let paymentStatus = null;
                let clientSecret = null;
                if (stripeSubscription.latest_invoice) {
                    const invoice = stripeSubscription.latest_invoice;
                    if (invoice.payment_intent) {
                        const paymentIntent = invoice.payment_intent;
                        paymentStatus = paymentIntent.status;
                        clientSecret = paymentIntent.client_secret;
                    }
                }
                return {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    paymentStatus,
                    clientSecret
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Create subscription error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to create subscription', 500);
            }
        });
    }
    /**
     * Get a user's subscription
     */
    getSubscription(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptionRepository = database_1.AppDataSource.getRepository(Subscription_1.Subscription);
                // Get the user's subscription
                const subscription = yield subscriptionRepository.findOne({
                    where: { user: { id: userId } },
                    order: { createdAt: 'DESC' }
                });
                if (!subscription) {
                    return null;
                }
                // Get the subscription from Stripe for up-to-date information
                const stripeSubscription = yield stripe.subscriptions.retrieve(subscription.externalId);
                // Update the subscription if the status has changed
                if (this.mapStripeStatusToSubscriptionStatus(stripeSubscription.status) !== subscription.status) {
                    subscription.status = this.mapStripeStatusToSubscriptionStatus(stripeSubscription.status);
                    yield subscriptionRepository.save(subscription);
                }
                // Format the response
                return {
                    id: subscription.id,
                    planId: subscription.planId,
                    planName: subscription.planName,
                    status: subscription.status,
                    currentPeriodStart: subscription.currentPeriodStart,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                    amount: subscription.amount,
                    currency: subscription.currency,
                    interval: subscription.interval
                };
            }
            catch (error) {
                logger_1.default.error(`Get subscription error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get subscription', 500);
            }
        });
    }
    /**
     * Add a payment method
     */
    addPaymentMethod(userId_1, paymentMethodId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, paymentMethodId, makeDefault = false) {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                // Get the user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                if (!user.stripeCustomerId) {
                    throw new errorHandler_1.ApiError('User does not have a Stripe customer ID', 404);
                }
                // Attach the payment method to the customer
                yield stripe.paymentMethods.attach(paymentMethodId, {
                    customer: user.stripeCustomerId
                });
                // Set as default if requested
                if (makeDefault) {
                    yield stripe.customers.update(user.stripeCustomerId, {
                        invoice_settings: {
                            default_payment_method: paymentMethodId
                        }
                    });
                }
                // Get the payment method details
                const paymentMethod = yield stripe.paymentMethods.retrieve(paymentMethodId);
                return {
                    id: paymentMethod.id,
                    type: paymentMethod.type,
                    card: paymentMethod.card ? {
                        brand: paymentMethod.card.brand,
                        last4: paymentMethod.card.last4,
                        expMonth: paymentMethod.card.exp_month,
                        expYear: paymentMethod.card.exp_year
                    } : null,
                    billing_details: paymentMethod.billing_details,
                    isDefault: makeDefault
                };
            }
            catch (error) {
                logger_1.default.error(`Add payment method error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to add payment method', 500);
            }
        });
    }
    /**
     * Update a payment method
     */
    updatePaymentMethod(userId_1, paymentMethodId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, paymentMethodId, isDefault = false, billingDetails) {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                // Get the user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                if (!user.stripeCustomerId) {
                    throw new errorHandler_1.ApiError('User does not have a Stripe customer ID', 404);
                }
                // Verify the payment method belongs to the user
                const paymentMethods = yield stripe.paymentMethods.list({
                    customer: user.stripeCustomerId,
                    type: 'card'
                });
                const paymentMethod = paymentMethods.data.find(pm => pm.id === paymentMethodId);
                if (!paymentMethod) {
                    throw new errorHandler_1.ApiError('Payment method not found or does not belong to the user', 404);
                }
                // Update billing details if provided
                if (billingDetails) {
                    yield stripe.paymentMethods.update(paymentMethodId, {
                        billing_details: billingDetails
                    });
                }
                // Set as default if requested
                if (isDefault) {
                    yield stripe.customers.update(user.stripeCustomerId, {
                        invoice_settings: {
                            default_payment_method: paymentMethodId
                        }
                    });
                }
                // Get the updated payment method
                const updatedPaymentMethod = yield stripe.paymentMethods.retrieve(paymentMethodId);
                return {
                    id: updatedPaymentMethod.id,
                    type: updatedPaymentMethod.type,
                    card: updatedPaymentMethod.card ? {
                        brand: updatedPaymentMethod.card.brand,
                        last4: updatedPaymentMethod.card.last4,
                        expMonth: updatedPaymentMethod.card.exp_month,
                        expYear: updatedPaymentMethod.card.exp_year
                    } : null,
                    billing_details: updatedPaymentMethod.billing_details,
                    isDefault
                };
            }
            catch (error) {
                logger_1.default.error(`Update payment method error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to update payment method', 500);
            }
        });
    }
    /**
     * Delete a payment method
     */
    deletePaymentMethod(userId, paymentMethodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                // Get the user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                if (!user.stripeCustomerId) {
                    throw new errorHandler_1.ApiError('User does not have a Stripe customer ID', 404);
                }
                // Verify the payment method belongs to the user
                const paymentMethods = yield stripe.paymentMethods.list({
                    customer: user.stripeCustomerId,
                    type: 'card'
                });
                const paymentMethod = paymentMethods.data.find(pm => pm.id === paymentMethodId);
                if (!paymentMethod) {
                    throw new errorHandler_1.ApiError('Payment method not found or does not belong to the user', 404);
                }
                // Get the default payment method
                const customer = yield stripe.customers.retrieve(user.stripeCustomerId);
                // Check if this is the default payment method
                if (customer.invoice_settings.default_payment_method === paymentMethodId) {
                    // Find another payment method to set as default
                    const otherPaymentMethods = paymentMethods.data.filter(pm => pm.id !== paymentMethodId);
                    if (otherPaymentMethods.length > 0) {
                        yield stripe.customers.update(user.stripeCustomerId, {
                            invoice_settings: {
                                default_payment_method: otherPaymentMethods[0].id
                            }
                        });
                    }
                }
                // Detach the payment method
                yield stripe.paymentMethods.detach(paymentMethodId);
                return true;
            }
            catch (error) {
                logger_1.default.error(`Delete payment method error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to delete payment method', 500);
            }
        });
    }
    /**
     * Get invoices for a user
     */
    getInvoices(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10, startingAfter) {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                // Get the user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                if (!user.stripeCustomerId) {
                    return {
                        data: [],
                        has_more: false
                    };
                }
                // Get invoices from Stripe
                const params = {
                    customer: user.stripeCustomerId,
                    limit,
                    status: 'paid'
                };
                if (startingAfter) {
                    params.starting_after = startingAfter;
                }
                const invoices = yield stripe.invoices.list(params);
                // Format the invoices
                const formattedInvoices = invoices.data.map(invoice => ({
                    id: invoice.id,
                    number: invoice.number,
                    amount: invoice.total,
                    currency: invoice.currency,
                    status: invoice.status,
                    created: new Date(invoice.created * 1000),
                    periodStart: new Date(invoice.period_start * 1000),
                    periodEnd: new Date(invoice.period_end * 1000),
                    pdfUrl: invoice.invoice_pdf
                }));
                return {
                    data: formattedInvoices,
                    has_more: invoices.has_more
                };
            }
            catch (error) {
                logger_1.default.error(`Get invoices error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get invoices', 500);
            }
        });
    }
    /**
     * Get a specific invoice
     */
    getInvoice(userId, invoiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                // Get the user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                if (!user.stripeCustomerId) {
                    throw new errorHandler_1.ApiError('User does not have a Stripe customer ID', 404);
                }
                // Get the invoice from Stripe
                const invoice = yield stripe.invoices.retrieve(invoiceId);
                // Verify the invoice belongs to the user
                if (invoice.customer !== user.stripeCustomerId) {
                    throw new errorHandler_1.ApiError('Invoice not found or does not belong to the user', 404);
                }
                // Format the invoice
                return {
                    id: invoice.id,
                    number: invoice.number,
                    amount: invoice.total,
                    currency: invoice.currency,
                    status: invoice.status,
                    created: new Date(invoice.created * 1000),
                    periodStart: new Date(invoice.period_start * 1000),
                    periodEnd: new Date(invoice.period_end * 1000),
                    pdfUrl: invoice.invoice_pdf,
                    lines: invoice.lines.data.map(line => ({
                        id: line.id,
                        description: line.description,
                        amount: line.amount,
                        currency: invoice.currency,
                        quantity: line.quantity,
                        period: line.period ? {
                            start: new Date(line.period.start * 1000),
                            end: new Date(line.period.end * 1000)
                        } : null
                    }))
                };
            }
            catch (error) {
                logger_1.default.error(`Get invoice error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get invoice', 500);
            }
        });
    }
    /**
     * Cancel a subscription
     */
    cancelSubscription(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, atPeriodEnd = true) {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const subscriptionRepository = database_1.AppDataSource.getRepository(Subscription_1.Subscription);
                // Get the user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // Get the user's subscription
                const subscription = yield subscriptionRepository.findOne({
                    where: {
                        user: { id: userId },
                        status: Subscription_1.SubscriptionStatus.ACTIVE
                    }
                });
                if (!subscription) {
                    throw new errorHandler_1.ApiError('No active subscription found', 404);
                }
                // Cancel the subscription in Stripe
                const updatedSubscription = yield stripe.subscriptions.update(subscription.externalId, {
                    cancel_at_period_end: atPeriodEnd
                });
                // If canceling immediately, update the status
                if (!atPeriodEnd) {
                    const canceledSubscription = yield stripe.subscriptions.cancel(subscription.externalId);
                    subscription.status = this.mapStripeStatusToSubscriptionStatus(canceledSubscription.status);
                }
                // Update the subscription cancel_at_period_end flag
                subscription.cancelAtPeriodEnd = atPeriodEnd;
                yield subscriptionRepository.save(subscription);
                return {
                    id: subscription.id,
                    canceled: true,
                    cancelAtPeriodEnd: atPeriodEnd,
                    currentPeriodEnd: subscription.currentPeriodEnd
                };
            }
            catch (error) {
                logger_1.default.error(`Cancel subscription error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to cancel subscription', 500);
            }
        });
    }
    /**
     * Resume a canceled subscription
     */
    resumeSubscription(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const subscriptionRepository = database_1.AppDataSource.getRepository(Subscription_1.Subscription);
                // Get the user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // Get the user's subscription
                const subscription = yield subscriptionRepository.findOne({
                    where: {
                        user: { id: userId },
                        cancelAtPeriodEnd: true
                    }
                });
                if (!subscription) {
                    throw new errorHandler_1.ApiError('No subscription to resume found', 404);
                }
                // Resume the subscription in Stripe
                yield stripe.subscriptions.update(subscription.externalId, {
                    cancel_at_period_end: false
                });
                // Update the subscription
                subscription.cancelAtPeriodEnd = false;
                yield subscriptionRepository.save(subscription);
                return {
                    id: subscription.id,
                    resumed: true,
                    cancelAtPeriodEnd: false,
                    currentPeriodEnd: subscription.currentPeriodEnd
                };
            }
            catch (error) {
                logger_1.default.error(`Resume subscription error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to resume subscription', 500);
            }
        });
    }
    /**
     * Get all subscriptions (admin only)
     */
    getAllSubscriptions() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20, status) {
            try {
                const subscriptionRepository = database_1.AppDataSource.getRepository(Subscription_1.Subscription);
                // Build the query
                const query = {};
                if (status) {
                    query.status = status;
                }
                // Get the subscriptions with pagination
                const [subscriptions, total] = yield subscriptionRepository.findAndCount({
                    where: query,
                    relations: ['user'],
                    skip: (page - 1) * limit,
                    take: limit,
                    order: { createdAt: 'DESC' }
                });
                // Format the response
                const formattedSubscriptions = subscriptions.map(subscription => ({
                    id: subscription.id,
                    userId: subscription.user.id,
                    email: subscription.user.email,
                    planId: subscription.planId,
                    planName: subscription.planName,
                    status: subscription.status,
                    amount: subscription.amount,
                    currency: subscription.currency,
                    interval: subscription.interval,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                    createdAt: subscription.createdAt
                }));
                return {
                    data: formattedSubscriptions,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                };
            }
            catch (error) {
                logger_1.default.error(`Get all subscriptions error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get all subscriptions', 500);
            }
        });
    }
    /**
     * Handle subscription updated webhook event
     */
    handleSubscriptionUpdated(stripeSubscription) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const subscriptionRepository = database_1.AppDataSource.getRepository(Subscription_1.Subscription);
                // Find the user by Stripe customer ID
                const user = yield userRepository.findOne({
                    where: { stripeCustomerId: stripeSubscription.customer }
                });
                if (!user) {
                    logger_1.default.error(`User not found for Stripe customer: ${stripeSubscription.customer}`);
                    return;
                }
                // Find the subscription in the database
                let subscription = yield subscriptionRepository.findOne({
                    where: { externalId: stripeSubscription.id }
                });
                if (!subscription) {
                    // If the subscription does not exist in the database, create a new one.
                    subscription = new Subscription_1.Subscription();
                    subscription.externalId = stripeSubscription.id;
                    subscription.user = user;
                }
                // Update the subscription details
                subscription.planId = stripeSubscription.items.data[0].price.id;
                const price = yield stripe.prices.retrieve(subscription.planId, {
                    expand: ['product'],
                });
                const product = price.product;
                subscription.planName = product.name;
                subscription.amount = price.unit_amount || 0;
                subscription.currency = price.currency;
                subscription.interval = ((_a = price.recurring) === null || _a === void 0 ? void 0 : _a.interval) || 'month';
                subscription.status = this.mapStripeStatusToSubscriptionStatus(stripeSubscription.status);
                subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
                subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
                subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
                yield subscriptionRepository.save(subscription);
            }
            catch (error) {
                logger_1.default.error(`Error handling subscription updated: ${error}`);
            }
        });
    }
    /**
     * Handle subscription deleted webhook event
     */
    handleSubscriptionDeleted(stripeSubscription) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptionRepository = database_1.AppDataSource.getRepository(Subscription_1.Subscription);
                // Find the subscription in the database
                const subscription = yield subscriptionRepository.findOne({
                    where: { externalId: stripeSubscription.id }
                });
                if (subscription) {
                    // Update the subscription status
                    subscription.status = this.mapStripeStatusToSubscriptionStatus(stripeSubscription.status);
                    yield subscriptionRepository.save(subscription);
                }
            }
            catch (error) {
                logger_1.default.error(`Error handling subscription deleted: ${error}`);
            }
        });
    }
    /**
     * Handle invoice payment succeeded webhook event
     */
    handleInvoicePaymentSucceeded(stripeInvoice) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const invoiceRepository = database_1.AppDataSource.getRepository(Invoice_1.Invoice);
                // Find or create the invoice in the database
                let invoice = yield invoiceRepository.findOne({
                    where: { externalId: stripeInvoice.id }
                });
                if (!invoice) {
                    invoice = new Invoice_1.Invoice();
                    invoice.externalId = stripeInvoice.id;
                }
                // Update invoice details
                invoice.amount = stripeInvoice.total;
                invoice.currency = stripeInvoice.currency;
                invoice.status = stripeInvoice.status;
                invoice.periodStart = new Date(stripeInvoice.period_start * 1000);
                invoice.periodEnd = new Date(stripeInvoice.period_end * 1000);
                invoice.pdfUrl = stripeInvoice.invoice_pdf;
                yield invoiceRepository.save(invoice);
            }
            catch (error) {
                logger_1.default.error(`Error handling invoice payment succeeded: ${error}`);
            }
        });
    }
    /**
     * Handle invoice payment failed webhook event
     */
    handleInvoicePaymentFailed(stripeInvoice) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const invoiceRepository = database_1.AppDataSource.getRepository(Invoice_1.Invoice);
                // Find or create the invoice in the database
                let invoice = yield invoiceRepository.findOne({
                    where: { externalId: stripeInvoice.id }
                });
                if (!invoice) {
                    invoice = new Invoice_1.Invoice();
                    invoice.externalId = stripeInvoice.id;
                }
                // Update invoice details
                invoice.amount = stripeInvoice.total;
                invoice.currency = stripeInvoice.currency;
                invoice.status = stripeInvoice.status;
                invoice.periodStart = new Date(stripeInvoice.period_start * 1000);
                invoice.periodEnd = new Date(stripeInvoice.period_end * 1000);
                invoice.pdfUrl = stripeInvoice.invoice_pdf;
                yield invoiceRepository.save(invoice);
            }
            catch (error) {
                logger_1.default.error(`Error handling invoice payment failed: ${error}`);
            }
        });
    }
    /**
     * Map Stripe subscription status to SubscriptionStatus enum
     */
    mapStripeStatusToSubscriptionStatus(status) {
        switch (status) {
            case 'active':
                return Subscription_1.SubscriptionStatus.ACTIVE;
            case 'past_due':
                return Subscription_1.SubscriptionStatus.PAST_DUE;
            case 'unpaid':
                return Subscription_1.SubscriptionStatus.UNPAID;
            case 'canceled':
                return Subscription_1.SubscriptionStatus.CANCELED;
            case 'incomplete':
                return Subscription_1.SubscriptionStatus.INCOMPLETE;
            case 'incomplete_expired':
                return Subscription_1.SubscriptionStatus.INCOMPLETE_EXPIRED;
            case 'trialing':
                return Subscription_1.SubscriptionStatus.TRIALING;
            case 'paused':
                return Subscription_1.SubscriptionStatus.PAUSED;
            default:
                return Subscription_1.SubscriptionStatus.UNKNOWN;
        }
    }
}
exports.default = BillingService;
//# sourceMappingURL=billing.service.js.map