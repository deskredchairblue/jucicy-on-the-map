import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';

export class BillingController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Get pricing plans
   */
  getPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await this.paymentService.getPlans();
      return res.status(200).json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create checkout session
   */
  createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, successUrl, cancelUrl } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const checkoutSession = await this.paymentService.createCheckoutSession(
        userId,
        planId,
        successUrl,
        cancelUrl
      );
      
      return res.status(200).json({ 
        success: true, 
        data: { sessionId: checkoutSession.id, url: checkoutSession.url } 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create billing portal session
   */
  createBillingPortalSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { returnUrl } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const portalSession = await this.paymentService.createBillingPortalSession(
        userId,
        returnUrl
      );
      
      return res.status(200).json({ 
        success: true, 
        data: { url: portalSession.url } 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get billing status
   */
  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const status = await this.paymentService.getBillingStatus(userId);
      
      return res.status(200).json({ 
        success: true, 
        data: status 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle webhook events from payment provider
   */
  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verify webhook signature from Stripe/PayPal
      const signature = req.headers['stripe-signature'] as string;
      const event = await this.paymentService.constructWebhookEvent(req.body, signature);
      
      // Process the event
      await this.paymentService.handleWebhookEvent(event);
      
      return res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get invoice history
   */
  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const invoices = await this.paymentService.getInvoices(userId);
      
      return res.status(200).json({ 
        success: true, 
        data: invoices 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get invoice details
   */
  getInvoiceDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const invoiceId = req.params.id;
      const invoice = await this.paymentService.getInvoiceDetail(userId, invoiceId);
      
      return res.status(200).json({ 
        success: true, 
        data: invoice 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add payment method
   */
  addPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const { paymentMethodId, setAsDefault } = req.body;
      
      const result = await this.paymentService.addPaymentMethod(
        userId,
        paymentMethodId,
        setAsDefault
      );
      
      return res.status(200).json({ 
        success: true, 
        data: result 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove payment method
   */
  removePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const paymentMethodId = req.params.id;
      
      await this.paymentService.removePaymentMethod(userId, paymentMethodId);
      
      return res.status(200).json({ 
        success: true,
        message: 'Payment method removed successfully' 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * List payment methods
   */
  getPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const methods = await this.paymentService.getPaymentMethods(userId);
      
      return res.status(200).json({ 
        success: true, 
        data: methods 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get usage statistics
   */
  getUsageStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const usage = await this.paymentService.getUsageStatistics(userId);
      
      return res.status(200).json({ 
        success: true, 
        data: usage 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Estimate cost for usage or plan upgrade
   */
  estimateCost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const { planId, projectedUsage } = req.body;
      
      const estimate = await this.paymentService.estimateCost(
        userId,
        planId,
        projectedUsage
      );
      
      return res.status(200).json({ 
        success: true, 
        data: estimate 
      });
    } catch (error) {
      next(error);
    }
  };
}