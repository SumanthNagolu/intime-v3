# QUEUE_ITEMS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `queue_items` |
| Schema | `public` |
| Purpose | Items in work queues awaiting assignment |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `queue_id` | uuid | NO | NULL | Reference to queue |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `entity_id` | uuid | NO | NULL | ID of the related entity (polymorphic relationship) |
| `priority` | integer | YES | 0 | Priority level |
| `order_index` | integer | YES | 0 | Order index |
| `assigned_to` | uuid | YES | NULL | User assigned to this record |
| `assigned_at` | timestamp with time zone | YES | NULL | Timestamp when assigned |
| `status` | text | YES | queued | Current status of the record |
| `enqueued_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when enqueued |
| `started_at` | timestamp with time zone | YES | NULL | Timestamp when started |
| `completed_at` | timestamp with time zone | YES | NULL | Timestamp when completed |
| `removed_at` | timestamp with time zone | YES | NULL | Timestamp when removed |
| `metadata` | jsonb | YES | NULL | JSON data for metadata |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `assigned_to` | `user_profiles.id` | Links to user_profiles |
| `queue_id` | `work_queues.id` | Links to work_queues |

## Indexes

| Index Name | Definition |
|------------|------------|
| `queue_items_entity_idx` | `CREATE INDEX queue_items_entity_idx ON public.queue_items USING btree (entity_type, entity_id)` |
| `queue_items_pkey` | `CREATE UNIQUE INDEX queue_items_pkey ON public.queue_items USING btree (id)` |
| `queue_items_queue_id_entity_type_entity_id_key` | `CREATE UNIQUE INDEX queue_items_queue_id_entity_type_entity_id_key ON public.queue_items USING btree (queue_id, entity_type, entity_id)` |
| `queue_items_queue_idx` | `CREATE INDEX queue_items_queue_idx ON public.queue_items USING btree (queue_id)` |
| `queue_items_status_idx` | `CREATE INDEX queue_items_status_idx ON public.queue_items USING btree (status)` |

