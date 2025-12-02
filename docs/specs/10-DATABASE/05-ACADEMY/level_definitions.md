# level_definitions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `level_definitions` |
| Schema | `public` |
| Purpose | Definition of levels with XP thresholds and rewards |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| level | integer | NO | - | Level |
| xp_required | integer | NO | - | Xp Required |
| title | text | NO | - | Display title |
| badge_url | text | YES | - | URL for badge |
| perks | jsonb | YES | - | Perks |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

No foreign key constraints defined.

## Indexes

| Index Name | Definition |
|------------|------------|
| level_definitions_pkey | `CREATE UNIQUE INDEX level_definitions_pkey ON public.level_definitions USING btree (level)` |
| idx_level_definitions_xp_required | `CREATE INDEX idx_level_definitions_xp_required ON public.level_definitions USING btree (xp_required)` |
