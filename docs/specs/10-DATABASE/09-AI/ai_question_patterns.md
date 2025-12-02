# ai_question_patterns Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_question_patterns` |
| Schema | `public` |
| Purpose | Detects and aggregates common question patterns to improve AI responses and identify knowledge gaps |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the pattern |
| pattern_hash | text | NO | - | Hash of the normalized question pattern |
| canonical_question | text | NO | - | Representative example of this question pattern |
| category | text | YES | - | Category of the question |
| topic_id | uuid | YES | - | Related course topic (if applicable) |
| occurrence_count | integer | YES | 1 | Number of times this pattern has been asked |
| unique_students | integer | YES | 1 | Number of unique students asking this pattern |
| avg_response_quality | numeric | YES | - | Average rating for responses to this pattern |
| escalation_rate | numeric | YES | - | Percentage of times this pattern was escalated |
| first_seen | timestamp with time zone | YES | now() | When pattern was first detected |
| last_seen | timestamp with time zone | YES | now() | Most recent occurrence of the pattern |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| topic_id | module_topics.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_question_patterns_pkey | CREATE UNIQUE INDEX ai_question_patterns_pkey ON public.ai_question_patterns USING btree (id) |
| ai_question_patterns_pattern_hash_key | CREATE UNIQUE INDEX ai_question_patterns_pattern_hash_key ON public.ai_question_patterns USING btree (pattern_hash) |
| idx_question_patterns_hash | CREATE INDEX idx_question_patterns_hash ON public.ai_question_patterns USING btree (pattern_hash) |
| idx_question_patterns_topic | CREATE INDEX idx_question_patterns_topic ON public.ai_question_patterns USING btree (topic_id) |
| idx_question_patterns_occurrence | CREATE INDEX idx_question_patterns_occurrence ON public.ai_question_patterns USING btree (occurrence_count DESC) |

## Usage Notes

- Pattern hash enables deduplication of similar questions
- High occurrence counts identify FAQ candidates
- High escalation rates indicate questions needing better responses
- Helps prioritize content creation and prompt improvements
- Canonical question provides clear example of the pattern
