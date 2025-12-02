# deals Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `deals` |
| Schema | `public` |
| Purpose | Sales opportunities and deals in the pipeline |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| lead_id | uuid | YES | NULL | Reference to lead |
| account_id | uuid | YES | NULL | Reference to account |
| title | text | NO | NULL | Title |
| description | text | YES | NULL | Detailed description |
| value | numeric | NO | NULL | Value |
| stage | text | NO | `'discovery'::text` | Stage |
| probability | integer | YES | NULL | Probability |
| expected_close_date | date | YES | NULL | Expected close date |
| actual_close_date | date | YES | NULL | Actual close date |
| owner_id | uuid | NO | NULL | Reference to owner |
| close_reason | text | YES | NULL | Close reason |
| linked_job_ids | ARRAY | YES | NULL | Linked job ids |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |
| deleted_at | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if not deleted) |
| name | text | YES | NULL | Name or title |
| deal_type | text | YES | NULL | Deal type |
| currency | text | YES | `'USD'::text` | Currency |
| loss_reason | text | YES | NULL | Loss reason |
| competitor_won | text | YES | NULL | Competitor won |
| notes | text | YES | NULL | Additional notes |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| account_id | accounts.id | deals_account_id_fkey |
| created_by | user_profiles.id | deals_created_by_fkey |
| lead_id | leads.id | deals_lead_id_fkey |
| org_id | organizations.id | deals_org_id_fkey |
| owner_id | user_profiles.id | deals_owner_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| deals_pkey | `CREATE UNIQUE INDEX deals_pkey ON public.deals USING btree (id)` |
| idx_deals_org | `CREATE INDEX idx_deals_org ON public.deals USING btree (org_id) WHERE (deleted_at IS NULL)` |
| idx_deals_stage | `CREATE INDEX idx_deals_stage ON public.deals USING btree (stage)` |
| idx_deals_owner | `CREATE INDEX idx_deals_owner ON public.deals USING btree (owner_id)` |
| idx_deals_account | `CREATE INDEX idx_deals_account ON public.deals USING btree (account_id)` |
| idx_deals_lead | `CREATE INDEX idx_deals_lead ON public.deals USING btree (lead_id)` |
| idx_deals_expected_close | `CREATE INDEX idx_deals_expected_close ON public.deals USING btree (expected_close_date)` |
| idx_deals_org_id | `CREATE INDEX idx_deals_org_id ON public.deals USING btree (org_id)` |
| idx_deals_owner_id | `CREATE INDEX idx_deals_owner_id ON public.deals USING btree (owner_id)` |
| idx_deals_account_id | `CREATE INDEX idx_deals_account_id ON public.deals USING btree (account_id)` |
| idx_deals_lead_id | `CREATE INDEX idx_deals_lead_id ON public.deals USING btree (lead_id)` |
