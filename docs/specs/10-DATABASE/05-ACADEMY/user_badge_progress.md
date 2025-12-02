# user_badge_progress Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `user_badge_progress` |
| Schema | `public` |
| Purpose | Individual user progress toward specific badges |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | YES | - | Reference to user |
| full_name | text | YES | - | Full Name |
| common_badges | bigint | YES | - | Common Badges |
| rare_badges | bigint | YES | - | Rare Badges |
| epic_badges | bigint | YES | - | Epic Badges |
| legendary_badges | bigint | YES | - | Legendary Badges |
| total_badges_earned | bigint | YES | - | Total count of badges earned |
| total_badges_available | bigint | YES | - | Total count of badges available |
| completion_percentage | numeric | YES | - | Completion Percentage |
| last_badge_earned_at | timestamp with time zone | YES | - | Timestamp for last badge earned |
| new_badges_count | bigint | YES | - | Count of new badges |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
