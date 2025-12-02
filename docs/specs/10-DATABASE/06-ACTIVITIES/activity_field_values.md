# ACTIVITY_FIELD_VALUES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_field_values` |
| Schema | `public` |
| Purpose | Stores custom field values for activities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `field_id` | uuid | NO | NULL | Reference to field |
| `field_value` | text | YES | NULL | Field value |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `field_id` | `pattern_fields.id` | Links to pattern_fields |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_field_values_activity_id_field_id_key` | `CREATE UNIQUE INDEX activity_field_values_activity_id_field_id_key ON public.activity_field_values USING btree (activity_id, field_id)` |
| `activity_field_values_pkey` | `CREATE UNIQUE INDEX activity_field_values_pkey ON public.activity_field_values USING btree (id)` |

