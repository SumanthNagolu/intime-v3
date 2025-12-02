# V Active Users View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_active_users` |
| Schema | `public` |
| Purpose | Consolidated view of all active user profiles with student, employee, candidate, client, and recruiter attributes |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| auth_id | uuid | YES | Authentication system user ID |
| email | text | YES | User email address |
| full_name | text | YES | User full name |
| avatar_url | text | YES | Profile avatar image URL |
| phone | text | YES | Contact phone number |
| timezone | text | YES | User timezone preference |
| locale | text | YES | User locale/language preference |
| student_enrollment_date | timestamptz | YES | student enrollment date |
| student_course_id | uuid | YES | student course id |
| student_current_module | text | YES | student current module |
| student_course_progress | jsonb | YES | student course progress |
| student_graduation_date | timestamptz | YES | student graduation date |
| student_certificates | jsonb | YES | student certificates |
| employee_hire_date | timestamptz | YES | employee hire date |
| employee_department | text | YES | employee department |
| employee_position | text | YES | employee position |
| employee_salary | numeric | YES | employee salary |
| employee_status | text | YES | employee status |
| employee_manager_id | uuid | YES | employee manager id |
| employee_performance_rating | numeric | YES | employee performance rating |
| candidate_status | text | YES | candidate status |
| candidate_resume_url | text | YES | candidate resume url |
| candidate_skills | ARRAY | YES | candidate skills |
| candidate_experience_years | integer | YES | candidate experience years |
| candidate_current_visa | text | YES | candidate current visa |
| candidate_visa_expiry | timestamptz | YES | candidate visa expiry |
| candidate_hourly_rate | numeric | YES | candidate hourly rate |
| candidate_bench_start_date | timestamptz | YES | candidate bench start date |
| candidate_availability | text | YES | candidate availability |
| candidate_location | text | YES | candidate location |
| candidate_willing_to_relocate | boolean | YES | candidate willing to relocate |
| client_company_name | text | YES | client company name |
| client_industry | text | YES | client industry |
| client_tier | text | YES | client tier |
| client_contract_start_date | timestamptz | YES | client contract start date |
| client_contract_end_date | timestamptz | YES | client contract end date |
| client_payment_terms | integer | YES | client payment terms |
| client_preferred_markup_percentage | numeric | YES | client preferred markup percentage |
| recruiter_territory | text | YES | recruiter territory |
| recruiter_specialization | ARRAY | YES | recruiter specialization |
| recruiter_monthly_placement_target | integer | YES | recruiter monthly placement target |
| recruiter_pod_id | uuid | YES | recruiter pod id |
| created_at | timestamptz | YES | Record creation timestamp |
| updated_at | timestamptz | YES | Record last update timestamp |
| created_by | uuid | YES | User who created the record |
| updated_by | uuid | YES | User who last updated the record |
| deleted_at | timestamptz | YES | Soft delete timestamp |
| is_active | boolean | YES | Active status flag |
| search_vector | tsvector | YES | Full-text search vector |

## Definition

```sql
CREATE OR REPLACE VIEW v_active_users AS
 SELECT id,
    auth_id,
    email,
    full_name,
    avatar_url,
    phone,
    timezone,
    locale,
    student_enrollment_date,
    student_course_id,
    student_current_module,
    student_course_progress,
    student_graduation_date,
    student_certificates,
    employee_hire_date,
    employee_department,
    employee_position,
    employee_salary,
    employee_status,
    employee_manager_id,
    employee_performance_rating,
    candidate_status,
    candidate_resume_url,
    candidate_skills,
    candidate_experience_years,
    candidate_current_visa,
    candidate_visa_expiry,
    candidate_hourly_rate,
    candidate_bench_start_date,
    candidate_availability,
    candidate_location,
    candidate_willing_to_relocate,
    client_company_name,
    client_industry,
    client_tier,
    client_contract_start_date,
    client_contract_end_date,
    client_payment_terms,
    client_preferred_markup_percentage,
    recruiter_territory,
    recruiter_specialization,
    recruiter_monthly_placement_target,
    recruiter_pod_id,
    created_at,
    updated_at,
    created_by,
    updated_by,
    deleted_at,
    is_active,
    search_vector
   FROM user_profiles
  WHERE ((deleted_at IS NULL) AND (is_active = true));
```
