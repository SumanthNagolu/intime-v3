# leaderboard_all_time Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `leaderboard_all_time` |
| Schema | `public` |
| Purpose | All-time rankings across all activity |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | YES | - | Reference to user |
| full_name | text | YES | - | Full Name |
| avatar_url | text | YES | - | URL for avatar |
| joined_at | timestamp with time zone | YES | - | Timestamp for joined |
| total_xp | bigint | YES | - | Total count of xp |
| level | integer | YES | - | Level |
| level_name | text | YES | - | Level Name |
| badge_count | bigint | YES | - | Count of badge |
| courses_completed | bigint | YES | - | Courses Completed |
| days_active | numeric | YES | - | Days Active |
| rank | bigint | YES | - | Rank |
| avg_xp_per_day | numeric | YES | - | Avg Xp Per Day |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
