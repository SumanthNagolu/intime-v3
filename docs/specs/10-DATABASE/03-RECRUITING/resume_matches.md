# resume_matches Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `resume_matches` |
| Schema | `public` |
| Purpose | AI-powered resume-to-job matching scores |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| requisition_id | uuid | NO | - | Foreign key to requisition |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| match_score | integer | YES | - | Match score |
| reasoning | text | YES | - | Reasoning |
| skills_matched | ARRAY | YES | - | Skills matched |
| skills_missing | ARRAY | YES | - | Skills missing |
| skills_score | integer | YES | - | Skills score |
| experience_score | integer | YES | - | Experience score |
| project_score | integer | YES | - | Project score |
| availability_score | integer | YES | - | Availability score |
| recruiter_feedback | text | YES | - | Recruiter feedback |
| is_relevant | boolean | YES | - | Is relevant |
| submitted | boolean | YES | false | Submitted |
| interview_scheduled | boolean | YES | false | Interview scheduled |
| placement_achieved | boolean | YES | false | Placement achieved |
| model_used | text | YES | - | Model used |
| tokens_used | integer | YES | - | Tokens used |
| cost_usd | numeric | YES | - | Cost usd |
| search_latency_ms | integer | YES | - | Search latency ms |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| resume_matches_pkey | CREATE UNIQUE INDEX resume_matches_pkey ON public.resume_matches USING btree (id) |
| idx_matches_requisition | CREATE INDEX idx_matches_requisition ON public.resume_matches USING btree (requisition_id, match_score DESC) |
| idx_matches_candidate | CREATE INDEX idx_matches_candidate ON public.resume_matches USING btree (candidate_id) |
| idx_matches_org | CREATE INDEX idx_matches_org ON public.resume_matches USING btree (org_id) |
| idx_matches_relevant | CREATE INDEX idx_matches_relevant ON public.resume_matches USING btree (is_relevant) WHERE (is_relevant IS NOT NULL) |
| idx_matches_placement | CREATE INDEX idx_matches_placement ON public.resume_matches USING btree (placement_achieved) WHERE (placement_achieved = true) |
| idx_matches_created | CREATE INDEX idx_matches_created ON public.resume_matches USING btree (org_id, created_at DESC) |
