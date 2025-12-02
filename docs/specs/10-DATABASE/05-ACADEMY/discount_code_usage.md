# discount_code_usage Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `discount_code_usage` |
| Schema | `public` |
| Purpose | Tracking of discount code redemptions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| discount_code_id | uuid | NO | - | Foreign key reference to discount code |
| user_id | uuid | NO | - | Reference to user |
| enrollment_id | uuid | YES | - | Foreign key reference to enrollment |
| original_amount | numeric | NO | - | Original Amount |
| discount_amount | numeric | NO | - | Discount Amount |
| final_amount | numeric | NO | - | Final Amount |
| stripe_payment_intent_id | text | YES | - | Foreign key reference to stripe payment intent |
| used_at | timestamp with time zone | YES | now() | Timestamp for used |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| discount_code_id | discount_codes.id | discount_code_usage_discount_code_id_fkey |
| enrollment_id | student_enrollments.id | discount_code_usage_enrollment_id_fkey |
| user_id | user_profiles.id | discount_code_usage_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| discount_code_usage_pkey | `CREATE UNIQUE INDEX discount_code_usage_pkey ON public.discount_code_usage USING btree (id)` |
| idx_discount_usage_code | `CREATE INDEX idx_discount_usage_code ON public.discount_code_usage USING btree (discount_code_id)` |
| idx_discount_usage_user | `CREATE INDEX idx_discount_usage_user ON public.discount_code_usage USING btree (user_id)` |
| idx_discount_usage_enrollment | `CREATE INDEX idx_discount_usage_enrollment ON public.discount_code_usage USING btree (enrollment_id)` |
| idx_discount_usage_user_code | `CREATE UNIQUE INDEX idx_discount_usage_user_code ON public.discount_code_usage USING btree (user_id, discount_code_id)` |
