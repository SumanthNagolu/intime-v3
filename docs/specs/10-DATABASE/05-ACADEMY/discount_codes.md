# discount_codes Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `discount_codes` |
| Schema | `public` |
| Purpose | Promotional discount codes with rules and limits |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| code | text | NO | - | Code |
| name | text | NO | - | Display name |
| description | text | YES | - | Detailed description |
| discount_type | text | NO | - | Discount Type |
| discount_value | numeric | NO | - | Discount Value |
| max_uses | integer | YES | - | Max Uses |
| uses_count | integer | YES | 0 | Count of uses |
| max_uses_per_user | integer | YES | 1 | Max Uses Per User |
| valid_from | timestamp with time zone | YES | now() | Valid From |
| valid_until | timestamp with time zone | YES | - | Valid Until |
| applicable_plan_types | ARRAY | YES | - | Applicable Plan Types |
| applicable_course_ids | ARRAY | YES | - | Applicable Course Ids |
| minimum_purchase_amount | numeric | YES | - | Minimum Purchase Amount |
| stripe_coupon_id | text | YES | - | Foreign key reference to stripe coupon |
| stripe_promotion_code_id | text | YES | - | Foreign key reference to stripe promotion code |
| is_active | boolean | YES | true | Whether record is active |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created this record |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp (null if active) |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| created_by | user_profiles.id | discount_codes_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| discount_codes_pkey | `CREATE UNIQUE INDEX discount_codes_pkey ON public.discount_codes USING btree (id)` |
| discount_codes_code_key | `CREATE UNIQUE INDEX discount_codes_code_key ON public.discount_codes USING btree (code)` |
| idx_discount_codes_code | `CREATE INDEX idx_discount_codes_code ON public.discount_codes USING btree (code) WHERE ((deleted_at IS NULL) AND (is_active = true))` |
| idx_discount_codes_active | `CREATE INDEX idx_discount_codes_active ON public.discount_codes USING btree (is_active, valid_from, valid_until) WHERE (deleted_at IS NULL)` |
| idx_discount_codes_validity | `CREATE INDEX idx_discount_codes_validity ON public.discount_codes USING btree (valid_from, valid_until) WHERE ((deleted_at IS NULL) AND (is_active = true))` |
