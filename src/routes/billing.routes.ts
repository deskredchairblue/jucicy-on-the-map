import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { BillingController } from '../controllers/billing.controller';

const router = Router();
const billingController = new BillingController();

// Get pricing plans
router.get('/plans', billingController.getPlans);

// Create checkout session
router.post(
  '/checkout', 
  authMiddleware,
  body('planId').isString().notEmpty(),
  body('successUrl').isURL().optional(),
  body('cancelUrl').isURL().optional(),
  billingController.createCheckoutSession
);

// Create billing portal session
router.post(
  '/portal',
  authMiddleware,
  body('returnUrl').isURL().optional(),
  billingController.createBillingPortalSession
);

// Get billing status
router.get(
  '/status',
  authMiddleware,
  billingController.getStatus
);

// Handle webhook events from payment provider
router.post(
  '/webhook',
  billingController.handleWebhook
);

// Get invoice history
router.get(
  '/history',
  authMiddleware,
  billingController.getInvoices
);

// Get invoice details
router.get(
  '/invoice/:id',
  authMiddleware,
  param('id').isString().notEmpty(),
  billingController.getInvoiceDetail
);

// Add payment method
router.post(
  '/method',
  authMiddleware,
  body('paymentMethodId').isString().notEmpty(),
  body('setAsDefault').isBoolean().optional(),
  billingController.addPaymentMethod
);

// Remove payment method
router.delete(
  '/method/:id',
  authMiddleware,
  param('id').isString().notEmpty(),
  billingController.removePaymentMethod
);

// List payment methods
router.get(
  '/methods',
  authMiddleware,
  billingController.getPaymentMethods
);

// Get usage statistics
router.get(
  '/usage',
  authMiddleware,
  billingController.getUsageStatistics
);

// Estimate cost for usage or plan upgrade
router.post(
  '/estimate',
  authMiddleware,
  body('planId').isString().optional(),
  body('projectedUsage').isObject().optional(),
  billingController.estimateCost
);

export default router;