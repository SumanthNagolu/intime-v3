# leaderboard_by_course Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `leaderboard_by_course` |
| Schema | `public` |
| Purpose | Course-specific leaderboards |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| course_id | uuid | YES | - | Reference to course |
| course_title | text | YES | - | Course Title |
| user_id | uuid | YES | - | Reference to user |
| full_name | text | YES | - | Full Name |
| avatar_url | text | YES | - | URL for avatar |
| course_xp | bigint | YES | - | Course Xp |
| completion_percentage | integer | YES | - | Completion Percentage |
| modules_completed | integer | YES | - | Modules Completed |
| total_modules | integer | YES | - | Total count of modules |
| rank | bigint | YES | - | Rank |
| total_students | bigint | YES | - | Total count of students |
| percentile | numeric | YES | - | Percentile |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
