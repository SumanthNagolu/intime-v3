/**
 * Stripe Checkout Functions
 * Story: ACAD-028
 *
 * Handle Stripe checkout session creation for course enrollments
 */

import Stripe from 'stripe';
import { stripe } from './client';
import { createClient } from '@/lib/supabase/server';

export interface CreateCheckoutSessionParams {
  courseId: string;
  userId: string;
  priceId: string;
  paymentType: 'subscription' | 'one_time';
  discountCode?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create a Stripe checkout session for course enrollment
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const supabase = await createClient();

  // Get user details
  const { data: user } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', params.userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  // Get course details
  const { data: course } = await supabase
    .from('courses')
    .select('title, slug')
    .eq('id', params.courseId)
    .single();

  if (!course) {
    throw new Error('Course not found');
  }

  // Create or retrieve Stripe customer
  const customer = await getOrCreateStripeCustomer(params.userId, user.email, user.full_name);

  // Validate and apply discount code if provided
  let discountCodeId: string | null = null;
  let stripeDiscountIds: string[] | undefined = undefined;

  if (params.discountCode) {
    const { data: validationResult } = await supabase.rpc('validate_discount_code', {
      p_code: params.discountCode,
      p_user_id: params.userId,
      p_course_id: params.courseId,
      p_plan_type: null,
      p_amount: null,
    });

    const validation = validationResult?.[0];

    if (validation?.is_valid) {
      discountCodeId = validation.discount_id;

      // Get Stripe coupon/promotion code IDs
      const { data: discountCode } = await supabase
        .from('discount_codes')
        .select('stripe_coupon_id, stripe_promotion_code_id')
        .eq('id', discountCodeId)
        .single();

      if (discountCode) {
        if (discountCode.stripe_promotion_code_id) {
          // Use promotion code (recommended for Stripe checkout)
          stripeDiscountIds = [discountCode.stripe_promotion_code_id];
        } else if (discountCode.stripe_coupon_id) {
          // Use coupon ID as fallback
          stripeDiscountIds = [discountCode.stripe_coupon_id];
        }
      }
    } else {
      throw new Error(validation?.error_message || 'Invalid discount code');
    }
  }

  // Determine mode based on payment type
  const mode: Stripe.Checkout.SessionCreateParams.Mode =
    params.paymentType === 'subscription' ? 'subscription' : 'payment';

  // Create checkout session
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customer.id,
    mode,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url:
      params.successUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/students/courses/${course.slug}?enrolled=true`,
    cancel_url:
      params.cancelUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/students/courses/${course.slug}`,
    metadata: {
      userId: params.userId,
      courseId: params.courseId,
      paymentType: params.paymentType,
      ...(discountCodeId && { discountCodeId }),
      ...(params.discountCode && { discountCode: params.discountCode }),
    },
    allow_promotion_codes: !stripeDiscountIds, // Disable manual codes if we're applying one
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
    // Enable automatic tax calculation
    automatic_tax: {
      enabled: true,
    },
  };

  // Apply discount if we have Stripe IDs
  if (stripeDiscountIds && stripeDiscountIds.length > 0) {
    sessionParams.discounts = stripeDiscountIds.map((id) => ({
      promotion_code: id,
    }));
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session;
}

/**
 * Get or create a Stripe customer for a user
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string
): Promise<Stripe.Customer> {
  const supabase = await createClient();

  // Check if user already has a Stripe customer ID
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  // If customer exists, retrieve it
  if (profile?.stripe_customer_id) {
    try {
      const customer = await stripe.customers.retrieve(profile.stripe_customer_id);
      if (!customer.deleted) {
        return customer as Stripe.Customer;
      }
    } catch (error) {
      console.error('Failed to retrieve existing customer:', error);
      // Continue to create new customer
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  // Save customer ID to user profile
  await supabase
    .from('user_profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer;
}

/**
 * Create a customer portal session for managing billing
 */
export async function createCustomerPortalSession(
  userId: string,
  returnUrl?: string
): Promise<Stripe.BillingPortal.Session> {
  const supabase = await createClient();

  // Get user's Stripe customer ID
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!profile?.stripe_customer_id) {
    throw new Error('User does not have a Stripe customer ID');
  }

  // Create portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/students/dashboard`,
  });

  return session;
}
