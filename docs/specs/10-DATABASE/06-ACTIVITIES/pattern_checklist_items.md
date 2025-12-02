# PATTERN_CHECKLIST_ITEMS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `pattern_checklist_items` |
| Schema | `public` |
| Purpose | Template checklist items for activity patterns |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `pattern_id` | uuid | NO | NULL | Reference to activity pattern |
| `item_text` | text | NO | NULL | Item text |
| `order_index` | integer | YES | 0 | Order index |
| `is_required` | boolean | YES | false | Boolean flag: required |
| `auto_complete_condition` | jsonb | YES | NULL | JSON data for auto complete condition |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `pattern_id` | `activity_patterns.id` | Links to activity_patterns |

## Indexes

| Index Name | Definition |
|------------|------------|
| `pattern_checklist_items_pkey` | `CREATE UNIQUE INDEX pattern_checklist_items_pkey ON public.pattern_checklist_items USING btree (id)` |

