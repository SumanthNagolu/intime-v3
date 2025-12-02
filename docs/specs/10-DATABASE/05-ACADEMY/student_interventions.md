# student_interventions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `student_interventions` |
| Schema | `public` |
| Purpose | Automated or manual interventions triggered by student performance patterns |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| student_id | uuid | NO | - | Reference to student user |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| course_id | uuid | NO | - | Reference to course |
| risk_level | text | NO | - | Risk Level |
| risk_reasons | ARRAY | NO | - | Risk Reasons |
| intervention_type | text | YES | - | Intervention Type |
| assigned_trainer_id | uuid | YES | - | Foreign key reference to assigned trainer |
| assigned_at | timestamp with time zone | YES | - | Timestamp for assigned |
| status | text | NO | 'pending'::text | Current status |
| notes | text | YES | - | Notes |
| trainer_notes | text | YES | - | Trainer Notes |
| resolution_notes | text | YES | - | Resolution Notes |
| outcome | text | YES | - | Outcome |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| resolved_at | timestamp with time zone | YES | - | Timestamp for resolved |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp (null if active) |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| assigned_trainer_id | user_profiles.id | student_interventions_assigned_trainer_id_fkey |
| course_id | courses.id | student_interventions_course_id_fkey |
| enrollment_id | student_enrollments.id | student_interventions_enrollment_id_fkey |
| student_id | user_profiles.id | student_interventions_student_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| student_interventions_pkey | `CREATE UNIQUE INDEX student_interventions_pkey ON public.student_interventions USING btree (id)` |
| idx_student_interventions_student | `CREATE INDEX idx_student_interventions_student ON public.student_interventions USING btree (student_id) WHERE (deleted_at IS NULL)` |
| idx_student_interventions_enrollment | `CREATE INDEX idx_student_interventions_enrollment ON public.student_interventions USING btree (enrollment_id) WHERE (deleted_at IS NULL)` |
| idx_student_interventions_trainer | `CREATE INDEX idx_student_interventions_trainer ON public.student_interventions USING btree (assigned_trainer_id) WHERE ((deleted_at IS NULL) AND (status = ANY (ARRAY['pending'::text, 'in_progress'::text])))` |
| idx_student_interventions_status | `CREATE INDEX idx_student_interventions_status ON public.student_interventions USING btree (status) WHERE (deleted_at IS NULL)` |
| idx_student_interventions_created | `CREATE INDEX idx_student_interventions_created ON public.student_interventions USING btree (created_at DESC) WHERE (deleted_at IS NULL)` |
