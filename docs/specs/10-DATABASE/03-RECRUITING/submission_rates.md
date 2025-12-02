# submission_rates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `submission_rates` |
| Schema | `public` |
| Purpose | Rate negotiations and terms for specific submissions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| submission_id | uuid | NO | - | Foreign key to submission |
| bill_rate | numeric | YES | - | Bill rate |
| pay_rate | numeric | YES | - | Pay rate |
| margin_percent | numeric | YES | - | Margin percent |
| margin_amount | numeric | YES | - | Margin amount |
| currency | text | YES | 'USD'::text | Currency |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| org_id | organizations.id | Organizations |
| submission_id | submissions.id | Submissions |

## Indexes

| Index Name | Definition |
|------------|------------|
| submission_rates_pkey | CREATE UNIQUE INDEX submission_rates_pkey ON public.submission_rates USING btree (id) |
| submission_rates_submission_id_key | CREATE UNIQUE INDEX submission_rates_submission_id_key ON public.submission_rates USING btree (submission_id) |
