/**
 * Stripe Refund Processing
 * Story: ACAD-028
 *
 * Handle payment refunds
 */

import Stripe from 'stripe';
import { stripe } from './client';

export interface CreateRefundParams {
  paymentIntentId: string;
  amount?: number; // Amount in cents (optional for partial refund)
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

/**
 * Create a refund for a payment
 */
export async function createRefund(params: CreateRefundParams): Promise<Stripe.Refund> {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: params.paymentIntentId,
  };

  // Partial refund if amount specified
  if (params.amount) {
    refundParams.amount = params.amount;
  }

  // Add reason
  if (params.reason) {
    refundParams.reason = params.reason;
  }

  // Add metadata
  if (params.metadata) {
    refundParams.metadata = params.metadata;
  }

  const refund = await stripe.refunds.create(refundParams);

  return refund;
}

/**
 * Get refund details
 */
export async function getRefund(refundId: string): Promise<Stripe.Refund> {
  const refund = await stripe.refunds.retrieve(refundId);

  return refund;
}

/**
 * List all refunds for a payment intent
 */
export async function listRefundsForPayment(
  paymentIntentId: string
): Promise<Stripe.Refund[]> {
  const refunds = await stripe.refunds.list({
    payment_intent: paymentIntentId,
  });

  return refunds.data;
}

/**
 * Cancel a refund (only if status is 'pending')
 */
export async function cancelRefund(refundId: string): Promise<Stripe.Refund> {
  const refund = await stripe.refunds.cancel(refundId);

  return refund;
}
