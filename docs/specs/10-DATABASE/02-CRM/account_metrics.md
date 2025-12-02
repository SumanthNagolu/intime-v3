# account_metrics Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `account_metrics` |
| Schema | `public` |
| Purpose | Monthly performance metrics for accounts |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| account_id | uuid | NO | NULL | Reference to account |
| period | text | NO | NULL | Period |
| period_start | timestamp with time zone | NO | NULL | Period start |
| period_end | timestamp with time zone | NO | NULL | Period end |
| total_placements | integer | YES | `0` | Total placements |
| active_placements | integer | YES | `0` | Active placements |
| ended_placements | integer | YES | `0` | Ended placements |
| total_revenue | numeric | YES | `0` | Total revenue |
| total_margin | numeric | YES | `0` | Total margin |
| avg_ttf_days | numeric | YES | NULL | Avg ttf days |
| submission_to_interview_rate | numeric | YES | NULL | Submission to interview rate |
| interview_to_offer_rate | numeric | YES | NULL | Interview to offer rate |
| offer_acceptance_rate | numeric | YES | NULL | Offer acceptance rate |
| total_submissions | integer | YES | `0` | Total submissions |
| total_interviews | integer | YES | `0` | Total interviews |
| total_offers | integer | YES | `0` | Total offers |
| health_score | integer | YES | NULL | Health score |
| calculated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Calculated at |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| account_id | accounts.id | account_metrics_account_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| account_metrics_pkey | `CREATE UNIQUE INDEX account_metrics_pkey ON public.account_metrics USING btree (id)` |
| idx_account_metrics_account_id | `CREATE INDEX idx_account_metrics_account_id ON public.account_metrics USING btree (account_id)` |
| idx_account_metrics_period | `CREATE INDEX idx_account_metrics_period ON public.account_metrics USING btree (period)` |
| idx_account_metrics_account_period | `CREATE INDEX idx_account_metrics_account_period ON public.account_metrics USING btree (account_id, period)` |
