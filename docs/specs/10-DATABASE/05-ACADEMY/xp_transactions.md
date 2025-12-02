# xp_transactions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `xp_transactions` |
| Schema | `public` |
| Purpose | Log of all XP (experience points) earned by users |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| amount | integer | NO | - | Amount |
| transaction_type | text | NO | - | Transaction Type |
| reference_type | text | YES | - | Reference Type |
| reference_id | uuid | YES | - | Foreign key reference to reference |
| description | text | YES | - | Detailed description |
| awarded_at | timestamp with time zone | NO | now() | Timestamp for awarded |
| awarded_by | uuid | YES | - | Awarded By |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| awarded_by | user_profiles.id | xp_transactions_awarded_by_fkey |
| user_id | user_profiles.id | xp_transactions_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| xp_transactions_pkey | `CREATE UNIQUE INDEX xp_transactions_pkey ON public.xp_transactions USING btree (id)` |
| idx_xp_transactions_user | `CREATE INDEX idx_xp_transactions_user ON public.xp_transactions USING btree (user_id)` |
| idx_xp_transactions_awarded_at | `CREATE INDEX idx_xp_transactions_awarded_at ON public.xp_transactions USING btree (awarded_at DESC)` |
| idx_xp_transactions_type | `CREATE INDEX idx_xp_transactions_type ON public.xp_transactions USING btree (transaction_type)` |
| idx_xp_transactions_reference | `CREATE INDEX idx_xp_transactions_reference ON public.xp_transactions USING btree (reference_type, reference_id)` |
| idx_xp_transactions_created_week | `CREATE INDEX idx_xp_transactions_created_week ON public.xp_transactions USING btree (user_id, created_at)` |
