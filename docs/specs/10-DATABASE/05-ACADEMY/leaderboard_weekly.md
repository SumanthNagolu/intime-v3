# leaderboard_weekly Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `leaderboard_weekly` |
| Schema | `public` |
| Purpose | Weekly rolling leaderboard rankings |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| week_start | timestamp with time zone | YES | - | Week Start |
| week_label | text | YES | - | Week Label |
| user_id | uuid | YES | - | Reference to user |
| full_name | text | YES | - | Full Name |
| avatar_url | text | YES | - | URL for avatar |
| weekly_xp | bigint | YES | - | Weekly Xp |
| rank | bigint | YES | - | Rank |
| participants | bigint | YES | - | Participants |
| is_current_week | boolean | YES | - | Boolean flag: current week |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
