# candidate_availability Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_availability` |
| Schema | `public` |
| Purpose | Tracks candidate availability windows and preferences |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| available_from | date | YES | - | Available from |
| notice_period_days | integer | YES | - | Notice period days |
| preferred_rate_min | numeric | YES | - | Preferred rate min |
| preferred_rate_max | numeric | YES | - | Preferred rate max |
| currency | text | YES | 'USD'::text | Currency |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_availability_pkey | CREATE UNIQUE INDEX candidate_availability_pkey ON public.candidate_availability USING btree (id) |
| candidate_availability_candidate_id_key | CREATE UNIQUE INDEX candidate_availability_candidate_id_key ON public.candidate_availability USING btree (candidate_id) |
