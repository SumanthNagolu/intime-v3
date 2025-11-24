/**
 * Stripe Subscription Management
 * Story: ACAD-028
 *
 * Handle subscription lifecycle (cancel, update, retrieve)
 */

import Stripe from 'stripe';
import { stripe } from './client';
import { createClient } from '@/lib/supabase/server';

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  return subscription;
}

/**
 * Cancel a subscription immediately
 */
export async function cancelSubscriptionImmediately(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);

  return subscription;
}

/**
 * Reactivate a canceled subscription (before period end)
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

/**
 * Update subscription (change plan, quantity, etc.)
 */
export async function updateSubscription(
  subscriptionId: string,
  params: {
    priceId?: string;
    quantity?: number;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
  }
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updateParams: Stripe.SubscriptionUpdateParams = {};

  // Update price (change plan)
  if (params.priceId) {
    updateParams.items = [
      {
        id: subscription.items.data[0].id,
        price: params.priceId,
        quantity: params.quantity || 1,
      },
    ];
  }

  // Set proration behavior
  if (params.prorationBehavior) {
    updateParams.proration_behavior = params.prorationBehavior;
  }

  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, updateParams);

  return updatedSubscription;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer', 'default_payment_method'],
  });

  return subscription;
}

/**
 * Get all subscriptions for a customer
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.latest_invoice', 'data.default_payment_method'],
  });

  return subscriptions.data;
}

/**
 * Get active subscriptions for a user
 */
export async function getUserActiveSubscriptions(userId: string): Promise<Stripe.Subscription[]> {
  const supabase = await createClient();

  // Get user's Stripe customer ID
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!profile?.stripe_customer_id) {
    return [];
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: 'active',
    expand: ['data.latest_invoice', 'data.default_payment_method'],
  });

  return subscriptions.data;
}
