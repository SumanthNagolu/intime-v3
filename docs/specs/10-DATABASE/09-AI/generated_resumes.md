# generated_resumes Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `generated_resumes` |
| Schema | `public` |
| Purpose | Stores AI-generated resumes for candidates/consultants with quality metrics and placement tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the resume |
| org_id | uuid | NO | - | Organization that owns the resume |
| user_id | uuid | NO | - | Candidate/consultant the resume is for |
| target_role | text | NO | - | Target job role for this resume version |
| resume_text | text | NO | - | Generated resume content (text/markdown) |
| resume_pdf_path | text | YES | - | Path to PDF version if generated |
| quality_score | integer | YES | - | AI-assessed quality score (0-100) |
| ats_keywords | text[] | YES | - | ATS-optimized keywords included |
| has_quantified_achievements | boolean | YES | false | Whether resume includes quantified results |
| has_action_verbs | boolean | YES | false | Whether resume uses strong action verbs |
| length_appropriate | boolean | YES | false | Whether resume length is appropriate |
| no_typos | boolean | YES | false | Whether resume passed spell check |
| student_feedback | text | YES | - | Student's feedback on the resume |
| interview_count | integer | YES | 0 | Number of interviews obtained with this resume |
| placement_achieved | boolean | YES | false | Whether student got placed using this resume |
| model_used | text | YES | - | AI model used for generation |
| tokens_used | integer | YES | - | Tokens consumed |
| cost_usd | numeric | YES | - | Generation cost in USD |
| generation_latency_ms | integer | YES | - | Time to generate in milliseconds |
| created_at | timestamp with time zone | YES | now() | When resume was created |
| updated_at | timestamp with time zone | YES | now() | Last modification timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | - |
| user_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| generated_resumes_pkey | CREATE UNIQUE INDEX generated_resumes_pkey ON public.generated_resumes USING btree (id) |
| idx_resumes_user | CREATE INDEX idx_resumes_user ON public.generated_resumes USING btree (user_id, created_at DESC) |
| idx_resumes_org | CREATE INDEX idx_resumes_org ON public.generated_resumes USING btree (org_id) |
| idx_resumes_placement | CREATE INDEX idx_resumes_placement ON public.generated_resumes USING btree (placement_achieved) WHERE (placement_achieved = true) |
| idx_resumes_role | CREATE INDEX idx_resumes_role ON public.generated_resumes USING btree (target_role) |
| idx_resumes_quality | CREATE INDEX idx_resumes_quality ON public.generated_resumes USING btree (quality_score) WHERE (quality_score IS NOT NULL) |

## Usage Notes

- Specialized table for resume generation with quality metrics
- Tracks resume effectiveness via interview_count and placement_achieved
- Quality flags enable automated resume assessment
- Supports multiple resume versions per user for different roles
- ATS keyword array optimizes resume searchability
- Partial indexes optimize queries for successful resumes
