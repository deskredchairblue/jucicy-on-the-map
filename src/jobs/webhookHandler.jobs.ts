import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';

/**
 * Processes incoming webhook events.
 * For a production system, consider validating the webhook signature.
 */
export const webhookHandlerJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;

    // Optionally, validate the webhook signature here.
    // Example: const isValid = paymentService.validateWebhook(req);
    // if (!isValid) { throw new Error('Invalid webhook signature'); }

    // Process the event using your payment service
    await paymentService.handleWebhook(event);

    // Respond to the webhook sender indicating success.
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};
