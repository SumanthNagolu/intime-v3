# payment_transactions Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `payment_transactions` |
| Schema | `public` |
| Purpose | Tracks payment transactions for course enrollments and subscriptions with Stripe integration, supporting multiple payment methods and currencies. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for transaction |
| user_id | uuid | NO | - | ID of user who made the payment |
| enrollment_id | uuid | YES | - | Reference to course enrollment if applicable |
| stripe_payment_intent_id | text | YES | - | Stripe PaymentIntent ID for tracking |
| stripe_invoice_id | text | YES | - | Stripe Invoice ID for subscription payments |
| stripe_customer_id | text | YES | - | Stripe Customer ID |
| amount | numeric | NO | - | Payment amount in cents (e.g., 9999 = $99.99) |
| currency | text | YES | 'usd' | Currency code (usd, eur, gbp, etc.) |
| status | text | NO | - | Payment status (pending, succeeded, failed, refunded, canceled) |
| payment_method_type | text | YES | - | Payment method type (card, bank_transfer, wallet) |
| metadata | jsonb | YES | '{}' | Additional transaction metadata |
| created_at | timestamp with time zone | YES | now() | Timestamp when transaction was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when transaction was last updated |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | user_profiles.id | CASCADE |
| enrollment_id | enrollments.id | SET NULL |

## Indexes

| Index Name | Definition |
|------------|------------|
| payment_transactions_pkey | CREATE UNIQUE INDEX ON payment_transactions (id) |
| idx_payment_transactions_user | CREATE INDEX ON payment_transactions (user_id) |
| idx_payment_transactions_enrollment | CREATE INDEX ON payment_transactions (enrollment_id) WHERE enrollment_id IS NOT NULL |
| idx_payment_transactions_stripe_intent | CREATE INDEX ON payment_transactions (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL |
| idx_payment_transactions_status | CREATE INDEX ON payment_transactions (status) |
| idx_payment_transactions_created | CREATE INDEX ON payment_transactions (created_at DESC) |

## Use Cases

1. **Course Payments** - Process payments for course enrollments
2. **Subscription Billing** - Track recurring subscription payments
3. **Refunds** - Handle payment refunds and cancellations
4. **Financial Reporting** - Generate revenue reports
5. **Payment Reconciliation** - Match Stripe transactions with internal records
6. **User Payment History** - Show users their payment history
7. **Failed Payment Recovery** - Retry or notify users of failed payments

## Payment Status Flow

```
pending → succeeded → (optionally) refunded
   ↓
failed
   ↓
canceled
```

## Payment Method Types

- **card** - Credit/debit card payments
- **bank_transfer** - ACH, wire transfers
- **wallet** - Apple Pay, Google Pay, PayPal

## Metadata Examples

```json
{
  "course_id": "course-uuid",
  "course_name": "Advanced React Training",
  "discount_code": "EARLYBIRD20",
  "discount_amount": 2000,
  "original_amount": 9999,
  "final_amount": 7999,
  "invoice_url": "https://stripe.com/invoice/...",
  "receipt_url": "https://stripe.com/receipt/..."
}
```

## Example Queries

```sql
-- Get total revenue by month
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as transaction_count,
  SUM(amount) / 100.0 as total_revenue,
  AVG(amount) / 100.0 as avg_transaction_value
FROM payment_transactions
WHERE status = 'succeeded'
GROUP BY month
ORDER BY month DESC;

-- Get user payment history
SELECT
  pt.created_at,
  pt.amount / 100.0 as amount_usd,
  pt.status,
  pt.payment_method_type,
  e.course_id
FROM payment_transactions pt
LEFT JOIN enrollments e ON pt.enrollment_id = e.id
WHERE pt.user_id = 'user-uuid'
ORDER BY pt.created_at DESC;

-- Find failed payments to retry
SELECT * FROM payment_transactions
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Calculate refund rate
SELECT
  COUNT(*) FILTER (WHERE status = 'refunded') * 100.0 /
    COUNT(*) FILTER (WHERE status IN ('succeeded', 'refunded')) as refund_rate
FROM payment_transactions
WHERE created_at > NOW() - INTERVAL '30 days';
```

## Stripe Integration

The table integrates with Stripe for payment processing:

- **stripe_payment_intent_id** - Links to Stripe PaymentIntent for one-time payments
- **stripe_invoice_id** - Links to Stripe Invoice for subscription payments
- **stripe_customer_id** - Links to Stripe Customer for payment methods

Webhook events from Stripe update the `status` field automatically.
