# lead_tasks Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lead_tasks` |
| Schema | `public` |
| Purpose | Tasks and action items related to leads |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| lead_id | uuid | NO | NULL | Reference to lead |
| title | text | NO | NULL | Title |
| description | text | YES | NULL | Detailed description |
| due_date | date | NO | NULL | Due date |
| priority | text | NO | `'medium'::text` | Priority |
| completed | boolean | NO | `false` | Completed |
| completed_at | timestamp with time zone | YES | NULL | Completed at |
| completed_by | uuid | YES | NULL | Completed by |
| assigned_to | uuid | YES | NULL | Assigned to |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |
| deleted_at | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if not deleted) |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| assigned_to | user_profiles.id | lead_tasks_assigned_to_fkey |
| completed_by | user_profiles.id | lead_tasks_completed_by_fkey |
| created_by | user_profiles.id | lead_tasks_created_by_fkey |
| lead_id | leads.id | lead_tasks_lead_id_fkey |
| org_id | organizations.id | lead_tasks_org_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| lead_tasks_pkey | `CREATE UNIQUE INDEX lead_tasks_pkey ON public.lead_tasks USING btree (id)` |
| idx_lead_tasks_lead_id | `CREATE INDEX idx_lead_tasks_lead_id ON public.lead_tasks USING btree (lead_id)` |
| idx_lead_tasks_org_id | `CREATE INDEX idx_lead_tasks_org_id ON public.lead_tasks USING btree (org_id)` |
| idx_lead_tasks_due_date | `CREATE INDEX idx_lead_tasks_due_date ON public.lead_tasks USING btree (due_date)` |
| idx_lead_tasks_completed | `CREATE INDEX idx_lead_tasks_completed ON public.lead_tasks USING btree (completed) WHERE (NOT completed)` |
