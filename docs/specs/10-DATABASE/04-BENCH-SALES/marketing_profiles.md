# marketing_profiles Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `marketing_profiles` |
| Schema | `public` |
| Purpose | Core marketing profile for consultants including headline, summary, highlights, and target roles/industries with version control |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| consultant_id | uuid | NO | - | Reference to bench consultant |
| headline | text | NO | - | Marketing headline/title |
| summary | text | YES | - | Profile summary |
| highlights | text[] | YES | - | Array of key highlights |
| target_roles | text[] | YES | - | Array of target role titles |
| target_industries | text[] | YES | - | Array of target industries |
| version | integer | NO | 1 | Version number of profile |
| status | marketing_status | NO | 'draft' | Profile status (draft/active/archived) |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | User who created the profile |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| consultant_id | bench_consultants.id | marketing_profiles_consultant_id_fkey |
| created_by | user_profiles.id | marketing_profiles_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| marketing_profiles_pkey | CREATE UNIQUE INDEX marketing_profiles_pkey ON public.marketing_profiles USING btree (id) |
| idx_marketing_profiles_consultant_id | CREATE INDEX idx_marketing_profiles_consultant_id ON public.marketing_profiles USING btree (consultant_id) |
