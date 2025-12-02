# ACTIVITY_DEPENDENCIES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_dependencies` |
| Schema | `public` |
| Purpose | Defines dependencies between activities (finish-to-start, etc.) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `depends_on_activity_id` | uuid | NO | NULL | Reference to depends on activity |
| `dependency_type` | text | YES | finish_to_start | Dependency type |
| `lag_days` | integer | YES | 0 | Lag days |
| `is_strict` | boolean | YES | true | Boolean flag: strict |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `depends_on_activity_id` | `activities.id` | Links to activities |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_dependencies_activity_id_depends_on_activity_id_key` | `CREATE UNIQUE INDEX activity_dependencies_activity_id_depends_on_activity_id_key ON public.activity_dependencies USING btree (activity_id, depends_on_activity_id)` |
| `activity_dependencies_activity_idx` | `CREATE INDEX activity_dependencies_activity_idx ON public.activity_dependencies USING btree (activity_id)` |
| `activity_dependencies_pkey` | `CREATE UNIQUE INDEX activity_dependencies_pkey ON public.activity_dependencies USING btree (id)` |

