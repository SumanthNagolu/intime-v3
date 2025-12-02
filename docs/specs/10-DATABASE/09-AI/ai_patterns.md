# ai_patterns Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_patterns` |
| Schema | `public` |
| Purpose | Detects and tracks behavioral patterns in user interactions with AI systems for personalization and insights |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | text | NO | - | Primary key, unique identifier for the pattern |
| user_id | uuid | NO | - | User exhibiting the pattern |
| pattern_type | text | NO | - | Type of pattern (e.g., 'learning_style', 'question_frequency', 'topic_preference') |
| description | text | NO | - | Human-readable description of the pattern |
| occurrence_count | integer | NO | 1 | Number of times this pattern has been observed |
| first_seen | timestamp with time zone | NO | now() | When pattern was first detected |
| last_seen | timestamp with time zone | NO | now() | Most recent occurrence of the pattern |
| metadata | jsonb | NO | '{}'::jsonb | Additional pattern data and context |
| created_at | timestamp with time zone | NO | now() | Timestamp when pattern was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp of last update |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_patterns_pkey | CREATE UNIQUE INDEX ai_patterns_pkey ON public.ai_patterns USING btree (id) |
| idx_ai_patterns_user_id | CREATE INDEX idx_ai_patterns_user_id ON public.ai_patterns USING btree (user_id) |
| idx_ai_patterns_type | CREATE INDEX idx_ai_patterns_type ON public.ai_patterns USING btree (pattern_type) |
| idx_ai_patterns_last_seen | CREATE INDEX idx_ai_patterns_last_seen ON public.ai_patterns USING btree (last_seen DESC) |

## Usage Notes

- Enables AI personalization based on detected user behaviors
- Occurrence count tracks pattern strength/consistency
- First_seen and last_seen track pattern timeline
- Supports multiple pattern types for different use cases
