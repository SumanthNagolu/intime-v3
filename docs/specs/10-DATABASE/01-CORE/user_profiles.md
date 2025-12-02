# user_profiles Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `user_profiles` |
| Schema | `public` |
| Purpose | Universal user profile table supporting multiple personas (student, employee, candidate, client, recruiter) with role-specific attributes |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key |
| auth_id | uuid | YES | - | Reference to auth.users (Supabase Auth) |
| email | text | NO | - | User email address (unique) |
| full_name | text | NO | - | User's full name |
| avatar_url | text | YES | - | Profile picture URL |
| phone | text | YES | - | Primary phone number |
| timezone | text | YES | 'America/New_York' | User's timezone |
| locale | text | YES | 'en-US' | User's locale preference |
| **Student Fields** | | | | |
| student_enrollment_date | timestamp with time zone | YES | - | Academy enrollment date |
| student_course_id | uuid | YES | - | Current course ID |
| student_current_module | text | YES | - | Current module in course |
| student_course_progress | jsonb | YES | '{}' | Course progress tracking |
| student_graduation_date | timestamp with time zone | YES | - | Graduation date |
| student_certificates | jsonb | YES | '[]' | Earned certificates |
| **Employee Fields** | | | | |
| employee_hire_date | timestamp with time zone | YES | - | Hire date |
| employee_department | text | YES | - | Department |
| employee_position | text | YES | - | Job position |
| employee_salary | numeric | YES | - | Salary amount |
| employee_status | text | YES | - | Employment status |
| employee_manager_id | uuid | YES | - | Manager's user_profiles.id |
| employee_performance_rating | numeric | YES | - | Performance rating |
| employee_role | text | YES | - | Employee role type |
| **Candidate Fields** | | | | |
| candidate_status | text | YES | - | Candidate pipeline status |
| candidate_resume_url | text | YES | - | Resume document URL |
| candidate_skills | ARRAY | YES | - | Array of skill names |
| candidate_experience_years | integer | YES | - | Years of experience |
| candidate_current_visa | text | YES | - | Current visa status |
| candidate_visa_expiry | timestamp with time zone | YES | - | Visa expiration date |
| candidate_hourly_rate | numeric | YES | - | Desired hourly rate |
| candidate_bench_start_date | timestamp with time zone | YES | - | Bench availability start |
| candidate_availability | text | YES | - | Availability status |
| candidate_location | text | YES | - | Current location |
| candidate_willing_to_relocate | boolean | YES | false | Relocation preference |
| **Client Fields** | | | | |
| client_company_name | text | YES | - | Client company name |
| client_industry | text | YES | - | Client industry |
| client_tier | text | YES | - | Client tier (A/B/C) |
| client_contract_start_date | timestamp with time zone | YES | - | Contract start date |
| client_contract_end_date | timestamp with time zone | YES | - | Contract end date |
| client_payment_terms | integer | YES | 30 | Payment terms in days |
| client_preferred_markup_percentage | numeric | YES | - | Preferred markup % |
| **Recruiter Fields** | | | | |
| recruiter_territory | text | YES | - | Assigned territory |
| recruiter_specialization | ARRAY | YES | - | Recruiting specializations |
| recruiter_monthly_placement_target | integer | YES | 2 | Monthly placement target |
| recruiter_pod_id | uuid | YES | - | Assigned pod/team |
| **Audit Fields** | | | | |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | Created by user_profiles.id |
| updated_by | uuid | YES | - | Updated by user_profiles.id |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |
| is_active | boolean | YES | true | Active status |
| search_vector | tsvector | YES | - | Full-text search vector |
| org_id | uuid | NO | - | Organization ID (multi-tenant) |
| leaderboard_visible | boolean | YES | true | Show on Academy leaderboard |
| **Contact Details** | | | | |
| first_name | text | YES | - | First name |
| last_name | text | YES | - | Last name |
| middle_name | text | YES | - | Middle name |
| preferred_name | text | YES | - | Preferred name |
| date_of_birth | date | YES | - | Date of birth |
| gender | text | YES | - | Gender |
| nationality | text | YES | - | Nationality |
| email_secondary | text | YES | - | Secondary email |
| phone_home | text | YES | - | Home phone |
| phone_work | text | YES | - | Work phone |
| preferred_contact_method | text | YES | - | Preferred contact method |
| preferred_call_time | text | YES | - | Preferred call time |
| do_not_contact | boolean | YES | false | Do not contact flag |
| do_not_email | boolean | YES | false | Do not email flag |
| do_not_text | boolean | YES | false | Do not text flag |
| **Social Links** | | | | |
| linkedin_url | text | YES | - | LinkedIn profile URL |
| github_url | text | YES | - | GitHub profile URL |
| portfolio_url | text | YES | - | Portfolio website URL |
| personal_website | text | YES | - | Personal website URL |
| **Emergency Contact** | | | | |
| emergency_contact_name | text | YES | - | Emergency contact name |
| emergency_contact_relationship | text | YES | - | Emergency contact relationship |
| emergency_contact_phone | text | YES | - | Emergency contact phone |
| emergency_contact_email | text | YES | - | Emergency contact email |
| **Marketing/Sourcing** | | | | |
| lead_source | text | YES | - | Lead source |
| lead_source_detail | text | YES | - | Lead source details |
| marketing_status | text | YES | - | Marketing campaign status |
| is_on_hotlist | boolean | YES | false | On bench hotlist |
| hotlist_added_at | timestamp with time zone | YES | - | Hotlist add timestamp |
| hotlist_added_by | uuid | YES | - | Hotlist added by user |
| hotlist_notes | text | YES | - | Hotlist notes |
| **Employment Preferences** | | | | |
| current_employment_status | text | YES | - | Current employment status |
| notice_period_days | integer | YES | - | Notice period in days |
| earliest_start_date | date | YES | - | Earliest start date |
| preferred_employment_type | ARRAY | YES | - | Preferred employment types |
| preferred_locations | ARRAY | YES | - | Preferred work locations |
| relocation_assistance_required | boolean | YES | false | Relocation assistance needed |
| relocation_notes | text | YES | - | Relocation notes |
| **Compensation** | | | | |
| desired_salary_annual | numeric | YES | - | Desired annual salary |
| desired_salary_currency | text | YES | 'USD' | Salary currency |
| minimum_hourly_rate | numeric | YES | - | Minimum hourly rate |
| minimum_annual_salary | numeric | YES | - | Minimum annual salary |
| benefits_required | ARRAY | YES | - | Required benefits |
| compensation_notes | text | YES | - | Compensation notes |
| **Professional** | | | | |
| languages | jsonb | YES | '[]' | Spoken languages |
| recruiter_rating | integer | YES | - | Recruiter rating (1-5) |
| recruiter_rating_notes | text | YES | - | Rating notes |
| profile_completeness_score | integer | YES | 0 | Profile completion % |
| last_profile_update | timestamp with time zone | YES | - | Last profile update |
| last_activity_date | timestamp with time zone | YES | - | Last activity timestamp |
| last_contacted_at | timestamp with time zone | YES | - | Last contacted timestamp |
| last_contacted_by | uuid | YES | - | Last contacted by user |
| professional_headline | text | YES | - | Professional headline |
| professional_summary | text | YES | - | Professional summary |
| career_objectives | text | YES | - | Career objectives |
| **Classification** | | | | |
| tags | ARRAY | YES | - | Classification tags |
| categories | ARRAY | YES | - | Category classifications |
| **Billing** | | | | |
| stripe_customer_id | text | YES | - | Stripe customer ID |
| title | text | YES | - | Professional title |
| total_placements | integer | YES | 0 | Total successful placements |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| user_profiles_pkey | CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id) |
| user_profiles_auth_id_key | CREATE UNIQUE INDEX user_profiles_auth_id_key ON public.user_profiles USING btree (auth_id) |
| user_profiles_email_key | CREATE UNIQUE INDEX user_profiles_email_key ON public.user_profiles USING btree (email) |
| idx_user_profiles_email | CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email) WHERE (deleted_at IS NULL) |
| idx_user_profiles_auth_id | CREATE INDEX idx_user_profiles_auth_id ON public.user_profiles USING btree (auth_id) WHERE (deleted_at IS NULL) |
| idx_user_profiles_active | CREATE INDEX idx_user_profiles_active ON public.user_profiles USING btree (is_active) WHERE (deleted_at IS NULL) |
| idx_user_profiles_candidate_status | CREATE INDEX idx_user_profiles_candidate_status ON public.user_profiles USING btree (candidate_status) WHERE ((candidate_status IS NOT NULL) AND (deleted_at IS NULL)) |
| idx_user_profiles_employee_department | CREATE INDEX idx_user_profiles_employee_department ON public.user_profiles USING btree (employee_department) WHERE ((employee_department IS NOT NULL) AND (deleted_at IS NULL)) |
| idx_user_profiles_client_tier | CREATE INDEX idx_user_profiles_client_tier ON public.user_profiles USING btree (client_tier) WHERE ((client_tier IS NOT NULL) AND (deleted_at IS NULL)) |
| idx_user_profiles_candidate_skills | CREATE INDEX idx_user_profiles_candidate_skills ON public.user_profiles USING gin (candidate_skills) WHERE ((candidate_skills IS NOT NULL) AND (deleted_at IS NULL)) |
| idx_user_profiles_search | CREATE INDEX idx_user_profiles_search ON public.user_profiles USING gin (search_vector) |
| idx_user_profiles_created_at | CREATE INDEX idx_user_profiles_created_at ON public.user_profiles USING btree (created_at DESC) |
| idx_user_profiles_updated_at | CREATE INDEX idx_user_profiles_updated_at ON public.user_profiles USING btree (updated_at DESC) |
| idx_user_profiles_not_deleted | CREATE INDEX idx_user_profiles_not_deleted ON public.user_profiles USING btree (id) WHERE (deleted_at IS NULL) |
| idx_user_profiles_org_id | CREATE INDEX idx_user_profiles_org_id ON public.user_profiles USING btree (org_id) |
| idx_user_profiles_org_id_active | CREATE INDEX idx_user_profiles_org_id_active ON public.user_profiles USING btree (org_id) WHERE (deleted_at IS NULL) |
| idx_user_profiles_leaderboard_visible | CREATE INDEX idx_user_profiles_leaderboard_visible ON public.user_profiles USING btree (leaderboard_visible) WHERE (leaderboard_visible = true) |
| idx_user_profiles_employee_role | CREATE INDEX idx_user_profiles_employee_role ON public.user_profiles USING btree (employee_role) WHERE (deleted_at IS NULL) |
| idx_user_profiles_stripe_customer | CREATE INDEX idx_user_profiles_stripe_customer ON public.user_profiles USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL) |
| idx_user_profiles_org | CREATE INDEX idx_user_profiles_org ON public.user_profiles USING btree (org_id) |
| idx_user_profiles_auth | CREATE INDEX idx_user_profiles_auth ON public.user_profiles USING btree (auth_id) |
| idx_user_profiles_auth_lookup | CREATE INDEX idx_user_profiles_auth_lookup ON public.user_profiles USING btree (auth_id, org_id, email) WHERE ((deleted_at IS NULL) AND (is_active = true)) |

## Business Rules

1. **Multi-Persona Support**: Single table supports student, employee, candidate, client, and recruiter personas
2. **Null-Safe Design**: Persona-specific fields are nullable; only populate for relevant user types
3. **Auth Integration**: Links to Supabase Auth via auth_id
4. **Full-Text Search**: search_vector enables fast text search across profiles
5. **Soft Deletes**: Uses deleted_at for soft deletion
6. **Multi-Tenant**: All records scoped to org_id
7. **Contact Preferences**: Respects do_not_contact, do_not_email, do_not_text flags
8. **Hotlist Management**: Tracks bench candidates via is_on_hotlist flags
9. **Profile Quality**: profile_completeness_score drives quality metrics
10. **Activity Tracking**: last_activity_date and last_contacted_at for engagement scoring
