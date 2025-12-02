# student_enrollments Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `student_enrollments` |
| Schema | `public` |
| Purpose | Tracks student enrollments in individual courses |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| course_id | uuid | NO | - | Reference to course |
| status | text | NO | 'pending'::text | Current status |
| enrolled_at | timestamp with time zone | YES | now() | Timestamp for enrolled |
| starts_at | timestamp with time zone | YES | - | Timestamp for starts |
| expires_at | timestamp with time zone | YES | - | Timestamp for expires |
| completed_at | timestamp with time zone | YES | - | Timestamp for completed |
| dropped_at | timestamp with time zone | YES | - | Timestamp for dropped |
| payment_id | text | YES | - | Foreign key reference to payment |
| payment_amount | numeric | YES | - | Payment Amount |
| payment_type | text | YES | - | Payment Type |
| current_module_id | uuid | YES | - | Foreign key reference to current module |
| current_topic_id | uuid | YES | - | Foreign key reference to current topic |
| completion_percentage | integer | YES | 0 | Completion Percentage |
| enrollment_source | text | YES | - | Enrollment Source |
| notes | text | YES | - | Notes |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| is_at_risk | boolean | YES | false | Boolean flag: at risk |
| at_risk_since | timestamp with time zone | YES | - | At Risk Since |
| risk_level | text | YES | - | Risk Level |
| risk_reasons | ARRAY | YES | - | Risk Reasons |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| course_id | courses.id | student_enrollments_course_id_fkey |
| current_module_id | course_modules.id | student_enrollments_current_module_id_fkey |
| current_topic_id | module_topics.id | student_enrollments_current_topic_id_fkey |
| user_id | user_profiles.id | student_enrollments_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| student_enrollments_pkey | `CREATE UNIQUE INDEX student_enrollments_pkey ON public.student_enrollments USING btree (id)` |
| unique_user_course_enrollment | `CREATE UNIQUE INDEX unique_user_course_enrollment ON public.student_enrollments USING btree (user_id, course_id)` |
| idx_enrollments_user_id | `CREATE INDEX idx_enrollments_user_id ON public.student_enrollments USING btree (user_id)` |
| idx_enrollments_course_id | `CREATE INDEX idx_enrollments_course_id ON public.student_enrollments USING btree (course_id)` |
| idx_enrollments_status | `CREATE INDEX idx_enrollments_status ON public.student_enrollments USING btree (status)` |
| idx_enrollments_active | `CREATE INDEX idx_enrollments_active ON public.student_enrollments USING btree (user_id, status) WHERE (status = 'active'::text)` |
| idx_enrollments_payment | `CREATE INDEX idx_enrollments_payment ON public.student_enrollments USING btree (payment_id) WHERE (payment_id IS NOT NULL)` |
| idx_student_enrollments_enrolled_month | `CREATE INDEX idx_student_enrollments_enrolled_month ON public.student_enrollments USING btree (course_id, enrolled_at)` |
| idx_student_enrollments_at_risk | `CREATE INDEX idx_student_enrollments_at_risk ON public.student_enrollments USING btree (is_at_risk, risk_level) WHERE (is_at_risk = true)` |
