# ai_prompts Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_prompts` |
| Schema | `public` |
| Purpose | Centralized repository for managing versioned AI prompts across different categories and use cases |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the prompt |
| name | text | NO | - | Unique name identifying the prompt |
| version | integer | NO | 1 | Version number for this prompt |
| category | text | NO | - | Category of prompt (e.g., 'mentor', 'resume', 'twin') |
| content | text | NO | - | The actual prompt text/template |
| description | text | YES | - | Human-readable description of prompt purpose |
| variables | jsonb | NO | '[]'::jsonb | List of variables that can be substituted in the prompt |
| is_active | boolean | NO | true | Whether this version is currently active |
| created_by | uuid | YES | - | User who created this prompt |
| created_at | timestamp with time zone | NO | now() | When prompt was created |
| updated_at | timestamp with time zone | NO | now() | Last modification timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| created_by | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_prompts_pkey | CREATE UNIQUE INDEX ai_prompts_pkey ON public.ai_prompts USING btree (id) |
| ai_prompts_name_version_unique | CREATE UNIQUE INDEX ai_prompts_name_version_unique ON public.ai_prompts USING btree (name, version) |
| idx_ai_prompts_name | CREATE INDEX idx_ai_prompts_name ON public.ai_prompts USING btree (name) |
| idx_ai_prompts_category | CREATE INDEX idx_ai_prompts_category ON public.ai_prompts USING btree (category) |
| idx_ai_prompts_active | CREATE INDEX idx_ai_prompts_active ON public.ai_prompts USING btree (is_active) WHERE (is_active = true) |

## Usage Notes

- Supports versioning of prompts via name+version unique constraint
- Variables JSONB stores template placeholders for dynamic prompts
- Partial index on is_active optimizes queries for current prompts
- Enables prompt governance and change tracking
- Category organization supports different AI use cases
