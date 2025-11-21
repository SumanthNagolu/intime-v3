# ACAD-028: Stripe Integration

**Status:** ⚪ Not Started

**Story Points:** 8
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** CRITICAL

---

## User Story

As a **Trainer**,
I want **Subscription payments, webhooks, refunds**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [ ] Stripe checkout session creation
- [ ] Subscription management (create, cancel, update)
- [ ] Webhook handler (payment success, subscription canceled)
- [ ] Payment status tracking
- [ ] Refund processing
- [ ] Failed payment retry logic
- [ ] Customer portal (manage billing)
- [ ] Invoice generation
- [ ] Tax calculation (Stripe Tax)

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

**Dependencies:** ACAD-002 (Enrollments)
**Next:** ACAD-029 (Pricing Tiers)
