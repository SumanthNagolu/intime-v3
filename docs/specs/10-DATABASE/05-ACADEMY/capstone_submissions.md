# capstone_submissions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `capstone_submissions` |
| Schema | `public` |
| Purpose | Final project submissions from students |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| course_id | uuid | NO | - | Reference to course |
| repository_url | text | NO | - | URL for repository |
| demo_video_url | text | YES | - | URL for demo video |
| description | text | YES | - | Detailed description |
| submitted_at | timestamp with time zone | YES | now() | Timestamp for submitted |
| revision_count | integer | YES | 0 | Count of revision |
| status | text | YES | 'pending'::text | Current status |
| graded_by | uuid | YES | - | Graded By |
| graded_at | timestamp with time zone | YES | - | Timestamp for graded |
| grade | numeric | YES | - | Grade |
| feedback | text | YES | - | Feedback |
| rubric_scores | jsonb | YES | - | Rubric Scores |
| peer_review_count | integer | YES | 0 | Count of peer review |
| avg_peer_rating | numeric | YES | - | Avg Peer Rating |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| course_id | courses.id | capstone_submissions_course_id_fkey |
| enrollment_id | student_enrollments.id | capstone_submissions_enrollment_id_fkey |
| graded_by | user_profiles.id | capstone_submissions_graded_by_fkey |
| user_id | user_profiles.id | capstone_submissions_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| capstone_submissions_pkey | `CREATE UNIQUE INDEX capstone_submissions_pkey ON public.capstone_submissions USING btree (id)` |
| capstone_submissions_enrollment_id_revision_count_key | `CREATE UNIQUE INDEX capstone_submissions_enrollment_id_revision_count_key ON public.capstone_submissions USING btree (enrollment_id, revision_count)` |
| idx_capstone_submissions_user | `CREATE INDEX idx_capstone_submissions_user ON public.capstone_submissions USING btree (user_id)` |
| idx_capstone_submissions_enrollment | `CREATE INDEX idx_capstone_submissions_enrollment ON public.capstone_submissions USING btree (enrollment_id)` |
| idx_capstone_submissions_course | `CREATE INDEX idx_capstone_submissions_course ON public.capstone_submissions USING btree (course_id)` |
| idx_capstone_submissions_status | `CREATE INDEX idx_capstone_submissions_status ON public.capstone_submissions USING btree (status)` |
| idx_capstone_submissions_grader | `CREATE INDEX idx_capstone_submissions_grader ON public.capstone_submissions USING btree (graded_by)` |
