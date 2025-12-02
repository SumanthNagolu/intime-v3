# WORKPLAN_PHASES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workplan_phases` |
| Schema | `public` |
| Purpose | Phases within workplan templates or instances |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `template_id` | uuid | NO | NULL | Reference to template |
| `phase_name` | text | NO | NULL | Phase name |
| `phase_code` | text | NO | NULL | Phase code |
| `description` | text | YES | NULL | Description |
| `order_index` | integer | YES | 0 | Order index |
| `completion_criteria` | text | YES | all_required | Completion criteria |
| `auto_advance` | boolean | YES | true | Auto advance |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `template_id` | `workplan_templates.id` | Links to workplan_templates |

## Indexes

| Index Name | Definition |
|------------|------------|
| `workplan_phases_pkey` | `CREATE UNIQUE INDEX workplan_phases_pkey ON public.workplan_phases USING btree (id)` |
| `workplan_phases_template_id_phase_code_key` | `CREATE UNIQUE INDEX workplan_phases_template_id_phase_code_key ON public.workplan_phases USING btree (template_id, phase_code)` |

