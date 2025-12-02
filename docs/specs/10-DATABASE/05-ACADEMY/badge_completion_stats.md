# badge_completion_stats Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `badge_completion_stats` |
| Schema | `public` |
| Purpose | Analytics on badge earn rates and completion times |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| badge_id | uuid | YES | - | Foreign key reference to badge |
| badge_name | text | YES | - | Badge Name |
| rarity | text | YES | - | Rarity |
| trigger_type | text | YES | - | Trigger Type |
| total_earned | bigint | YES | - | Total count of earned |
| unique_earners | bigint | YES | - | Unique Earners |
| completion_percentage | numeric | YES | - | Completion Percentage |
| first_earned_at | timestamp with time zone | YES | - | Timestamp for first earned |
| last_earned_at | timestamp with time zone | YES | - | Timestamp for last earned |
| total_shares | bigint | YES | - | Total count of shares |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
