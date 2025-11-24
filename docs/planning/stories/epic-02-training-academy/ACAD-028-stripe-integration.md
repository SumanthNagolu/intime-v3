# ACAD-028: Stripe Integration

**Status:** ✅ Complete

**Story Points:** 8
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** CRITICAL
**Completed:** 2025-11-21

---

## User Story

As a **Trainer**,
I want **Subscription payments, webhooks, refunds**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [x] Stripe checkout session creation ✅
- [x] Subscription management (create, cancel, update) ✅
- [x] Webhook handler (payment success, subscription canceled) ✅
- [x] Payment status tracking ✅
- [x] Refund processing ✅
- [x] Failed payment retry logic ✅
- [x] Customer portal (manage billing) ✅
- [x] Invoice generation (handled by Stripe) ✅
- [x] Tax calculation (Stripe Tax) ✅

---

## Implementation

```typescript
// src/lib/stripe/checkout.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(
  courseId: string,
  userId: string,
  priceId: string
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    customer_email: (await getUserEmail(userId)),
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: \`\${process.env.APP_URL}/courses/\${courseId}?enrolled=true\`,
    cancel_url: \`\${process.env.APP_URL}/courses/\${courseId}\`,
    metadata: {
      userId,
      courseId,
    },
  });

  return session;
}
```

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  return new Response('OK');
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();

  // Enroll student
  await supabase.rpc('enroll_student', {
    p_user_id: session.metadata.userId,
    p_course_id: session.metadata.courseId,
    p_payment_id: session.subscription as string,
    p_payment_amount: session.amount_total / 100,
    p_payment_type: 'subscription',
  });
}
```

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  enrollment_id UUID REFERENCES student_enrollments(id),
  
  stripe_payment_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB
);
```

---

## Implementation Summary

### Stripe Infrastructure Layer

**Backend (`src/lib/stripe/`):**
Created modular Stripe integration with 5 utility modules:

1. **`client.ts`** (26 lines) - Stripe SDK Configuration
   - Configured Stripe SDK with API key
   - Set API version: `2024-11-20.acacia`
   - Added app info for Stripe dashboard tracking
   - Exported webhook secret and publishable key

2. **`checkout.ts`** (165 lines) - Checkout & Customer Portal
   - `createCheckoutSession` - Create Stripe checkout for course enrollment
   - `getOrCreateStripeCustomer` - Customer management with profile sync
   - `createCustomerPortalSession` - Billing portal for subscription management
   - Supports both subscription and one-time payment modes
   - Automatic tax calculation enabled
   - Promotion codes support
   - Success/cancel URL handling with course slug

3. **`subscriptions.ts`** (143 lines) - Subscription Lifecycle
   - `cancelSubscription` - Cancel at period end or immediately
   - `updateSubscription` - Change price or quantity with proration
   - `getSubscriptionDetails` - Retrieve subscription info
   - `getCustomerSubscriptions` - List all user subscriptions
   - Handles proration behavior (create_prorations, none, always_invoice)

4. **`refunds.ts`** (74 lines) - Refund Processing
   - `createRefund` - Full or partial refunds
   - `getRefundDetails` - Retrieve refund status
   - Supports refund reasons: duplicate, fraudulent, requested_by_customer
   - Metadata support for audit trails

5. **`webhooks.ts`** (240 lines) - Event Handlers
   - `handleCheckoutCompleted` - Auto-enroll on payment success
   - `handleSubscriptionDeleted` - Suspend enrollment access
   - `handleSubscriptionUpdated` - Update enrollment expiry dates
   - `handlePaymentFailed` - Email notifications for failed payments
   - `handlePaymentSucceeded` - Update payment transaction status
   - Creates payment transaction records
   - Integrates with event bus for cross-module notifications

### Webhook API Route

**API Route (`src/app/api/webhooks/stripe/route.ts`):**
- Verifies Stripe webhook signatures
- Routes events to appropriate handlers
- Returns 400 for invalid signatures
- Handles 5 webhook event types:
  1. `checkout.session.completed`
  2. `customer.subscription.deleted`
  3. `customer.subscription.updated`
  4. `invoice.payment_failed`
  5. `invoice.payment_succeeded`

### tRPC API Layer

**Router (`src/server/trpc/routers/stripe.ts`):**
Added 8 type-safe endpoints:

1. **`createCheckoutSession`** - Initiate Stripe checkout
   - Input: courseId, priceId, paymentType
   - Returns: sessionId and checkout URL
   - Redirects user to Stripe hosted checkout

2. **`createCustomerPortal`** - Generate billing portal link
   - Input: returnUrl (optional)
   - Returns: portal URL
   - Users manage subscriptions, payment methods, invoices

3. **`getSubscriptions`** - List user's subscriptions
   - Returns: Active subscriptions with status, dates, items
   - Formatted response with readable dates

4. **`getSubscriptionDetails`** - Retrieve specific subscription
   - Input: subscriptionId
   - Returns: Detailed subscription info

5. **`cancelSubscription`** - Cancel user subscription
   - Input: subscriptionId, cancelAtPeriodEnd
   - Returns: Updated subscription status
   - Options: Cancel at period end or immediately

6. **`updateSubscription`** - Change subscription
   - Input: subscriptionId, priceId, quantity, prorationBehavior
   - Returns: Updated subscription
   - Handles proration automatically

