# talking_point_templates Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `talking_point_templates` |
| Schema | `public` |
| Purpose | Reusable talking point templates for meetings |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `name` | text | NO | - | Name |
| `description` | text | YES | - | Description |
| `category` | text | YES | - | Category |
| `talking_points` | jsonb | YES | '[]'::jsonb | Talking Points |
| `is_default` | boolean | YES | false | Default flag |
| `is_active` | boolean | YES | true | Active/inactive flag |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `talking_point_templates_pkey` | `CREATE UNIQUE INDEX talking_point_templates_pkey ON public.talking_point_templates USING btree (id)` |
| `idx_talking_point_templates_org` | `CREATE INDEX idx_talking_point_templates_org ON public.talking_point_templates USING btree (org_id)` |

## Usage Notes

