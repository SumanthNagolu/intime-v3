# ai_mentor_rate_limits Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_rate_limits` |
| Schema | `public` |
| Purpose | Tracks and enforces rate limits for AI Mentor usage per user to control costs and prevent abuse |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the rate limit record |
| user_id | uuid | NO | - | User being rate limited |
| hourly_count | integer | NO | 0 | Number of requests in current hour |
| daily_count | integer | NO | 0 | Number of requests in current day |
| monthly_count | integer | NO | 0 | Number of requests in current month |
| hourly_reset_at | timestamp with time zone | NO | (now() + '01:00:00'::interval) | When hourly counter resets |
| daily_reset_at | timestamp with time zone | NO | (now() + '1 day'::interval) | When daily counter resets |
| monthly_reset_at | timestamp with time zone | NO | (now() + '1 mon'::interval) | When monthly counter resets |
| monthly_cost_usd | numeric | YES | 0 | Total cost incurred this month |
| updated_at | timestamp with time zone | YES | now() | Timestamp of last update |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_mentor_rate_limits_pkey | CREATE UNIQUE INDEX ai_mentor_rate_limits_pkey ON public.ai_mentor_rate_limits USING btree (id) |
| ai_mentor_rate_limits_user_id_key | CREATE UNIQUE INDEX ai_mentor_rate_limits_user_id_key ON public.ai_mentor_rate_limits USING btree (user_id) |
| idx_ai_mentor_rate_limits_user_id | CREATE INDEX idx_ai_mentor_rate_limits_user_id ON public.ai_mentor_rate_limits USING btree (user_id) |

## Usage Notes

- One record per user (enforced by unique constraint)
- Supports multiple time window rate limits (hourly, daily, monthly)
- Automatic reset timestamps for sliding window implementation
- Monthly cost tracking for budget enforcement
- Critical for preventing API cost overruns
