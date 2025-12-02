# ai_prompt_variants Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_prompt_variants` |
| Schema | `public` |
| Purpose | Manages different prompt variations for A/B testing AI responses and optimizing prompt engineering |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the variant |
| variant_name | text | NO | - | Unique name for the variant |
| system_prompt | text | NO | - | The system prompt text for this variant |
| is_active | boolean | YES | false | Whether this variant is currently being tested |
| traffic_percentage | integer | YES | 0 | Percentage of requests routed to this variant (0-100) |
| total_uses | integer | YES | 0 | Total number of times this variant has been used |
| avg_rating | numeric | YES | - | Running average rating for this variant |
| avg_response_time_ms | integer | YES | - | Average response time in milliseconds |
| avg_tokens_used | integer | YES | - | Average tokens consumed per use |
| escalation_count | integer | YES | 0 | Number of escalations triggered with this variant |
| created_at | timestamp with time zone | YES | now() | When variant was created |
| deactivated_at | timestamp with time zone | YES | - | When variant was deactivated (if applicable) |

## Foreign Keys

None

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_prompt_variants_pkey | CREATE UNIQUE INDEX ai_prompt_variants_pkey ON public.ai_prompt_variants USING btree (id) |
| ai_prompt_variants_variant_name_key | CREATE UNIQUE INDEX ai_prompt_variants_variant_name_key ON public.ai_prompt_variants USING btree (variant_name) |

## Usage Notes

- Supports A/B testing of different system prompts
- Traffic_percentage enables gradual rollout of new prompts
- Tracks performance metrics to determine winning variants
- Unique constraint on variant_name prevents duplicates
- Deactivated_at tracks variant lifecycle
