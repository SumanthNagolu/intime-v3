# placement_credits Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `placement_credits` |
| Schema | `public` |
| Purpose | Commission and credit allocation for placements |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| pod_id | uuid | NO | - | Foreign key to pod |
| sprint_number | integer | NO | - | Sprint number |
| sprint_start_date | date | NO | - | Sprint start date |
| sprint_end_date | date | NO | - | Sprint end date |
| placement_id | uuid | NO | - | Foreign key to placement |
| placement_date | date | NO | - | Placement date |
| credit_amount | numeric | NO | 1.0 | Credit amount |
| senior_rec_id | uuid | YES | - | Foreign key to senior_rec |
| junior_rec_id | uuid | YES | - | Foreign key to junior_rec |
| bill_rate | numeric | YES | - | Bill rate |
| pay_rate | numeric | YES | - | Pay rate |
| margin_percentage | numeric | YES | - | Margin percentage |
| estimated_revenue | numeric | YES | - | Estimated revenue |
| source_pillar | text | NO | 'recruiting'::text | Source pillar |
| original_lead_id | uuid | YES | - | Foreign key to original_lead |
| original_campaign_id | uuid | YES | - | Foreign key to original_campaign |
| original_graduate_id | uuid | YES | - | Foreign key to original_graduate |
| is_verified | boolean | YES | false | Is verified |
| verified_at | timestamp with time zone | YES | - | Verified at |
| verified_by | uuid | YES | - | Verified by |
| notes | text | YES | - | Notes |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| created_by | user_profiles.id | User profiles |
| junior_rec_id | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |
| original_graduate_id | graduate_candidates.id | Graduate candidates |
| pod_id | pods.id | Pods |
| senior_rec_id | user_profiles.id | User profiles |
| verified_by | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| placement_credits_pkey | CREATE UNIQUE INDEX placement_credits_pkey ON public.placement_credits USING btree (id) |
| idx_placement_credits_org | CREATE INDEX idx_placement_credits_org ON public.placement_credits USING btree (org_id) |
| idx_placement_credits_pod | CREATE INDEX idx_placement_credits_pod ON public.placement_credits USING btree (pod_id) |
| idx_placement_credits_sprint | CREATE INDEX idx_placement_credits_sprint ON public.placement_credits USING btree (pod_id, sprint_number) |
| idx_placement_credits_source | CREATE INDEX idx_placement_credits_source ON public.placement_credits USING btree (source_pillar) |
| idx_placement_credits_date | CREATE INDEX idx_placement_credits_date ON public.placement_credits USING btree (placement_date) |
