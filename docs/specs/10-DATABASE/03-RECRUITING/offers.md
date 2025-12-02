# offers Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `offers` |
| Schema | `public` |
| Purpose | Job offers extended to candidates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| submission_id | uuid | NO | - | Foreign key to submission |
| job_id | uuid | NO | - | Foreign key to job |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| offer_type | text | YES | 'contract'::text | Offer type |
| rate | numeric | NO | - | Rate |
| rate_type | text | YES | 'hourly'::text | Rate type |
| start_date | date | YES | - | Start date |
| end_date | date | YES | - | End date |
| bonus | numeric | YES | - | Bonus |
| benefits | text | YES | - | Benefits |
| relocation_assistance | boolean | YES | false | Relocation assistance |
| sign_on_bonus | numeric | YES | - | Sign on bonus |
| status | text | NO | 'draft'::text | Status |
| sent_at | timestamp with time zone | YES | - | Sent at |
| expires_at | timestamp with time zone | YES | - | Expires at |
| candidate_counter_offer | numeric | YES | - | Candidate counter offer |
| negotiation_notes | text | YES | - | Negotiation notes |
| accepted_at | timestamp with time zone | YES | - | Accepted at |
| declined_at | timestamp with time zone | YES | - | Declined at |
| decline_reason | text | YES | - | Decline reason |
| offer_letter_file_id | uuid | YES | - | Foreign key to offer_letter_file |
| signed_offer_file_id | uuid | YES | - | Foreign key to signed_offer_file |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record |
| org_id | uuid | NO | - | Organization ID |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| created_by | user_profiles.id | User profiles |
| job_id | jobs.id | Jobs |
| org_id | organizations.id | Organizations |
| submission_id | submissions.id | Submissions |

## Indexes

| Index Name | Definition |
|------------|------------|
| offers_pkey | CREATE UNIQUE INDEX offers_pkey ON public.offers USING btree (id) |
| idx_offers_submission | CREATE INDEX idx_offers_submission ON public.offers USING btree (submission_id) |
| idx_offers_candidate | CREATE INDEX idx_offers_candidate ON public.offers USING btree (candidate_id) |
| idx_offers_job | CREATE INDEX idx_offers_job ON public.offers USING btree (job_id) |
| idx_offers_status | CREATE INDEX idx_offers_status ON public.offers USING btree (status) |
| idx_offers_expires | CREATE INDEX idx_offers_expires ON public.offers USING btree (expires_at) |
| idx_offers_org_id | CREATE INDEX idx_offers_org_id ON public.offers USING btree (org_id) |
