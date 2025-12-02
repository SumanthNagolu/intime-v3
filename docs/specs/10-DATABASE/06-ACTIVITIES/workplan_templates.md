# WORKPLAN_TEMPLATES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `workplan_templates` |
| Schema | `public` |
| Purpose | Reusable multi-activity workplan templates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | YES | NULL | Organization ID (multi-tenant isolation) |
| `code` | text | NO | NULL | Code |
| `name` | text | NO | NULL | Name |
| `description` | text | YES | NULL | Description |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `trigger_event` | text | YES | manual | Trigger event |
| `trigger_status` | text | YES | NULL | Trigger status |
| `trigger_field` | text | YES | NULL | Trigger field |
| `trigger_condition` | jsonb | YES | NULL | JSON data for trigger condition |
| `completion_criteria` | text | YES | all_required | Completion criteria |
| `is_system` | boolean | YES | false | Boolean flag: system |
| `is_active` | boolean | YES | true | Whether the record is active |
| `version` | integer | YES | 1 | Version |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `workplan_templates_org_id_code_key` | `CREATE UNIQUE INDEX workplan_templates_org_id_code_key ON public.workplan_templates USING btree (org_id, code)` |
| `workplan_templates_pkey` | `CREATE UNIQUE INDEX workplan_templates_pkey ON public.workplan_templates USING btree (id)` |

