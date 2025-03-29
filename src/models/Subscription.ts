import mongoose, { Document, Schema } from 'mongoose';

// Subscription status types
type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
type PaymentStatus = 'succeeded' | 'failed' | 'pending' | null;

// Interface for Subscription document
export interface ISubscription extends Document {
  // User and Stripe references
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  
  // Plan information
  planId: string;
  priceId: string;
  status: SubscriptionStatus;
  
  // Billing period
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  
  // Payment information
  defaultPaymentMethodId: string | null;
  lastPaymentStatus: PaymentStatus;
  lastPaymentDate: Date | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const subscriptionSchema = new Schema<ISubscription>(
  {
    // User and Stripe references
    userId: {
      type: String,
      required: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    
    // Plan information
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'],
      required: true,
    },
    planId: {
      type: String,
      required: true,
    },
    priceId: {
      type: String,
      required: true,
    },
    
    // Billing period
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    trialEnd: {
      type: Date,
      default: null,
    },
    
    // Payment information
    defaultPaymentMethodId: {
      type: String,
      default: null,
    },
    lastPaymentStatus: {
      type: String,
      enum: ['succeeded', 'failed', 'pending', null],
      default: null,
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for query optimization
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Create and export model
export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);