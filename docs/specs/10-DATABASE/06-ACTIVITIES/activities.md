# ACTIVITIES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activities` |
| Schema | `public` |
| Purpose | Core table for tracking all activities across the platform (tasks, calls, emails, meetings, etc.) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `entity_id` | uuid | NO | NULL | ID of the related entity (polymorphic relationship) |
| `activity_type` | text | NO | NULL | Activity type |
| `status` | text | NO | open | Current status of the record |
| `priority` | text | NO | medium | Priority level |
| `subject` | text | YES | NULL | Subject |
| `body` | text | YES | NULL | Body |
| `direction` | text | YES | NULL | Direction |
| `scheduled_at` | timestamp with time zone | YES | NULL | Timestamp when scheduled |
| `due_date` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Due date for completion |
| `escalation_date` | timestamp with time zone | YES | NULL | Escalation date |
| `completed_at` | timestamp with time zone | YES | NULL | Timestamp when completed |
| `skipped_at` | timestamp with time zone | YES | NULL | Timestamp when skipped |
| `duration_minutes` | integer | YES | NULL | Duration minutes |
| `outcome` | text | YES | NULL | Outcome |
| `assigned_to` | uuid | NO | NULL | User assigned to this record |
| `performed_by` | uuid | YES | NULL | User who performed the action |
| `poc_id` | uuid | YES | NULL | Reference to poc |
| `parent_activity_id` | uuid | YES | NULL | Reference to parent activity |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| `created_by` | uuid | YES | NULL | User who created the record |
| `pattern_code` | text | YES | NULL | Pattern code |
| `pattern_id` | uuid | YES | NULL | Reference to activity pattern |
| `workplan_instance_id` | uuid | YES | NULL | Reference to workplan instance |
| `description` | text | YES | NULL | Description |
| `category` | text | YES | NULL | Category |
| `instructions` | text | YES | NULL | Instructions |
| `checklist` | jsonb | YES | NULL | JSON data for checklist |
| `checklist_progress` | jsonb | YES | NULL | JSON data for checklist progress |
| `assigned_group` | uuid | YES | NULL | Assigned group |
| `assigned_at` | timestamp with time zone | YES | NULL | Timestamp when assigned |
| `started_at` | timestamp with time zone | YES | NULL | Timestamp when started |
| `scheduled_for` | timestamp with time zone | YES | NULL | Scheduled for |
| `outcome_notes` | text | YES | NULL | Outcome notes |
| `auto_created` | boolean | YES | false | Auto created |
| `auto_completed` | boolean | YES | false | Auto completed |
| `predecessor_activity_id` | uuid | YES | NULL | Reference to predecessor activity |
| `escalation_count` | integer | YES | 0 | Count of escalation |
| `last_escalated_at` | timestamp with time zone | YES | NULL | Timestamp when last escalated |
| `reminder_sent_at` | timestamp with time zone | YES | NULL | Timestamp when reminder sent |
| `reminder_count` | integer | YES | 0 | Count of reminder |
| `deleted_at` | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if active) |
| `updated_by` | uuid | YES | NULL | User who last updated the record |
| `activity_number` | text | YES | NULL | Activity number |
| `secondary_entity_type` | text | YES | NULL | Secondary entity type |
| `secondary_entity_id` | uuid | YES | NULL | Reference to secondary entity |
| `follow_up_required` | boolean | YES | false | Follow up required |
| `follow_up_date` | timestamp with time zone | YES | NULL | Follow up date |
| `follow_up_activity_id` | uuid | YES | NULL | Reference to follow up activity |
| `tags` | ARRAY | YES | NULL | Array of tag values |
| `custom_fields` | jsonb | YES | {} | JSONB storage for custom field values |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `assigned_group` | `pods.id` | Links to pods |
| `assigned_to` | `user_profiles.id` | Links to user_profiles |
| `created_by` | `user_profiles.id` | Links to user_profiles |
| `follow_up_activity_id` | `activities.id` | Links to activities |
| `org_id` | `organizations.id` | Links to organizations |
| `parent_activity_id` | `activities.id` | Links to activities |
| `pattern_id` | `activity_patterns.id` | Links to activity_patterns |
| `performed_by` | `user_profiles.id` | Links to user_profiles |
| `predecessor_activity_id` | `activities.id` | Links to activities |
| `updated_by` | `user_profiles.id` | Links to user_profiles |
| `workplan_instance_id` | `workplan_instances.id` | Links to workplan_instances |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activities_activity_type_idx` | `CREATE INDEX activities_activity_type_idx ON public.activities USING btree (activity_type)` |
| `activities_assigned_to_idx` | `CREATE INDEX activities_assigned_to_idx ON public.activities USING btree (assigned_to)` |
| `activities_due_date_idx` | `CREATE INDEX activities_due_date_idx ON public.activities USING btree (due_date)` |
| `activities_entity_idx` | `CREATE INDEX activities_entity_idx ON public.activities USING btree (entity_type, entity_id)` |
| `activities_pattern_idx` | `CREATE INDEX activities_pattern_idx ON public.activities USING btree (pattern_id)` |
| `activities_pkey` | `CREATE UNIQUE INDEX activities_pkey ON public.activities USING btree (id)` |
| `activities_status_idx` | `CREATE INDEX activities_status_idx ON public.activities USING btree (status)` |
| `activities_workplan_instance_idx` | `CREATE INDEX activities_workplan_instance_idx ON public.activities USING btree (workplan_instance_id)` |
| `idx_activities_activity_number` | `CREATE INDEX idx_activities_activity_number ON public.activities USING btree (activity_number)` |
| `idx_activities_assigned_to` | `CREATE INDEX idx_activities_assigned_to ON public.activities USING btree (assigned_to)` |
| `idx_activities_due_date` | `CREATE INDEX idx_activities_due_date ON public.activities USING btree (due_date)` |
| `idx_activities_entity` | `CREATE INDEX idx_activities_entity ON public.activities USING btree (entity_type, entity_id)` |
| `idx_activities_follow_up_date` | `CREATE INDEX idx_activities_follow_up_date ON public.activities USING btree (follow_up_date) WHERE (follow_up_required = true)` |
| `idx_activities_org` | `CREATE INDEX idx_activities_org ON public.activities USING btree (org_id)` |
| `idx_activities_org_id` | `CREATE INDEX idx_activities_org_id ON public.activities USING btree (org_id)` |
| `idx_activities_parent` | `CREATE INDEX idx_activities_parent ON public.activities USING btree (parent_activity_id)` |
| `idx_activities_secondary_entity` | `CREATE INDEX idx_activities_secondary_entity ON public.activities USING btree (secondary_entity_type, secondary_entity_id)` |
| `idx_activities_status` | `CREATE INDEX idx_activities_status ON public.activities USING btree (status)` |
| `idx_activities_tags` | `CREATE INDEX idx_activities_tags ON public.activities USING gin (tags)` |
| `idx_activities_type` | `CREATE INDEX idx_activities_type ON public.activities USING btree (activity_type)` |
| `uq_activities_org_activity_number` | `CREATE UNIQUE INDEX uq_activities_org_activity_number ON public.activities USING btree (org_id, activity_number)` |

## Usage Notes

- Activities are polymorphic and can be attached to any entity via `entity_type` and `entity_id`
- Support for activity patterns enables automated activity creation
- Activities can be part of workplans for complex multi-step processes
- Soft delete support via `deleted_at` column
- Custom fields stored in `custom_fields` JSONB column
- Activity dependencies enable workflow orchestration

