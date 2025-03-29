import { Router } from 'express';
import BillingController from '../controllers/billing.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.get('/plans', BillingController.getPlans);
router.post('/checkout', authMiddleware, BillingController.checkout);
router.get('/status', authMiddleware, BillingController.getStatus);
router.post('/webhook', BillingController.webhook);
router.get('/invoices', authMiddleware, BillingController.getInvoices);
router.get('/invoice/:id', authMiddleware, BillingController.getInvoiceDetail);
router.post('/method', authMiddleware, BillingController.addPaymentMethod);
router.delete('/method/:id', authMiddleware, BillingController.removePaymentMethod);

export default router;
