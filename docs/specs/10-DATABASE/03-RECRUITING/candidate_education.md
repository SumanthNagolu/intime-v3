# candidate_education Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_education` |
| Schema | `public` |
| Purpose | Education history and qualifications for candidates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| degree_type | text | YES | - | Degree type |
| degree_name | text | YES | - | Degree name |
| field_of_study | text | YES | - | Field of study |
| minor | text | YES | - | Minor |
| concentration | text | YES | - | Concentration |
| institution_name | text | NO | - | Institution name |
| institution_type | text | YES | - | Institution type |
| institution_city | text | YES | - | Institution city |
| institution_state | text | YES | - | Institution state |
| institution_country | text | YES | - | Institution country |
| country_code | text | YES | - | Country code |
| start_date | date | YES | - | Start date |
| end_date | date | YES | - | End date |
| expected_graduation | date | YES | - | Expected graduation |
| is_current | boolean | YES | false | Is current |
| gpa | numeric | YES | - | Gpa |
| gpa_scale | numeric | YES | 4.0 | Gpa scale |
| class_rank | text | YES | - | Class rank |
| honors | text | YES | - | Honors |
| thesis_title | text | YES | - | Thesis title |
| dissertation_title | text | YES | - | Dissertation title |
| is_verified | boolean | YES | false | Is verified |
| verified_at | timestamp with time zone | YES | - | Verified at |
| verified_by | uuid | YES | - | Verified by |
| verification_method | text | YES | - | Verification method |
| verification_notes | text | YES | - | Verification notes |
| transcript_file_id | uuid | YES | - | Foreign key to transcript_file |
| diploma_file_id | uuid | YES | - | Foreign key to diploma_file |
| display_order | integer | YES | 0 | Display order |
| is_highest_degree | boolean | YES | false | Is highest degree |
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
| candidate_education_pkey | CREATE UNIQUE INDEX candidate_education_pkey ON public.candidate_education USING btree (id) |
| idx_education_candidate | CREATE INDEX idx_education_candidate ON public.candidate_education USING btree (candidate_id) |
| idx_education_org | CREATE INDEX idx_education_org ON public.candidate_education USING btree (org_id) |
