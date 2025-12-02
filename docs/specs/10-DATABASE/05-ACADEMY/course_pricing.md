# course_pricing Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `course_pricing` |
| Schema | `public` |
| Purpose | Pricing tiers and plans for individual courses |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| course_id | uuid | NO | - | Reference to course |
| price_monthly | numeric | YES | - | Price Monthly |
| price_annual | numeric | YES | - | Price Annual |
| price_one_time | numeric | YES | - | Price One Time |
| stripe_price_id_monthly | text | YES | - | Stripe Price Id Monthly |
| stripe_price_id_annual | text | YES | - | Stripe Price Id Annual |
| stripe_price_id_one_time | text | YES | - | Stripe Price Id One Time |
| stripe_product_id | text | YES | - | Foreign key reference to stripe product |
| early_bird_price | numeric | YES | - | Early Bird Price |
| early_bird_valid_until | timestamp with time zone | YES | - | Early Bird Valid Until |
| scholarship_available | boolean | YES | false | Scholarship Available |
| scholarship_criteria | text | YES | - | Scholarship Criteria |
| team_discount_percentage | numeric | YES | - | Team Discount Percentage |
| min_team_size | integer | YES | 5 | Min Team Size |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| course_id | courses.id | course_pricing_course_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| course_pricing_pkey | `CREATE UNIQUE INDEX course_pricing_pkey ON public.course_pricing USING btree (id)` |
| course_pricing_course_id_key | `CREATE UNIQUE INDEX course_pricing_course_id_key ON public.course_pricing USING btree (course_id)` |
| idx_course_pricing_course | `CREATE INDEX idx_course_pricing_course ON public.course_pricing USING btree (course_id)` |
| idx_course_pricing_early_bird | `CREATE INDEX idx_course_pricing_early_bird ON public.course_pricing USING btree (early_bird_valid_until) WHERE (early_bird_price IS NOT NULL)` |
