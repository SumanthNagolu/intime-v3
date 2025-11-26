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

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2025-11-17.clover',
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
