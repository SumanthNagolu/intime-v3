# WORKPLAN_INSTANCES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workplan_instances` |
| Schema | `public` |
| Purpose | Active instances of workplan templates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `template_id` | uuid | YES | NULL | Reference to template |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `entity_id` | uuid | NO | NULL | ID of the related entity (polymorphic relationship) |
| `template_code` | text | YES | NULL | Template code |
| `template_name` | text | YES | NULL | Template name |
| `status` | text | YES | active | Current status of the record |
| `total_activities` | integer | YES | 0 | Total activities |
| `completed_activities` | integer | YES | 0 | Completed activities |
| `skipped_activities` | integer | YES | 0 | Skipped activities |
| `current_phase` | text | YES | NULL | Current phase |
| `started_at` | timestamp with time zone | YES | CURRENT_TIMESTAMP | Timestamp when started |
| `paused_at` | timestamp with time zone | YES | NULL | Timestamp when paused |
| `completed_at` | timestamp with time zone | YES | NULL | Timestamp when completed |
| `canceled_at` | timestamp with time zone | YES | NULL | Timestamp when canceled |
| `outcome` | text | YES | NULL | Outcome |
| `outcome_notes` | text | YES | NULL | Outcome notes |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `created_by` | uuid | YES | NULL | User who created the record |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |
| `template_id` | `workplan_templates.id` | Links to workplan_templates |

## Indexes

| Index Name | Definition |
|------------|------------|
| `workplan_instances_entity_idx` | `CREATE INDEX workplan_instances_entity_idx ON public.workplan_instances USING btree (entity_type, entity_id)` |
| `workplan_instances_pkey` | `CREATE UNIQUE INDEX workplan_instances_pkey ON public.workplan_instances USING btree (id)` |
| `workplan_instances_status_idx` | `CREATE INDEX workplan_instances_status_idx ON public.workplan_instances USING btree (status)` |

