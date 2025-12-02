# ACTIVITY_PATTERNS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_patterns` |
| Schema | `public` |
| Purpose | Reusable activity templates and patterns |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | YES | NULL | Organization ID (multi-tenant isolation) |
| `code` | text | NO | NULL | Code |
| `name` | text | NO | NULL | Name |
| `description` | text | YES | NULL | Description |
| `target_days` | integer | YES | 1 | Target days |
| `escalation_days` | integer | YES | NULL | Escalation days |
| `default_assignee` | text | YES | owner | Default assignee |
| `assignee_group_id` | uuid | YES | NULL | Reference to assignee group |
| `assignee_user_id` | uuid | YES | NULL | Reference to assignee user |
| `priority` | text | YES | normal | Priority level |
| `auto_complete` | boolean | YES | false | Auto complete |
| `auto_complete_condition` | jsonb | YES | NULL | JSON data for auto complete condition |
| `auto_action` | text | YES | NULL | Auto action |
| `auto_action_config` | jsonb | YES | NULL | JSON data for auto action config |
| `category` | text | YES | NULL | Category |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `instructions` | text | YES | NULL | Instructions |
| `checklist` | jsonb | YES | NULL | JSON data for checklist |
| `is_system` | boolean | YES | false | Boolean flag: system |
| `is_active` | boolean | YES | true | Whether the record is active |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `assignee_group_id` | `pods.id` | Links to pods |
| `assignee_user_id` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_patterns_entity_type_idx` | `CREATE INDEX activity_patterns_entity_type_idx ON public.activity_patterns USING btree (entity_type)` |
| `activity_patterns_org_id_code_key` | `CREATE UNIQUE INDEX activity_patterns_org_id_code_key ON public.activity_patterns USING btree (org_id, code)` |
| `activity_patterns_pkey` | `CREATE UNIQUE INDEX activity_patterns_pkey ON public.activity_patterns USING btree (id)` |

## Usage Notes

- Patterns are reusable activity templates
- Can be automatically triggered via activity_auto_rules
- Support for successor patterns enables activity chains
- Pattern fields define custom field requirements

