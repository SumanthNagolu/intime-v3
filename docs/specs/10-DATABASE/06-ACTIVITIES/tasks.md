# TASKS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `tasks` |
| Schema | `public` |
| Purpose | Simple task tracking (lighter than activities) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `title` | text | NO | NULL | Title |
| `description` | text | YES | NULL | Description |
| `entity_type` | text | YES | NULL | Type of entity (polymorphic relationship) |
| `entity_id` | uuid | YES | NULL | ID of the related entity (polymorphic relationship) |
| `assigned_to` | uuid | YES | NULL | User assigned to this record |
| `created_by` | uuid | NO | NULL | User who created the record |
| `status` | text | NO | todo | Current status of the record |
| `priority` | text | YES | medium | Priority level |
| `due_date` | date | YES | NULL | Due date for completion |
| `completed_at` | timestamp with time zone | YES | NULL | Timestamp when completed |
| `completed_by` | uuid | YES | NULL | Completed by |
| `is_recurring` | boolean | YES | false | Boolean flag: recurring |
| `recurrence_pattern` | text | YES | NULL | Recurrence pattern |
| `parent_task_id` | uuid | YES | NULL | Reference to parent task |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `assigned_to` | `user_profiles.id` | Links to user_profiles |
| `completed_by` | `user_profiles.id` | Links to user_profiles |
| `created_by` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |
| `parent_task_id` | `tasks.id` | Links to tasks |

## Indexes

| Index Name | Definition |
|------------|------------|
| `idx_tasks_assigned` | `CREATE INDEX idx_tasks_assigned ON public.tasks USING btree (assigned_to, status) WHERE (status = ANY (ARRAY['todo'::text, 'in_progress'::text]))` |
| `idx_tasks_assignee` | `CREATE INDEX idx_tasks_assignee ON public.tasks USING btree (assigned_to)` |
| `idx_tasks_created_by` | `CREATE INDEX idx_tasks_created_by ON public.tasks USING btree (created_by)` |
| `idx_tasks_due` | `CREATE INDEX idx_tasks_due ON public.tasks USING btree (due_date) WHERE (status = ANY (ARRAY['todo'::text, 'in_progress'::text]))` |
| `idx_tasks_entity` | `CREATE INDEX idx_tasks_entity ON public.tasks USING btree (entity_type, entity_id)` |
| `idx_tasks_org` | `CREATE INDEX idx_tasks_org ON public.tasks USING btree (org_id)` |
| `idx_tasks_status` | `CREATE INDEX idx_tasks_status ON public.tasks USING btree (status)` |
| `tasks_pkey` | `CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id)` |

