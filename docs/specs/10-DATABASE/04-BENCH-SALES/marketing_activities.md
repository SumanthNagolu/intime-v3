# marketing_activities Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `marketing_activities` |
| Schema | `public` |
| Purpose | Tracks all marketing activities for consultants including outreach to vendors, clients, and responses received |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| consultant_id | uuid | NO | - | Reference to bench consultant |
| activity_type | text | NO | - | Type of marketing activity (email, call, etc.) |
| target_type | text | NO | - | Type of target (vendor, client, etc.) |
| target_id | uuid | YES | - | ID of the target entity |
| target_name | text | YES | - | Name of the target |
| sent_at | timestamp with time zone | NO | - | When activity was performed |
| response_type | text | YES | - | Type of response received |
| response_at | timestamp with time zone | YES | - | When response was received |
| notes | text | YES | - | Activity notes |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| created_by | uuid | YES | - | User who logged the activity |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| consultant_id | bench_consultants.id | marketing_activities_consultant_id_fkey |
| created_by | user_profiles.id | marketing_activities_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| marketing_activities_pkey | CREATE UNIQUE INDEX marketing_activities_pkey ON public.marketing_activities USING btree (id) |
| idx_marketing_activities_consultant_id | CREATE INDEX idx_marketing_activities_consultant_id ON public.marketing_activities USING btree (consultant_id) |
