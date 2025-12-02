# ACTIVITY_AUTO_RULES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_auto_rules` |
| Schema | `public` |
| Purpose | Defines automation rules for auto-creating activities based on events |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | YES | NULL | Organization ID (multi-tenant isolation) |
| `rule_name` | text | NO | NULL | Rule name |
| `rule_code` | text | NO | NULL | Rule code |
| `description` | text | YES | NULL | Description |
| `event_type` | text | NO | NULL | Event type |
| `event_category` | text | NO | NULL | Event category |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `condition` | jsonb | YES | NULL | JSON data for condition |
| `activity_pattern_id` | uuid | NO | NULL | Reference to activity pattern |
| `delay_days` | integer | YES | 0 | Delay days |
| `delay_hours` | integer | YES | 0 | Delay hours |
| `assign_to_field` | text | YES | NULL | Assign to field |
| `assign_to_user_id` | uuid | YES | NULL | Reference to assign to user |
| `assign_to_group_id` | uuid | YES | NULL | Reference to assign to group |
| `is_active` | boolean | YES | true | Whether the record is active |
| `priority` | integer | YES | 0 | Priority level |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_pattern_id` | `activity_patterns.id` | Links to activity_patterns |
| `assign_to_group_id` | `pods.id` | Links to pods |
| `assign_to_user_id` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_auto_rules_event_type_idx` | `CREATE INDEX activity_auto_rules_event_type_idx ON public.activity_auto_rules USING btree (event_type)` |
| `activity_auto_rules_org_id_rule_code_key` | `CREATE UNIQUE INDEX activity_auto_rules_org_id_rule_code_key ON public.activity_auto_rules USING btree (org_id, rule_code)` |
| `activity_auto_rules_pkey` | `CREATE UNIQUE INDEX activity_auto_rules_pkey ON public.activity_auto_rules USING btree (id)` |

