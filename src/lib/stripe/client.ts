/**
 * Stripe Client Configuration
 * Story: ACAD-028
 *
 * Configures Stripe SDK for server-side operations
 */

import Stripe from 'stripe';

// TEMPORARY: Allow build without Stripe for deployment
// TODO: Remove this fallback when Stripe is configured (ACAD-028, 029, 030)
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_build';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set - Stripe features will not work');
}

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
  appInfo: {
    name: 'InTime Training Academy',
    version: '3.0.0',
  },
});

// Webhook secret for verifying Stripe signatures
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Public key for client-side (if needed)
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
