# badges Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `badges` |
| Schema | `public` |
| Purpose | Badge definitions with images, criteria, and point values |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| slug | text | NO | - | URL-friendly unique identifier |
| name | text | NO | - | Display name |
| description | text | NO | - | Detailed description |
| icon_url | text | YES | - | URL for icon |
| xp_reward | integer | YES | 50 | Xp Reward |
| rarity | text | NO | - | Rarity |
| display_order | integer | YES | 0 | Display Order |
| is_hidden | boolean | YES | false | Boolean flag: hidden |
| trigger_type | text | NO | - | Trigger Type |
| trigger_threshold | integer | YES | 1 | Trigger Threshold |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

No foreign key constraints defined.

## Indexes

| Index Name | Definition |
|------------|------------|
| badges_pkey | `CREATE UNIQUE INDEX badges_pkey ON public.badges USING btree (id)` |
| badges_slug_key | `CREATE UNIQUE INDEX badges_slug_key ON public.badges USING btree (slug)` |
| idx_badges_trigger_type | `CREATE INDEX idx_badges_trigger_type ON public.badges USING btree (trigger_type)` |
| idx_badges_rarity | `CREATE INDEX idx_badges_rarity ON public.badges USING btree (rarity)` |
