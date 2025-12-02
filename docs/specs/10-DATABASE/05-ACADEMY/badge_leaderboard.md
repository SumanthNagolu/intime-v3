# badge_leaderboard Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `badge_leaderboard` |
| Schema | `public` |
| Purpose | Rankings based on badge collection and rarity |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | YES | - | Reference to user |
| full_name | text | YES | - | Full Name |
| avatar_url | text | YES | - | URL for avatar |
| badge_count | bigint | YES | - | Count of badge |
| rarity_score | bigint | YES | - | Rarity Score |
| badge_xp_earned | bigint | YES | - | Badge Xp Earned |
| recent_badges | jsonb | YES | - | Recent Badges |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
