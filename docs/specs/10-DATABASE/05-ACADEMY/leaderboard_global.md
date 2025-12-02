# leaderboard_global Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `leaderboard_global` |
| Schema | `public` |
| Purpose | Global cross-organization leaderboards |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | YES | - | Reference to user |
| full_name | text | YES | - | Full Name |
| avatar_url | text | YES | - | URL for avatar |
| total_xp | bigint | YES | - | Total count of xp |
| level | integer | YES | - | Level |
| level_name | text | YES | - | Level Name |
| rank | bigint | YES | - | Rank |
| dense_rank | bigint | YES | - | Dense Rank |
| xp_diff_from_above | bigint | YES | - | Xp Diff From Above |
| xp_to_next_rank | bigint | YES | - | Xp To Next Rank |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
