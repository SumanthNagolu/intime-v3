# PATTERN_FIELDS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `pattern_fields` |
| Schema | `public` |
| Purpose | Custom field definitions for activity patterns |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `pattern_id` | uuid | NO | NULL | Reference to activity pattern |
| `field_name` | text | NO | NULL | Field name |
| `field_label` | text | NO | NULL | Field label |
| `field_type` | text | NO | NULL | Field type |
| `is_required` | boolean | YES | false | Boolean flag: required |
| `default_value` | text | YES | NULL | Default value |
| `validation_rules` | jsonb | YES | NULL | JSON data for validation rules |
| `order_index` | integer | YES | 0 | Order index |
| `placeholder` | text | YES | NULL | Placeholder |
| `help_text` | text | YES | NULL | Help text |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `pattern_id` | `activity_patterns.id` | Links to activity_patterns |

## Indexes

| Index Name | Definition |
|------------|------------|
| `pattern_fields_pattern_id_field_name_key` | `CREATE UNIQUE INDEX pattern_fields_pattern_id_field_name_key ON public.pattern_fields USING btree (pattern_id, field_name)` |
| `pattern_fields_pkey` | `CREATE UNIQUE INDEX pattern_fields_pkey ON public.pattern_fields USING btree (id)` |

