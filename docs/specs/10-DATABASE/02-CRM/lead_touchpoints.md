# lead_touchpoints Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lead_touchpoints` |
| Schema | `public` |
| Purpose | Outreach tracking and communication history for leads |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| lead_id | uuid | NO | NULL | Reference to lead |
| touchpoint_type | text | NO | NULL | Touchpoint type |
| direction | text | NO | `'outbound'::text` | Direction |
| subject | text | YES | NULL | Subject |
| notes | text | YES | NULL | Additional notes |
| outcome | text | YES | NULL | Outcome |
| next_steps | text | YES | NULL | Next steps |
| next_follow_up_date | timestamp with time zone | YES | NULL | Next follow up date |
| duration_minutes | integer | YES | NULL | Duration minutes |
| campaign_id | uuid | YES | NULL | Reference to campaign |
| template_used | text | YES | NULL | Template used |
| created_by | uuid | YES | NULL | User who created the record |
| touchpoint_date | timestamp with time zone | NO | CURRENT_TIMESTAMP | Touchpoint date |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| created_by | user_profiles.id | lead_touchpoints_created_by_fkey |
| lead_id | leads.id | lead_touchpoints_lead_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| lead_touchpoints_pkey | `CREATE UNIQUE INDEX lead_touchpoints_pkey ON public.lead_touchpoints USING btree (id)` |
| idx_lead_touchpoints_lead_id | `CREATE INDEX idx_lead_touchpoints_lead_id ON public.lead_touchpoints USING btree (lead_id)` |
| idx_lead_touchpoints_type | `CREATE INDEX idx_lead_touchpoints_type ON public.lead_touchpoints USING btree (touchpoint_type)` |
| idx_lead_touchpoints_date | `CREATE INDEX idx_lead_touchpoints_date ON public.lead_touchpoints USING btree (touchpoint_date)` |
