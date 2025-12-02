# crm_activities Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `crm_activities` |
| Schema | `public` |
| Purpose | Unified activity log for CRM entities (calls, emails, meetings, tasks) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| entity_type | text | NO | NULL | Entity type |
| entity_id | uuid | NO | NULL | Reference to entity |
| activity_type | text | NO | NULL | Activity type |
| subject | text | YES | NULL | Subject |
| description | text | YES | NULL | Detailed description |
| outcome | text | YES | NULL | Outcome |
| direction | text | YES | NULL | Direction |
| scheduled_at | timestamp with time zone | YES | NULL | Scheduled at |
| completed_at | timestamp with time zone | YES | NULL | Completed at |
| duration_minutes | integer | YES | NULL | Duration minutes |
| next_steps | text | YES | NULL | Next steps |
| next_follow_up_date | timestamp with time zone | YES | NULL | Next follow up date |
| priority | text | YES | `'normal'::text` | Priority |
| assigned_to | uuid | YES | NULL | Assigned to |
| created_by | uuid | YES | NULL | User who created the record |
| related_contact_id | uuid | YES | NULL | Reference to related contact |
| related_deal_id | uuid | YES | NULL | Reference to related deal |
| related_campaign_id | uuid | YES | NULL | Reference to related campaign |
| status | text | YES | `'completed'::text` | Current status |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| assigned_to | user_profiles.id | crm_activities_assigned_to_fkey |
| created_by | user_profiles.id | crm_activities_created_by_fkey |
| org_id | organizations.id | crm_activities_org_id_fkey |
| related_campaign_id | crm_campaigns.id | crm_activities_related_campaign_id_fkey |
| related_deal_id | deals.id | crm_activities_related_deal_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| crm_activities_pkey | `CREATE UNIQUE INDEX crm_activities_pkey ON public.crm_activities USING btree (id)` |
| idx_crm_activities_org_id | `CREATE INDEX idx_crm_activities_org_id ON public.crm_activities USING btree (org_id)` |
| idx_crm_activities_entity | `CREATE INDEX idx_crm_activities_entity ON public.crm_activities USING btree (entity_type, entity_id)` |
| idx_crm_activities_type | `CREATE INDEX idx_crm_activities_type ON public.crm_activities USING btree (activity_type)` |
| idx_crm_activities_assigned_to | `CREATE INDEX idx_crm_activities_assigned_to ON public.crm_activities USING btree (assigned_to)` |
| idx_crm_activities_created_by | `CREATE INDEX idx_crm_activities_created_by ON public.crm_activities USING btree (created_by)` |
| idx_crm_activities_scheduled_at | `CREATE INDEX idx_crm_activities_scheduled_at ON public.crm_activities USING btree (scheduled_at)` |
| idx_crm_activities_status | `CREATE INDEX idx_crm_activities_status ON public.crm_activities USING btree (status)` |
