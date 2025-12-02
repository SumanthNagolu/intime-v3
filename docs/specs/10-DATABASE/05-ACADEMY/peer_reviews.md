# peer_reviews Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `peer_reviews` |
| Schema | `public` |
| Purpose | Peer review submissions and feedback |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| submission_id | uuid | NO | - | Foreign key reference to submission |
| reviewer_id | uuid | NO | - | Foreign key reference to reviewer |
| rating | integer | NO | - | Rating |
| comments | text | NO | - | Comments |
| strengths | text | YES | - | Strengths |
| improvements | text | YES | - | Improvements |
| reviewed_at | timestamp with time zone | YES | now() | Timestamp for reviewed |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| reviewer_id | user_profiles.id | peer_reviews_reviewer_id_fkey |
| submission_id | capstone_submissions.id | peer_reviews_submission_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| peer_reviews_pkey | `CREATE UNIQUE INDEX peer_reviews_pkey ON public.peer_reviews USING btree (id)` |
| peer_reviews_submission_id_reviewer_id_key | `CREATE UNIQUE INDEX peer_reviews_submission_id_reviewer_id_key ON public.peer_reviews USING btree (submission_id, reviewer_id)` |
| idx_peer_reviews_submission | `CREATE INDEX idx_peer_reviews_submission ON public.peer_reviews USING btree (submission_id)` |
| idx_peer_reviews_reviewer | `CREATE INDEX idx_peer_reviews_reviewer ON public.peer_reviews USING btree (reviewer_id)` |
