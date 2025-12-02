# lead_scores Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lead_scores` |
| Schema | `public` |
| Purpose | Detailed scoring factors and metrics for leads |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| lead_id | uuid | NO | NULL | Reference to lead |
| score | integer | NO | `0` | Score |
| factors | jsonb | YES | NULL | Factors |
| budget_score | integer | YES | `0` | Budget score |
| authority_score | integer | YES | `0` | Authority score |
| need_score | integer | YES | `0` | Need score |
| timeline_score | integer | YES | `0` | Timeline score |
| engagement_score | integer | YES | `0` | Engagement score |
| fit_score | integer | YES | `0` | Fit score |
| calculated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Calculated at |
| calculated_by | text | YES | NULL | Calculated by |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| lead_id | leads.id | lead_scores_lead_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| lead_scores_pkey | `CREATE UNIQUE INDEX lead_scores_pkey ON public.lead_scores USING btree (id)` |
| idx_lead_scores_lead_id | `CREATE INDEX idx_lead_scores_lead_id ON public.lead_scores USING btree (lead_id)` |
| idx_lead_scores_score | `CREATE INDEX idx_lead_scores_score ON public.lead_scores USING btree (score)` |
