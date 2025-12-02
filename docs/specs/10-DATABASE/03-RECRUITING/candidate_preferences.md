# candidate_preferences Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_preferences` |
| Schema | `public` |
| Purpose | Candidate job preferences (location, rate, work type, etc.) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| preferred_job_types | ARRAY | YES | - | Preferred job types |
| preferred_work_modes | ARRAY | YES | - | Preferred work modes |
| preferred_industries | ARRAY | YES | - | Preferred industries |
| min_rate | numeric | YES | - | Min rate |
| max_commute_miles | integer | YES | - | Max commute miles |
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
| candidate_preferences_pkey | CREATE UNIQUE INDEX candidate_preferences_pkey ON public.candidate_preferences USING btree (id) |
| candidate_preferences_candidate_id_key | CREATE UNIQUE INDEX candidate_preferences_candidate_id_key ON public.candidate_preferences USING btree (candidate_id) |
