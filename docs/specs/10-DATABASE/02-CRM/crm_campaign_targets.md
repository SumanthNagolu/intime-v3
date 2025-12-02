# crm_campaign_targets Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `crm_campaign_targets` |
| Schema | `public` |
| Purpose | Target contacts/leads for campaigns with engagement tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| campaign_id | uuid | NO | NULL | Reference to campaign |
| target_type | text | NO | NULL | Target type |
| target_id | uuid | NO | NULL | Reference to target |
| status | text | NO | `'pending'::text` | Current status |
| sent_at | timestamp with time zone | YES | NULL | Sent at |
| opened_at | timestamp with time zone | YES | NULL | Opened at |
| clicked_at | timestamp with time zone | YES | NULL | Clicked at |
| responded_at | timestamp with time zone | YES | NULL | Responded at |
| converted_at | timestamp with time zone | YES | NULL | Converted at |
| result_notes | text | YES | NULL | Result notes |
| converted_to_lead_id | uuid | YES | NULL | Reference to converted to lead |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| campaign_id | crm_campaigns.id | crm_campaign_targets_campaign_id_fkey |
| converted_to_lead_id | leads.id | crm_campaign_targets_converted_to_lead_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| crm_campaign_targets_pkey | `CREATE UNIQUE INDEX crm_campaign_targets_pkey ON public.crm_campaign_targets USING btree (id)` |
| idx_crm_campaign_targets_campaign_id | `CREATE INDEX idx_crm_campaign_targets_campaign_id ON public.crm_campaign_targets USING btree (campaign_id)` |
| idx_crm_campaign_targets_target | `CREATE INDEX idx_crm_campaign_targets_target ON public.crm_campaign_targets USING btree (target_type, target_id)` |
| idx_crm_campaign_targets_status | `CREATE INDEX idx_crm_campaign_targets_status ON public.crm_campaign_targets USING btree (status)` |
