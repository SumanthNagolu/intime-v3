# candidate_profiles Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_profiles` |
| Schema | `public` |
| Purpose | Core candidate profile information and contact details |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| summary | text | YES | - | Summary |
| total_experience_years | numeric | YES | - | Total experience years |
| highest_education | text | YES | - | Highest education |
| linkedin_url | text | YES | - | Linkedin url |
| github_url | text | YES | - | Github url |
| portfolio_url | text | YES | - | Portfolio url |
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
| candidate_profiles_pkey | CREATE UNIQUE INDEX candidate_profiles_pkey ON public.candidate_profiles USING btree (id) |
| candidate_profiles_candidate_id_key | CREATE UNIQUE INDEX candidate_profiles_candidate_id_key ON public.candidate_profiles USING btree (candidate_id) |
