# SLA_DEFINITIONS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `sla_definitions` |
| Schema | `public` |
| Purpose | Service Level Agreement definitions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | YES | NULL | Organization ID (multi-tenant isolation) |
| `sla_name` | text | NO | NULL | Sla name |
| `sla_code` | text | NO | NULL | Sla code |
| `description` | text | YES | NULL | Description |
| `entity_type` | text | NO | NULL | Type of entity (polymorphic relationship) |
| `activity_type` | text | YES | NULL | Activity type |
| `activity_category` | text | YES | NULL | Activity category |
| `priority` | text | YES | NULL | Priority level |
| `target_hours` | integer | NO | NULL | Target hours |
| `warning_hours` | integer | YES | NULL | Warning hours |
| `critical_hours` | integer | YES | NULL | Critical hours |
| `use_business_hours` | boolean | YES | false | Use business hours |
| `business_hours_start` | text | YES | 09:00 | Business hours start |
| `business_hours_end` | text | YES | 17:00 | Business hours end |
| `escalate_on_breach` | boolean | YES | false | Escalate on breach |
| `escalate_to_user_id` | uuid | YES | NULL | Reference to escalate to user |
| `escalate_to_group_id` | uuid | YES | NULL | Reference to escalate to group |
| `is_active` | boolean | YES | true | Whether the record is active |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `escalate_to_group_id` | `pods.id` | Links to pods |
| `escalate_to_user_id` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `sla_definitions_org_id_sla_code_key` | `CREATE UNIQUE INDEX sla_definitions_org_id_sla_code_key ON public.sla_definitions USING btree (org_id, sla_code)` |
| `sla_definitions_pkey` | `CREATE UNIQUE INDEX sla_definitions_pkey ON public.sla_definitions USING btree (id)` |

