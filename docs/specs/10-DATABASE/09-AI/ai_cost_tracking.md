# ai_cost_tracking Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_cost_tracking` |
| Schema | `public` |
| Purpose | Detailed cost tracking for AI API usage across providers, models, and users for budget management and optimization |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the cost entry |
| org_id | uuid | NO | - | Organization incurring the cost |
| user_id | uuid | YES | - | User who triggered the AI call (nullable for system calls) |
| provider | text | NO | - | AI provider (e.g., 'openai', 'anthropic', 'google') |
| model | text | NO | - | Specific model used (e.g., 'gpt-4o-mini', 'claude-3-sonnet') |
| input_tokens | integer | NO | 0 | Number of input tokens consumed |
| output_tokens | integer | NO | 0 | Number of output tokens generated |
| cost_usd | numeric | NO | 0.00 | Total cost in USD for this API call |
| latency_ms | integer | NO | 0 | API response time in milliseconds |
| metadata | jsonb | NO | '{}'::jsonb | Additional context about the API call |
| created_at | timestamp with time zone | NO | now() | Timestamp of the API call |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | - |
| user_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_cost_tracking_pkey | CREATE UNIQUE INDEX ai_cost_tracking_pkey ON public.ai_cost_tracking USING btree (id) |
| idx_ai_cost_tracking_org_date | CREATE INDEX idx_ai_cost_tracking_org_date ON public.ai_cost_tracking USING btree (org_id, created_at DESC) |
| idx_ai_cost_tracking_user | CREATE INDEX idx_ai_cost_tracking_user ON public.ai_cost_tracking USING btree (user_id) |
| idx_ai_cost_tracking_provider | CREATE INDEX idx_ai_cost_tracking_provider ON public.ai_cost_tracking USING btree (provider) |
| idx_ai_cost_tracking_model | CREATE INDEX idx_ai_cost_tracking_model ON public.ai_cost_tracking USING btree (model) |
| idx_ai_cost_tracking_date | CREATE INDEX idx_ai_cost_tracking_date ON public.ai_cost_tracking USING btree (created_at DESC) |

## Usage Notes

- Tracks costs at the individual API call level for granular analysis
- Separate input/output token tracking for accurate cost attribution
- Enables cost analysis by organization, user, provider, and model
- Supports multi-provider AI infrastructure
