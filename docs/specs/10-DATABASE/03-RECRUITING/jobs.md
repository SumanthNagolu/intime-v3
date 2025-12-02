# jobs Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `jobs` |
| Schema | `public` |
| Purpose | Core job/requisition table for the ATS system. Stores job postings with details about position requirements, rates, status, and assignments. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| account_id | uuid | YES | - | Associated client account (foreign key to accounts) |
| deal_id | uuid | YES | - | Associated CRM deal (foreign key to deals) |
| client_id | uuid | YES | - | Client account ID (foreign key to accounts) |
| title | text | NO | - | Job title/position name |
| description | text | YES | - | Detailed job description |
| job_type | text | YES | 'contract' | Type of employment (contract, full-time, etc.) |
| location | text | YES | - | Job location |
| is_remote | boolean | YES | false | Whether job is remote |
| hybrid_days | integer | YES | - | Number of days on-site for hybrid positions |
| rate_min | numeric | YES | - | Minimum pay rate |
| rate_max | numeric | YES | - | Maximum pay rate |
| rate_type | text | YES | 'hourly' | Rate period (hourly, annual, etc.) |
| currency | text | YES | 'USD' | Currency for rates |
| status | text | NO | 'draft' | Job status (draft, open, closed, etc.) |
| urgency | text | YES | 'medium' | Urgency level |
| priority | text | YES | 'medium' | Priority level |
| positions_count | integer | YES | 1 | Total number of positions to fill |
| positions_filled | integer | YES | 0 | Number of positions already filled |
| required_skills | ARRAY | YES | - | Array of required skills |
| nice_to_have_skills | ARRAY | YES | - | Array of preferred but optional skills |
| min_experience_years | integer | YES | - | Minimum years of experience required |
| max_experience_years | integer | YES | - | Maximum years of experience |
| visa_requirements | ARRAY | YES | - | Array of acceptable visa types |
| owner_id | uuid | NO | - | Job owner/hiring manager (foreign key to user_profiles) |
| recruiter_ids | ARRAY | YES | - | Array of assigned recruiter IDs |
| posted_date | date | YES | - | Date job was posted |
| target_fill_date | date | YES | - | Target date to fill position |
| target_start_date | timestamp with time zone | YES | - | Target start date for candidate |
| filled_date | date | YES | - | Date position was filled |
| client_submission_instructions | text | YES | - | Instructions for submitting candidates to client |
| client_interview_process | text | YES | - | Description of client's interview process |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record (foreign key to user_profiles) |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |
| search_vector | tsvector | YES | - | Full-text search vector |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| account_id | accounts.id | Client account |
| client_id | accounts.id | Client account (alternate) |
| created_by | user_profiles.id | Creator user |
| deal_id | deals.id | Associated CRM deal |
| org_id | organizations.id | Organization |
| owner_id | user_profiles.id | Job owner |

## Indexes

| Index Name | Definition |
|------------|------------|
| jobs_pkey | CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id) |
| idx_jobs_org | CREATE INDEX idx_jobs_org ON public.jobs USING btree (org_id) WHERE (deleted_at IS NULL) |
| idx_jobs_account | CREATE INDEX idx_jobs_account ON public.jobs USING btree (account_id) WHERE (deleted_at IS NULL) |
| idx_jobs_deal | CREATE INDEX idx_jobs_deal ON public.jobs USING btree (deal_id) |
| idx_jobs_status | CREATE INDEX idx_jobs_status ON public.jobs USING btree (status) WHERE (deleted_at IS NULL) |
| idx_jobs_owner | CREATE INDEX idx_jobs_owner ON public.jobs USING btree (owner_id) |
| idx_jobs_search | CREATE INDEX idx_jobs_search ON public.jobs USING gin (search_vector) |
| idx_jobs_posted_date | CREATE INDEX idx_jobs_posted_date ON public.jobs USING btree (posted_date DESC) |
