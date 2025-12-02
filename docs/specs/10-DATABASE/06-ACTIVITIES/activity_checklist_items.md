# ACTIVITY_CHECKLIST_ITEMS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_checklist_items` |
| Schema | `public` |
| Purpose | Individual checklist items within activities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `pattern_checklist_item_id` | uuid | YES | NULL | Reference to pattern checklist item |
| `item_text` | text | NO | NULL | Item text |
| `order_index` | integer | YES | 0 | Order index |
| `is_completed` | boolean | YES | false | Boolean flag: completed |
| `completed_at` | timestamp with time zone | YES | NULL | Timestamp when completed |
| `completed_by` | uuid | YES | NULL | Completed by |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `completed_by` | `user_profiles.id` | Links to user_profiles |
| `pattern_checklist_item_id` | `pattern_checklist_items.id` | Links to pattern_checklist_items |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_checklist_items_pkey` | `CREATE UNIQUE INDEX activity_checklist_items_pkey ON public.activity_checklist_items USING btree (id)` |

