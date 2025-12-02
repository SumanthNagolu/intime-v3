# capstone_statistics Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `capstone_statistics` |
| Schema | `public` |
| Purpose | Analytics on capstone project outcomes and grading distribution |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| course_id | uuid | YES | - | Reference to course |
| course_title | text | YES | - | Course Title |
| total_submissions | bigint | YES | - | Total count of submissions |
| passed_count | bigint | YES | - | Count of passed |
| failed_count | bigint | YES | - | Count of failed |
| revision_count | bigint | YES | - | Count of revision |
| avg_grade | numeric | YES | - | Avg Grade |
| avg_peer_reviews | numeric | YES | - | Avg Peer Reviews |
| avg_revisions | numeric | YES | - | Avg Revisions |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
