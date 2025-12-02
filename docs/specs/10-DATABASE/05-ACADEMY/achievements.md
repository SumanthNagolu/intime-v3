# achievements Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `achievements` |
| Schema | `public` |
| Purpose | Definition of available achievements and their unlock criteria |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| slug | text | NO | - | URL-friendly unique identifier |
| name | text | NO | - | Display name |
| description | text | NO | - | Detailed description |
| category | text | NO | - | Category |
| badge_url | text | YES | - | URL for badge |
| xp_reward | integer | NO | 0 | Xp Reward |
| criteria | jsonb | NO | - | Criteria |
| is_secret | boolean | YES | false | Boolean flag: secret |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

No foreign key constraints defined.

## Indexes

| Index Name | Definition |
|------------|------------|
| achievements_pkey | `CREATE UNIQUE INDEX achievements_pkey ON public.achievements USING btree (id)` |
| achievements_slug_key | `CREATE UNIQUE INDEX achievements_slug_key ON public.achievements USING btree (slug)` |
| idx_achievements_slug | `CREATE INDEX idx_achievements_slug ON public.achievements USING btree (slug)` |
| idx_achievements_category | `CREATE INDEX idx_achievements_category ON public.achievements USING btree (category)` |
| idx_achievements_is_secret | `CREATE INDEX idx_achievements_is_secret ON public.achievements USING btree (is_secret)` |
