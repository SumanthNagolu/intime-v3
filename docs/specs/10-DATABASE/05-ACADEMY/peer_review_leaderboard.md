# peer_review_leaderboard Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `peer_review_leaderboard` |
| Schema | `public` |
| Purpose | Rankings based on peer review quality and quantity |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| reviewer_id | uuid | YES | - | Foreign key reference to reviewer |
| reviewer_name | text | YES | - | Reviewer Name |
| reviews_completed | bigint | YES | - | Reviews Completed |
| avg_rating_given | numeric | YES | - | Avg Rating Given |
| courses_reviewed | bigint | YES | - | Courses Reviewed |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
