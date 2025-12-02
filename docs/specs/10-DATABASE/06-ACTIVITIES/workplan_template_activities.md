# WORKPLAN_TEMPLATE_ACTIVITIES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workplan_template_activities` |
| Schema | `public` |
| Purpose | Activities defined in workplan templates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `template_id` | uuid | NO | NULL | Reference to template |
| `pattern_id` | uuid | NO | NULL | Reference to activity pattern |
| `order_index` | integer | NO | 0 | Order index |
| `phase` | text | YES | NULL | Phase |
| `is_required` | boolean | YES | true | Boolean flag: required |
| `skip_condition` | jsonb | YES | NULL | JSON data for skip condition |
| `can_run_parallel` | boolean | YES | false | Can run parallel |
| `depends_on_activity_ids` | ARRAY | YES | NULL | Array of depends on activity ids |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `pattern_id` | `activity_patterns.id` | Links to activity_patterns |
| `template_id` | `workplan_templates.id` | Links to workplan_templates |

## Indexes

| Index Name | Definition |
|------------|------------|
| `workplan_template_activities_pkey` | `CREATE UNIQUE INDEX workplan_template_activities_pkey ON public.workplan_template_activities USING btree (id)` |
| `workplan_template_activities_template_id_pattern_id_key` | `CREATE UNIQUE INDEX workplan_template_activities_template_id_pattern_id_key ON public.workplan_template_activities USING btree (template_id, pattern_id)` |

