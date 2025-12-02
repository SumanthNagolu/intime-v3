# placements Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `placements` |
| Schema | `public` |
| Purpose | Successfully placed candidates (accepted offers, active employment) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| submission_id | uuid | NO | - | Foreign key to submission |
| offer_id | uuid | YES | - | Foreign key to offer |
| job_id | uuid | NO | - | Foreign key to job |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| account_id | uuid | NO | - | Foreign key to account |
| placement_type | text | YES | 'contract'::text | Placement type |
| start_date | date | NO | - | Start date |
| end_date | date | YES | - | End date |
| bill_rate | numeric | NO | - | Bill rate |
| pay_rate | numeric | NO | - | Pay rate |
| markup_percentage | numeric | YES | - | Markup percentage |
| status | text | NO | 'active'::text | Status |
| end_reason | text | YES | - | End reason |
| actual_end_date | date | YES | - | Actual end date |
| total_revenue | numeric | YES | - | Total revenue |
| total_paid | numeric | YES | - | Total paid |
| onboarding_status | text | YES | 'pending'::text | Onboarding status |
| onboarding_completed_at | timestamp with time zone | YES | - | Onboarding completed at |
| performance_rating | integer | YES | - | Performance rating |
| extension_count | integer | YES | 0 | Extension count |
| recruiter_id | uuid | NO | - | Foreign key to recruiter |
| account_manager_id | uuid | YES | - | Foreign key to account_manager |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| account_id | accounts.id | Accounts |
| account_manager_id | user_profiles.id | User profiles |
| candidate_id | user_profiles.id | User profiles |
| created_by | user_profiles.id | User profiles |
| job_id | jobs.id | Jobs |
| offer_id | offers.id | Offers |
| org_id | organizations.id | Organizations |
| recruiter_id | user_profiles.id | User profiles |
| submission_id | submissions.id | Submissions |

## Indexes

| Index Name | Definition |
|------------|------------|
| placements_pkey | CREATE UNIQUE INDEX placements_pkey ON public.placements USING btree (id) |
| idx_placements_candidate | CREATE INDEX idx_placements_candidate ON public.placements USING btree (candidate_id) |
| idx_placements_job | CREATE INDEX idx_placements_job ON public.placements USING btree (job_id) |
| idx_placements_account | CREATE INDEX idx_placements_account ON public.placements USING btree (account_id) |
| idx_placements_status | CREATE INDEX idx_placements_status ON public.placements USING btree (status) |
| idx_placements_start_date | CREATE INDEX idx_placements_start_date ON public.placements USING btree (start_date DESC) |
| idx_placements_recruiter | CREATE INDEX idx_placements_recruiter ON public.placements USING btree (recruiter_id) |
| idx_placements_org | CREATE INDEX idx_placements_org ON public.placements USING btree (org_id) |
