# crm_campaigns Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `crm_campaigns` |
| Schema | `public` |
| Purpose | Marketing/outreach campaigns for sales |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| name | text | NO | NULL | Name or title |
| description | text | YES | NULL | Detailed description |
| campaign_type | text | NO | NULL | Campaign type |
| status | text | NO | `'draft'::text` | Current status |
| target_audience | text | YES | NULL | Target audience |
| target_industries | ARRAY | YES | NULL | Target industries |
| target_titles | ARRAY | YES | NULL | Target titles |
| target_company_sizes | ARRAY | YES | NULL | Target company sizes |
| start_date | timestamp with time zone | YES | NULL | Start date |
| end_date | timestamp with time zone | YES | NULL | End date |
| scheduled_at | timestamp with time zone | YES | NULL | Scheduled at |
| budget | numeric | YES | NULL | Budget |
| currency | text | YES | `'USD'::text` | Currency |
| goal_leads | integer | YES | NULL | Goal leads |
| goal_responses | integer | YES | NULL | Goal responses |
| goal_meetings | integer | YES | NULL | Goal meetings |
| owner_id | uuid | YES | NULL | Reference to owner |
| notes | text | YES | NULL | Additional notes |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |
| deleted_at | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if not deleted) |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| created_by | user_profiles.id | crm_campaigns_created_by_fkey |
| org_id | organizations.id | crm_campaigns_org_id_fkey |
| owner_id | user_profiles.id | crm_campaigns_owner_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| crm_campaigns_pkey | `CREATE UNIQUE INDEX crm_campaigns_pkey ON public.crm_campaigns USING btree (id)` |
| idx_crm_campaigns_org_id | `CREATE INDEX idx_crm_campaigns_org_id ON public.crm_campaigns USING btree (org_id)` |
| idx_crm_campaigns_type | `CREATE INDEX idx_crm_campaigns_type ON public.crm_campaigns USING btree (campaign_type)` |
| idx_crm_campaigns_status | `CREATE INDEX idx_crm_campaigns_status ON public.crm_campaigns USING btree (status)` |
| idx_crm_campaigns_owner_id | `CREATE INDEX idx_crm_campaigns_owner_id ON public.crm_campaigns USING btree (owner_id)` |
| idx_crm_campaigns_start_date | `CREATE INDEX idx_crm_campaigns_start_date ON public.crm_campaigns USING btree (start_date)` |
