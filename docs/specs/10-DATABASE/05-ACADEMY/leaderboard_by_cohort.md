# leaderboard_by_cohort Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `leaderboard_by_cohort` |
| Schema | `public` |
| Purpose | Cohort-based competitive rankings |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| course_id | uuid | YES | - | Reference to course |
| course_title | text | YES | - | Course Title |
| cohort_month | timestamp with time zone | YES | - | Cohort Month |
| cohort_name | text | YES | - | Cohort Name |
| user_id | uuid | YES | - | Reference to user |
| full_name | text | YES | - | Full Name |
| avatar_url | text | YES | - | URL for avatar |
| total_xp | bigint | YES | - | Total count of xp |
| completion_percentage | integer | YES | - | Completion Percentage |
| enrolled_at | timestamp with time zone | YES | - | Timestamp for enrolled |
| rank | bigint | YES | - | Rank |
| cohort_size | bigint | YES | - | Cohort Size |
| cohort_percentile | numeric | YES | - | Cohort Percentile |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
