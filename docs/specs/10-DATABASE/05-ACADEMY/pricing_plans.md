# pricing_plans Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `pricing_plans` |
| Schema | `public` |
| Purpose | Subscription and payment plan definitions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| name | text | NO | - | Display name |
| description | text | YES | - | Detailed description |
| slug | text | NO | - | URL-friendly unique identifier |
| plan_type | text | NO | - | Plan Type |
| price_monthly | numeric | YES | - | Price Monthly |
| price_annual | numeric | YES | - | Price Annual |
| price_one_time | numeric | YES | - | Price One Time |
| stripe_price_id_monthly | text | YES | - | Stripe Price Id Monthly |
| stripe_price_id_annual | text | YES | - | Stripe Price Id Annual |
| stripe_price_id_one_time | text | YES | - | Stripe Price Id One Time |
| stripe_product_id | text | YES | - | Foreign key reference to stripe product |
| features | jsonb | YES | '[]'::jsonb | Features |
| max_courses | integer | YES | - | Max Courses |
| max_users | integer | YES | - | Max Users |
| display_order | integer | YES | 0 | Display Order |
| is_featured | boolean | YES | false | Whether item is featured/highlighted |
| badge_text | text | YES | - | Badge Text |
| is_active | boolean | YES | true | Whether record is active |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp (null if active) |

## Foreign Keys

No foreign key constraints defined.

## Indexes

| Index Name | Definition |
|------------|------------|
| pricing_plans_pkey | `CREATE UNIQUE INDEX pricing_plans_pkey ON public.pricing_plans USING btree (id)` |
| pricing_plans_name_key | `CREATE UNIQUE INDEX pricing_plans_name_key ON public.pricing_plans USING btree (name)` |
| pricing_plans_slug_key | `CREATE UNIQUE INDEX pricing_plans_slug_key ON public.pricing_plans USING btree (slug)` |
| idx_pricing_plans_plan_type | `CREATE INDEX idx_pricing_plans_plan_type ON public.pricing_plans USING btree (plan_type) WHERE (deleted_at IS NULL)` |
| idx_pricing_plans_active | `CREATE INDEX idx_pricing_plans_active ON public.pricing_plans USING btree (is_active) WHERE (deleted_at IS NULL)` |
| idx_pricing_plans_slug | `CREATE INDEX idx_pricing_plans_slug ON public.pricing_plans USING btree (slug) WHERE (deleted_at IS NULL)` |
