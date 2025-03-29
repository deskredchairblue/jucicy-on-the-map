import Stripe from 'stripe';
import { config } from '../config';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';

// Initialize Stripe client
const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // Use the correct Stripe API version
});

export class PaymentService {
  /**
   * Get all available pricing plans
   */
  async getPlans() {
    try {
      // Fetch products with active prices
      const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
      });

      // Format response
      const plans = products.data.map(product => {
        const price = product.default_price as Stripe.Price;
        
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
    } catch (error) {
      logger.error('Error fetching plans:', error);
      throw new Error('Unable to fetch pricing plans');
    }
  }

  /**
   * Create a checkout session for subscription purchase
   */
  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl?: string,
    cancelUrl?: string
  ) {
    try {
      // Get user
      const user = await User.findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Default URLs
      const defaultSuccessUrl = `${config.FRONTEND_URL}/billing/success`;
      const defaultCancelUrl = `${config.FRONTEND_URL}/billing/cancel`;

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
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
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw new Error('Unable to create checkout session');
    }
  }

  /**
   * Create a billing portal session for subscription management
   */
  async createBillingPortalSession(userId: string, returnUrl?: string) {
    try {
      // Get user
      const user = await User.findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Get subscription to find Stripe customer ID
      const subscription = await Subscription.findOne({ userId });
      if (!subscription || !subscription.stripeCustomerId) {
        throw new Error('No active subscription found');
      }

      // Create billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: returnUrl || `${config.FRONTEND_URL}/settings/billing`,
      });

      return session;
    } catch (error) {
      logger.error('Error creating billing portal session:', error);
      throw new Error('Unable to create billing portal session');
    }
  }

  /**
   * Get current billing status for user
   */
  async getBillingStatus(userId: string) {
    try {
      // Get subscription
      const subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        return {
          active: false,
          plan: null,
          currentPeriod: null,
          cancelAtPeriodEnd: false,
        };
      }

      // Get product information
      const product = await stripe.products.retrieve(subscription.planId);
      
      // Get price information
      const price = await stripe.prices.retrieve(subscription.priceId);

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
    } catch (error) {
      logger.error('Error fetching billing status:', error);
      throw new Error('Unable to fetch billing status');
    }
  }

  /**
   * Construct webhook event from Stripe
   */
  async constructWebhookEvent(payload: any, signature: string) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      logger.error('Error constructing webhook event:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle webhook events from Stripe
   */
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleCheckoutSessionCompleted(session);
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdated(subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionDeleted(subscription);
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleInvoicePaymentSucceeded(invoice);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleInvoicePaymentFailed(invoice);
          break;
        }
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      logger.error(`Error handling webhook event ${event.type}:`, error);
      throw new Error(`Error processing webhook: ${error.message}`);
    }
  }

  /**
   * Handle checkout session completed event
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!userId || !customerId || !subscriptionId) {
        throw new Error('Missing required data in checkout session');
      }

      // Get subscription details
      const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get default payment method
      const paymentMethodId = subscriptionData.default_payment_method as string;

      // Get price and product details
      const priceId = subscriptionData.items.data[0].price.id;
      const productId = subscriptionData.items.data[0].price.product as string;

      // Create or update subscription in our database
      await Subscription.updateOne(
        { userId },
        {
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
        },
        { upsert: true }
      );

      // Update user subscription status
      await User.updateOne(
        { _id: userId },
        {
          subscriptionStatus: 'active',
          stripeCustomerId: customerId,
        }
      );

      logger.info(`Subscription created for user ${userId}`);
    } catch (error) {
      logger.error('Error handling checkout session completed:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(subscriptionData: Stripe.Subscription) {
    try {
      // Find subscription by Stripe subscription ID
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionData.id,
      });

      if (!subscription) {
        logger.warn(`Subscription not found: ${subscriptionData.id}`);
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
        subscription.planId = subscriptionData.items.data[0].price.product as string;
      }

      await subscription.save();

      // Update user subscription status
      await User.updateOne(
        { _id: subscription.userId },
        {
          subscriptionStatus: subscriptionData.status,
        }
      );

      logger.info(`Subscription updated for user ${subscription.userId}`);
    } catch (error) {
      logger.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(subscriptionData: Stripe.Subscription) {
    try {
      // Find subscription by Stripe subscription ID
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionData.id,
      });

      if (!subscription) {
        logger.warn(`Subscription not found: ${subscriptionData.id}`);
        return;
      }

      // Update subscription status
      subscription.status = 'canceled';
      await subscription.save();

      // Update user subscription status
      await User.updateOne(
        { _id: subscription.userId },
        {
          subscriptionStatus: 'inactive',
        }
      );

      logger.info(`Subscription canceled for user ${subscription.userId}`);
    } catch (error) {
      logger.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  /**
   * Handle invoice payment succeeded event
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
      // Only process subscription invoices
      if (!invoice.subscription) {
        return;
      }

      // Find subscription by Stripe subscription ID
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription as string,
      });

      if (!subscription) {
        logger.warn(`Subscription not found: ${invoice.subscription}`);
        return;
      }

      // Update payment status
      subscription.lastPaymentStatus = 'succeeded';
      subscription.lastPaymentDate = new Date();
      await subscription.save();

      logger.info(`Payment succeeded for subscription ${subscription.stripeSubscriptionId}`);
    } catch (error) {
      logger.error('Error handling invoice payment succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle invoice payment failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    try {
      // Only process subscription invoices
      if (!invoice.subscription) {
        return;
      }

      // Find subscription by Stripe subscription ID
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription as string,
      });

      if (!subscription) {
        logger.warn(`Subscription not found: ${invoice.subscription}`);
        return;
      }

      // Update payment status
      subscription.lastPaymentStatus = 'failed';
      await subscription.save();

      // TODO: Notify user about payment failure

      logger.info(`Payment failed for subscription ${subscription.stripeSubscriptionId}`);
    } catch (error) {
      logger.error('Error handling invoice payment failed:', error);
      throw error;
    }
  }

  /**
   * Get invoice history for user
   */
  async getInvoices(userId: string) {
    try {
      // Get subscription to find Stripe customer ID
      const subscription = await Subscription.findOne({ userId });
      if (!subscription || !subscription.stripeCustomerId) {
        return [];
      }

      // Get invoices from Stripe
      const invoices = await stripe.invoices.list({
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
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      throw new Error('Unable to fetch invoice history');
    }
  }

  /**
   * Get invoice details
   */
  async getInvoiceDetail(userId: string, invoiceId: string) {
    try {
      // Get subscription to verify user has access to this invoice
      const subscription = await Subscription.findOne({ userId });
      if (!subscription || !subscription.stripeCustomerId) {
        throw new Error('No active subscription found');
      }

      // Get invoice from Stripe
      const invoice = await stripe.invoices.retrieve(invoiceId);

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
    } catch (error) {
      logger.error('Error fetching invoice detail:', error);
      throw new Error('Unable to fetch invoice details');
    }
  }

  /**
   * Add payment method for user
   */
  async addPaymentMethod(
    userId: string,
    paymentMethodId: string,
    setAsDefault: boolean = false
  ) {
    try {
      // Get subscription to find Stripe customer ID
      const subscription = await Subscription.findOne({ userId });
      if (!subscription || !subscription.stripeCustomerId) {
        throw new Error('No active subscription found');
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: subscription.stripeCustomerId,
      });

      // Set as default payment method if requested
      if (setAsDefault) {
        await stripe.customers.update(subscription.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });

        // Update subscription
        subscription.defaultPaymentMethodId = paymentMethodId;
        await subscription.save();
      }

      return { success: true };
    } catch (error) {
      logger.error('Error adding payment method:', error);
      throw new Error('Unable to add payment method');
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(userId: string, paymentMethodId: string) {
    try {
      // Get subscription to find Stripe customer ID and verify ownership
      const subscription = await Subscription.findOne({ userId });
      if (!subscription || !subscription.stripeCustomerId) {
        throw new Error('No active subscription found');
      }

      // Get payment methods to verify ownership
      const paymentMethods = await stripe.paymentMethods.list({
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
      await stripe.paymentMethods.detach(paymentMethodId);

      return { success: true };
    } catch (error) {
      logger.error('Error removing payment method:', error);
      throw new Error('Unable to remove payment method');
    }
  }
  
  /**
   * List payment methods for user
   */
  async getPaymentMethods(userId: string) {
    try {
      // Get subscription to find Stripe customer ID
      const subscription = await Subscription.findOne({ userId });
      if (!subscription || !subscription.stripeCustomerId) {
        return [];
      }

      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
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
    } catch (error) {
      logger.error('Error fetching payment methods:', error);
      throw new Error('Unable to fetch payment methods');
    }
  }
  
  /**
   * Get usage statistics for user
   */
  async getUsageStatistics(userId: string) {
    try {
      // Implementation will depend on how you track usage in your application
      // This is a placeholder implementation
      
      // Get current subscription details
      const subscription = await Subscription.findOne({ userId });
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
    } catch (error) {
      logger.error('Error fetching usage statistics:', error);
      throw new Error('Unable to fetch usage statistics');
    }
  }
  
  /**
   * Estimate cost for usage or plan upgrade
   */
  async estimateCost(
    userId: string,
    planId?: string,
    projectedUsage?: any
  ) {
    try {
      // Get current subscription
      const subscription = await Subscription.findOne({ userId });
      if (!subscription && !planId) {
        throw new Error('No subscription found and no plan specified');
      }
      
      // If plan ID is provided, get plan details
      let targetPlan = null;
      if (planId) {
        const product = await stripe.products.retrieve(planId, {
          expand: ['default_price'],
        });
        
        const price = product.default_price as Stripe.Price;
        
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
        await this.getCurrentSubscriptionCost(userId);
      
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
    } catch (error) {
      logger.error('Error estimating cost:', error);
      throw new Error('Unable to estimate cost');
    }
  }
  
  /**
   * Get current subscription cost
   * Helper method for estimateCost
   */
  private async getCurrentSubscriptionCost(userId: string) {
    try {
      const subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        return 0;
      }
      
      const price = await stripe.prices.retrieve(subscription.priceId);
      
      return price.unit_amount ? price.unit_amount / 100 : 0; // Convert from cents
    } catch (error) {
      logger.error('Error getting current subscription cost:', error);
      return 0;
    }
  }
}