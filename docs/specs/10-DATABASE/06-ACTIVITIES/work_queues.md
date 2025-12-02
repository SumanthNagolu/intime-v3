# WORK_QUEUES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `work_queues` |
| Schema | `public` |
| Purpose | Work queue definitions for routing activities/tasks |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | YES | NULL | Organization ID (multi-tenant isolation) |
| `queue_name` | text | NO | NULL | Queue name |
| `queue_code` | text | NO | NULL | Queue code |
| `description` | text | YES | NULL | Description |
| `queue_type` | text | YES | activity | Queue type |
| `entity_type` | text | YES | NULL | Type of entity (polymorphic relationship) |
| `assigned_to_group_id` | uuid | YES | NULL | Reference to assigned to group |
| `assignment_strategy` | text | YES | round_robin | Assignment strategy |
| `filter_criteria` | jsonb | YES | NULL | JSON data for filter criteria |
| `sort_order` | text | YES | priority_desc | Sort order |
| `is_active` | boolean | YES | true | Whether the record is active |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `assigned_to_group_id` | `pods.id` | Links to pods |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `work_queues_org_id_queue_code_key` | `CREATE UNIQUE INDEX work_queues_org_id_queue_code_key ON public.work_queues USING btree (org_id, queue_code)` |
| `work_queues_pkey` | `CREATE UNIQUE INDEX work_queues_pkey ON public.work_queues USING btree (id)` |

