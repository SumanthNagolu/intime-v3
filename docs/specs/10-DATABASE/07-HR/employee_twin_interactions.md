# employee_twin_interactions Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_twin_interactions` |
| Schema | `public` |
| Purpose | AI Twin interactions with employee records |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `user_id` | uuid | NO | - | User profile reference |
| `twin_role` | text | NO | - | Twin Role |
| `interaction_type` | text | NO | - | Interaction Type |
| `prompt` | text | YES | - | Prompt |
| `response` | text | NO | - | Response |
| `context` | jsonb | YES | '{}'::jsonb | Context |
| `model_used` | text | YES | 'gpt-4o-mini'::text | Model Used |
| `tokens_used` | integer | YES | - | Tokens Used |
| `cost_usd` | double precision | YES | - | Cost Usd |
| `latency_ms` | integer | YES | - | Latency Ms |
| `was_helpful` | boolean | YES | - | Was Helpful |
| `user_feedback` | text | YES | - | User Feedback |
| `dismissed` | boolean | YES | false | Dismissed |
| `created_at` | timestamptz | YES | now() | Record creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `user_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_twin_interactions_pkey` | `CREATE UNIQUE INDEX employee_twin_interactions_pkey ON public.employee_twin_interactions USING bt...` |
| `idx_employee_twin_interactions_user` | `CREATE INDEX idx_employee_twin_interactions_user ON public.employee_twin_interactions USING btree...` |
| `idx_employee_twin_interactions_type` | `CREATE INDEX idx_employee_twin_interactions_type ON public.employee_twin_interactions USING btree...` |
| `idx_employee_twin_interactions_role` | `CREATE INDEX idx_employee_twin_interactions_role ON public.employee_twin_interactions USING btree...` |

## Usage Notes

- Extends employee data with twin_interactions information
- Linked to employees table via employee_id foreign key
