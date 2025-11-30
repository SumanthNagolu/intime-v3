/**
 * Stripe Webhook Event Handlers
 * Story: ACAD-028
 *
 * Process Stripe webhook events (payment success, subscription events, etc.)
 */

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

/**
 * Handle successful checkout completion
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const supabase = await createClient();

  const { userId, courseId, paymentType, discountCodeId } = session.metadata as {
    userId: string;
    courseId: string;
    paymentType: 'subscription' | 'one_time';
    discountCodeId?: string;
  };

  if (!userId || !courseId) {
    throw new Error('Missing userId or courseId in session metadata');
  }

  // Determine payment ID and expiration
  const paymentId =
    paymentType === 'subscription'
      ? (session.subscription as string)
      : (session.payment_intent as string);

  // For subscriptions, set expiration to null (ongoing)
  // For one-time, set expiration to 1 year from now
  const expiresAt =
    paymentType === 'one_time'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

  // Enroll student
  const { data, error } = await supabase.rpc('enroll_student', {
    p_user_id: userId,
    p_course_id: courseId,
    p_payment_id: paymentId,
    p_payment_amount: (session.amount_total || 0) / 100, // Convert from cents
    p_payment_type: paymentType,
    p_starts_at: new Date().toISOString(),
    p_expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`Failed to enroll student: ${error.message}`);
  }

  const enrollmentId = data;

  // Create payment transaction record
  await (supabase.from as any)('payment_transactions').insert({
    user_id: userId,
    enrollment_id: enrollmentId,
    stripe_payment_id: paymentId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string | null,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || 'usd',
    status: 'succeeded',
    payment_method: session.payment_method_types?.[0] || 'unknown',
    metadata: session.metadata,
  });

  // Record discount code usage if applicable
  if (discountCodeId) {
    // Calculate discount amount from Stripe session
    const totalDiscounts = session.total_details?.amount_discount || 0;
    const finalAmount = (session.amount_total || 0) / 100;
    const originalAmount = finalAmount + totalDiscounts / 100;
    const discountAmount = totalDiscounts / 100;

    // Record discount usage
    await supabase.rpc('record_discount_usage', {
      p_discount_code_id: discountCodeId,
      p_user_id: userId,
      p_enrollment_id: enrollmentId,
      p_original_amount: originalAmount,
      p_discount_amount: discountAmount,
      p_final_amount: finalAmount,
      p_stripe_payment_intent_id: session.payment_intent as string,
    });

    console.log(
      `[Stripe Webhook] Recorded discount usage: ${discountAmount} off (${originalAmount} -> ${finalAmount})`
    );
  }

  console.log(
    `[Stripe Webhook] Student ${userId} enrolled in course ${courseId} via ${paymentType}`
  );
}

/**
 * Handle subscription deletion/cancellation
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = await createClient();

  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('[Stripe Webhook] Missing userId in subscription metadata');
    return;
  }

  // Update enrollment status to expired
  const { error } = await supabase.rpc('update_enrollment_status', {
    p_enrollment_id: subscription.metadata?.enrollmentId || '',
    p_new_status: 'expired',
  });

  if (error) {
    console.error('[Stripe Webhook] Failed to expire enrollment:', error);
  }

  // Update payment transaction status
  await (supabase.from as any)('payment_transactions')
    .update({ status: 'refunded' })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`[Stripe Webhook] Subscription ${subscription.id} canceled for user ${userId}`);
}

/**
 * Handle failed payment
 */
export async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const supabase = await createClient();

  const customerId = invoice.customer as string;
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string' ? invoiceAny.subscription : invoiceAny.subscription?.id;

  // Get user ID from customer
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, email, full_name')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('[Stripe Webhook] User not found for customer:', customerId);
    return;
  }

  // Create payment transaction record for failed payment
  await (supabase.from as any)('payment_transactions').insert({
    user_id: profile.id,
    stripe_payment_id: typeof invoiceAny.payment_intent === 'string' ? invoiceAny.payment_intent : invoiceAny.payment_intent?.id,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    amount: (invoice.amount_due || 0) / 100,
    currency: invoice.currency || 'usd',
    status: 'failed',
    metadata: {
      invoice_id: invoice.id,
      attempt_count: invoice.attempt_count,
    },
  });

  // Queue email notification to student
  await (supabase.from as any)('background_jobs').insert({
    job_type: 'send_email',
    status: 'pending',
    payload: {
      to: profile.email,
      template: 'payment_failed',
      data: {
        student_name: profile.full_name,
        amount: (invoice.amount_due || 0) / 100,
        currency: invoice.currency,
        next_retry_date: invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
          : 'N/A',
        update_payment_url: `${process.env.NEXT_PUBLIC_APP_URL}/students/billing`,
      },
    },
    priority: 'high',
    max_attempts: 3,
  });

  console.log(`[Stripe Webhook] Payment failed for user ${profile.id}, invoice ${invoice.id}`);
}

/**
 * Handle successful invoice payment
 */
export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  const supabase = await createClient();

  const customerId = invoice.customer as string;
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string' ? invoiceAny.subscription : invoiceAny.subscription?.id;

  // Get user ID from customer
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('[Stripe Webhook] User not found for customer:', customerId);
    return;
  }

  // Create payment transaction record
  await (supabase.from as any)('payment_transactions').insert({
    user_id: profile.id,
    stripe_payment_id: typeof invoiceAny.payment_intent === 'string' ? invoiceAny.payment_intent : invoiceAny.payment_intent?.id,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    amount: (invoice.amount_paid || 0) / 100,
    currency: invoice.currency || 'usd',
    status: 'succeeded',
    metadata: {
      invoice_id: invoice.id,
      billing_reason: invoice.billing_reason,
    },
  });

  console.log(
    `[Stripe Webhook] Invoice payment succeeded for user ${profile.id}, invoice ${invoice.id}`
  );
}

/**
 * Handle subscription updated
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = await createClient();

  const userId = subscription.metadata?.userId;
  const enrollmentId = subscription.metadata?.enrollmentId;

  if (!userId || !enrollmentId) {
    console.error('[Stripe Webhook] Missing metadata in subscription');
    return;
  }

  // If subscription is canceled but still active (cancel_at_period_end = true)
  if (subscription.cancel_at_period_end) {
    // Update enrollment with expiration notice
    const subscriptionAny = subscription as any;
    const currentPeriodEnd = subscriptionAny.current_period_end || subscriptionAny.currentPeriodEnd;
    await supabase
      .from('student_enrollments')
      .update({
        expires_at: new Date((currentPeriodEnd || Date.now() / 1000) * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId);

    console.log(
      `[Stripe Webhook] Subscription ${subscription.id} will cancel at period end for user ${userId}`
    );
  }
}
