# ACTIVITY_PATTERN_SUCCESSORS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_pattern_successors` |
| Schema | `public` |
| Purpose | Defines successor activities in activity patterns |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `pattern_id` | uuid | NO | NULL | Reference to activity pattern |
| `successor_pattern_id` | uuid | NO | NULL | Reference to successor pattern |
| `condition_type` | text | YES | always | Condition type |
| `condition_field` | text | YES | NULL | Condition field |
| `condition_value` | text | YES | NULL | Condition value |
| `condition_expression` | jsonb | YES | NULL | JSON data for condition expression |
| `delay_days` | integer | YES | 0 | Delay days |
| `order_index` | integer | YES | 0 | Order index |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `pattern_id` | `activity_patterns.id` | Links to activity_patterns |
| `successor_pattern_id` | `activity_patterns.id` | Links to activity_patterns |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_pattern_successors_pattern_id_successor_pattern_id_key` | `CREATE UNIQUE INDEX activity_pattern_successors_pattern_id_successor_pattern_id_key ON public.activity_pattern_successors USING btree (pattern_id, successor_pattern_id)` |
| `activity_pattern_successors_pkey` | `CREATE UNIQUE INDEX activity_pattern_successors_pkey ON public.activity_pattern_successors USING btree (id)` |