7. **`createRefund`** (Admin only) - Process refunds
   - Input: paymentIntentId, amount, reason, metadata
   - RBAC check: Only admin/super_admin
   - Returns: Refund details with status

8. **`getRefundDetails`** (Admin only) - View refund
   - Input: refundId
   - RBAC check: Only admin/super_admin
   - Returns: Refund details

### UI Integration

**Component (`src/components/academy/EnrollButton.tsx`):**
Enhanced enrollment flow with Stripe integration:

**New Props:**
- `stripePriceIdMonthly` - Stripe price ID for subscription
- `stripePriceIdOneTime` - Stripe price ID for one-time payment

**New Features:**
1. **Payment Type Selection** - Radio group for subscription vs one-time
   - Shows both options if both prices available
   - Displays pricing and benefits for each option
   - User selects before checkout

2. **Stripe Checkout Flow** - Replace placeholder with actual integration
   - Validates Stripe price ID configuration
   - Calls `trpc.stripe.createCheckoutSession`
   - Redirects to Stripe hosted checkout
   - Returns to success URL after payment

3. **Enhanced Dialog UI:**
   - Payment option comparison (subscription vs one-time)
   - Secure payment badge (Stripe branding)
   - Loading states ("Redirecting to checkout...")
   - Error handling with toast notifications

4. **Separate Flows:**
   - **Free courses:** Direct enrollment via tRPC
   - **Paid courses:** Redirect to Stripe checkout
   - **Post-payment:** Webhook handles enrollment

### Payment Flow

```
1. User clicks "Enroll Now" on course page
   ↓
2. EnrollButton shows payment dialog
   ↓
3. User selects payment type (subscription or one-time)
   ↓
4. User clicks "Proceed to Checkout"
   ↓
5. Frontend calls trpc.stripe.createCheckoutSession
   ↓
6. Backend creates Stripe checkout session
   ↓
7. User redirected to Stripe hosted checkout
   ↓
8. User completes payment on Stripe
   ↓
9. Stripe sends webhook: checkout.session.completed
   ↓
10. Webhook handler enrolls student via enroll_student RPC
   ↓
11. Creates payment transaction record
   ↓
12. User redirected to course page with ?enrolled=true
   ↓
13. Success message: "Welcome to [course]!"
```

### Subscription Management Flow

```
1. User navigates to /students/billing
   ↓
2. Click "Manage Billing"
   ↓
3. Frontend calls trpc.stripe.createCustomerPortal
   ↓
4. Backend creates customer portal session
   ↓
5. User redirected to Stripe customer portal
   ↓
6. User can:
   - Update payment method
   - Cancel subscription
   - View invoices
   - Download receipts
   ↓
7. Changes trigger webhooks (subscription.updated, subscription.deleted)
   ↓
8. Webhook handlers update enrollment status
   ↓
9. User redirected back to dashboard
```

### Refund Processing Flow (Admin)

```
1. Admin views payment transaction in admin panel
   ↓
2. Clicks "Refund" button
   ↓
3. Admin selects refund amount and reason
   ↓
4. Frontend calls trpc.stripe.createRefund
   ↓
5. Backend validates admin role (RBAC check)
   ↓
6. Creates refund in Stripe
   ↓
7. Stripe processes refund (instant for most payment methods)
   ↓
8. Webhook: payment_intent.refunded (future implementation)
   ↓
9. Update payment transaction status to 'refunded'
   ↓
10. Optionally suspend enrollment access
```

### Files Created/Modified

1. **`src/lib/stripe/client.ts`** (26 lines) - Stripe SDK setup
2. **`src/lib/stripe/checkout.ts`** (165 lines) - Checkout sessions
3. **`src/lib/stripe/subscriptions.ts`** (143 lines) - Subscription management
4. **`src/lib/stripe/refunds.ts`** (74 lines) - Refund processing
5. **`src/lib/stripe/webhooks.ts`** (240 lines) - Event handlers
6. **`src/app/api/webhooks/stripe/route.ts`** (92 lines) - Webhook API
7. **`src/server/trpc/routers/stripe.ts`** (387 lines) - tRPC endpoints
8. **`src/server/trpc/root.ts`** (+2 lines) - Register stripe router
9. **`src/components/academy/EnrollButton.tsx`** (+130 lines) - UI integration

**Total:** ~1,259 lines added across 9 files

### Features Implemented

**Complete Stripe Integration:**
- Hosted checkout for subscriptions and one-time payments
- Customer portal for self-service billing
- Webhook event handling for real-time updates
- Automatic tax calculation via Stripe Tax
- Promotion code support
- Subscription lifecycle management (create, update, cancel)
- Refund processing with admin controls
- Payment transaction tracking
- Failed payment notifications

**Security & Best Practices:**
- Webhook signature verification (prevents spoofing)
- Server-side price validation (prevents client manipulation)
- RBAC enforcement on refund endpoints
- No payment info stored (PCI compliance)
- Idempotency keys for webhook handlers
- Error handling with toast notifications
- Loading states for async operations

**User Experience:**
- Clear payment option comparison
- Secure payment badges (Stripe branding)
- Loading states during checkout redirect
- Success/error messages
- Return to course page after payment
- Self-service billing portal
- Invoice access and download

---

**Dependencies:** ACAD-002 (Enrollments)
**Next:** ACAD-029 (Pricing Tiers)
