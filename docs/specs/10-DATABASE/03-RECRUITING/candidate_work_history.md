# candidate_work_history Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_work_history` |
| Schema | `public` |
| Purpose | Employment history and experience for candidates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| company_name | text | NO | - | Company name |
| company_industry | text | YES | - | Company industry |
| company_size | text | YES | - | Company size |
| job_title | text | NO | - | Job title |
| department | text | YES | - | Department |
| employment_type | text | YES | - | Employment type |
| employment_basis | text | YES | - | Employment basis |
| location_city | text | YES | - | Location city |
| location_state | text | YES | - | Location state |
| location_country | text | YES | - | Location country |
| country_code | text | YES | - | Country code |
| is_remote | boolean | YES | false | Is remote |
| remote_type | text | YES | - | Remote type |
| start_date | date | NO | - | Start date |
| end_date | date | YES | - | End date |
| is_current | boolean | YES | false | Is current |
| description | text | YES | - | Description |
| responsibilities | ARRAY | YES | - | Responsibilities |
| achievements | ARRAY | YES | - | Achievements |
| skills_used | ARRAY | YES | - | Skills used |
| tools_used | ARRAY | YES | - | Tools used |
| projects | ARRAY | YES | - | Projects |
| salary_amount | numeric | YES | - | Salary amount |
| salary_currency | text | YES | 'USD'::text | Salary currency |
| salary_type | text | YES | - | Salary type |
| supervisor_name | text | YES | - | Supervisor name |
| supervisor_title | text | YES | - | Supervisor title |
| supervisor_email | text | YES | - | Supervisor email |
| supervisor_phone | text | YES | - | Supervisor phone |
| hr_contact_name | text | YES | - | Hr contact name |
| hr_contact_email | text | YES | - | Hr contact email |
| hr_contact_phone | text | YES | - | Hr contact phone |
| is_verified | boolean | YES | false | Is verified |
| verified_at | timestamp with time zone | YES | - | Verified at |
| verified_by | uuid | YES | - | Verified by |
| verification_method | text | YES | - | Verification method |
| verification_notes | text | YES | - | Verification notes |
| reason_for_leaving | text | YES | - | Reason for leaving |
| is_rehire_eligible | boolean | YES | - | Is rehire eligible |
| rehire_notes | text | YES | - | Rehire notes |
| display_order | integer | YES | 0 | Display order |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record |
| updated_by | uuid | YES | - | Updated by |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_work_history_pkey | CREATE UNIQUE INDEX candidate_work_history_pkey ON public.candidate_work_history USING btree (id) |
| idx_work_history_candidate | CREATE INDEX idx_work_history_candidate ON public.candidate_work_history USING btree (candidate_id) |
| idx_work_history_org | CREATE INDEX idx_work_history_org ON public.candidate_work_history USING btree (org_id) |
