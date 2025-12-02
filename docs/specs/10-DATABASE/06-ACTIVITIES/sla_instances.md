# SLA_INSTANCES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `sla_instances` |
| Schema | `public` |
| Purpose | Active SLA tracking instances |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `sla_definition_id` | uuid | NO | NULL | Reference to sla definition |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `start_time` | timestamp with time zone | NO | NULL | Start time |
| `target_time` | timestamp with time zone | NO | NULL | Target time |
| `warning_time` | timestamp with time zone | YES | NULL | Warning time |
| `critical_time` | timestamp with time zone | YES | NULL | Critical time |
| `completed_at` | timestamp with time zone | YES | NULL | Timestamp when completed |
| `status` | text | YES | active | Current status of the record |
| `paused_at` | timestamp with time zone | YES | NULL | Timestamp when paused |
| `resumed_at` | timestamp with time zone | YES | NULL | Timestamp when resumed |
| `breach_duration` | integer | YES | NULL | Breach duration |
| `is_breached` | boolean | YES | false | Boolean flag: breached |
| `breached_at` | timestamp with time zone | YES | NULL | Timestamp when breached |
| `escalation_sent` | boolean | YES | false | Escalation sent |
| `escalation_sent_at` | timestamp with time zone | YES | NULL | Timestamp when escalation sent |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `org_id` | `organizations.id` | Links to organizations |
| `sla_definition_id` | `sla_definitions.id` | Links to sla_definitions |

## Indexes

| Index Name | Definition |
|------------|------------|
| `sla_instances_activity_idx` | `CREATE INDEX sla_instances_activity_idx ON public.sla_instances USING btree (activity_id)` |
| `sla_instances_pkey` | `CREATE UNIQUE INDEX sla_instances_pkey ON public.sla_instances USING btree (id)` |
| `sla_instances_status_idx` | `CREATE INDEX sla_instances_status_idx ON public.sla_instances USING btree (status)` |
| `sla_instances_target_time_idx` | `CREATE INDEX sla_instances_target_time_idx ON public.sla_instances USING btree (target_time)` |

