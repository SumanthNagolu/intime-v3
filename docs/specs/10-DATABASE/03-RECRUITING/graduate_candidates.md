# graduate_candidates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `graduate_candidates` |
| Schema | `public` |
| Purpose | Special tracking for academy graduates entering recruiting pipeline |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | Foreign key to user |
| enrollment_id | uuid | NO | - | Foreign key to enrollment |
| graduated_at | timestamp with time zone | NO | - | Graduated at |
| course_id | uuid | YES | - | Foreign key to course |
| final_grade | text | YES | - | Final grade |
| gpa_equivalent | integer | YES | - | Gpa equivalent |
| project_score | integer | YES | - | Project score |
| assessment_score | integer | YES | - | Assessment score |
| job_readiness_score | integer | YES | - | Job readiness score |
| technical_skills_score | integer | YES | - | Technical skills score |
| soft_skills_score | integer | YES | - | Soft skills score |
| status | USER-DEFINED | NO | 'pending_review'::graduate_candidate_status | Status |
| status_changed_at | timestamp with time zone | YES | - | Status changed at |
| status_changed_by | uuid | YES | - | Status changed by |
| assigned_recruiter_id | uuid | YES | - | Foreign key to assigned_recruiter |
| assigned_at | timestamp with time zone | YES | - | Assigned at |
| bench_candidate_id | uuid | YES | - | Foreign key to bench_candidate |
| recruiter_notes | text | YES | - | Recruiter notes |
| opt_out_reason | text | YES | - | Opt out reason |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| assigned_recruiter_id | user_profiles.id | User profiles |
| course_id | courses.id | Courses |
| enrollment_id | student_enrollments.id | Student enrollments |
| status_changed_by | user_profiles.id | User profiles |
| user_id | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| graduate_candidates_pkey | CREATE UNIQUE INDEX graduate_candidates_pkey ON public.graduate_candidates USING btree (id) |
| idx_graduate_candidates_user | CREATE INDEX idx_graduate_candidates_user ON public.graduate_candidates USING btree (user_id) |
| idx_graduate_candidates_enrollment | CREATE INDEX idx_graduate_candidates_enrollment ON public.graduate_candidates USING btree (enrollment_id) |
| idx_graduate_candidates_status | CREATE INDEX idx_graduate_candidates_status ON public.graduate_candidates USING btree (status) |
| idx_graduate_candidates_pending | CREATE INDEX idx_graduate_candidates_pending ON public.graduate_candidates USING btree (assigned_recruiter_id) WHERE (status = 'pending_review'::graduate_candidate_status) |
| idx_graduate_candidates_recruiter | CREATE INDEX idx_graduate_candidates_recruiter ON public.graduate_candidates USING btree (assigned_recruiter_id) |
