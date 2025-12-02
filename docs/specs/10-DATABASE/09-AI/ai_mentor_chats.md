# ai_mentor_chats Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_chats` |
| Schema | `public` |
| Purpose | Core table for AI Mentor interactions in the Academy module, tracking questions, responses, ratings, and escalations |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the chat |
| user_id | uuid | NO | - | Student who asked the question |
| topic_id | uuid | YES | - | Related course topic (if applicable) |
| course_id | uuid | YES | - | Related course (if applicable) |
| question | text | NO | - | Student's question to the AI Mentor |
| response | text | NO | - | AI Mentor's response |
| conversation_context | jsonb | YES | '[]'::jsonb | Previous messages for multi-turn conversations |
| tokens_used | integer | NO | 0 | Total tokens consumed for this interaction |
| response_time_ms | integer | NO | 0 | Time taken to generate response in milliseconds |
| model | text | NO | 'gpt-4o-mini'::text | AI model used for the response |
| cost_usd | numeric | YES | 0 | Cost in USD for this interaction |
| student_rating | integer | YES | - | Student rating (1-5 scale or thumbs up/down) |
| student_feedback | text | YES | - | Optional student feedback text |
| flagged_for_review | boolean | YES | false | Whether this chat needs human review |
| escalated_to_trainer | boolean | YES | false | Whether this was escalated to a human trainer |
| escalation_reason | text | YES | - | Reason for escalation (if applicable) |
| created_at | timestamp with time zone | YES | now() | Timestamp when the chat occurred |
| rated_at | timestamp with time zone | YES | - | Timestamp when student provided rating |
| escalated_at | timestamp with time zone | YES | - | Timestamp when chat was escalated |
| prompt_variant_id | uuid | YES | - | A/B testing variant used for this response |
| question_hash | text | YES | - | Hash of question for pattern detection |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | user_profiles.id | - |
| topic_id | module_topics.id | - |
| course_id | courses.id | - |
| prompt_variant_id | ai_prompt_variants.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_mentor_chats_pkey | CREATE UNIQUE INDEX ai_mentor_chats_pkey ON public.ai_mentor_chats USING btree (id) |
| idx_ai_mentor_chats_user_id | CREATE INDEX idx_ai_mentor_chats_user_id ON public.ai_mentor_chats USING btree (user_id) |
| idx_ai_mentor_chats_topic_id | CREATE INDEX idx_ai_mentor_chats_topic_id ON public.ai_mentor_chats USING btree (topic_id) |
| idx_ai_mentor_chats_course_id | CREATE INDEX idx_ai_mentor_chats_course_id ON public.ai_mentor_chats USING btree (course_id) |
| idx_ai_mentor_chats_created_at | CREATE INDEX idx_ai_mentor_chats_created_at ON public.ai_mentor_chats USING btree (created_at DESC) |
| idx_ai_mentor_chats_flagged | CREATE INDEX idx_ai_mentor_chats_flagged ON public.ai_mentor_chats USING btree (flagged_for_review) WHERE (flagged_for_review = true) |
| idx_ai_mentor_chats_escalated | CREATE INDEX idx_ai_mentor_chats_escalated ON public.ai_mentor_chats USING btree (escalated_to_trainer) WHERE (escalated_to_trainer = true) |
| idx_mentor_chats_prompt_variant | CREATE INDEX idx_mentor_chats_prompt_variant ON public.ai_mentor_chats USING btree (prompt_variant_id) |
| idx_mentor_chats_question_hash | CREATE INDEX idx_mentor_chats_question_hash ON public.ai_mentor_chats USING btree (question_hash) |

## Usage Notes

- Central table for AI Mentor functionality in Academy
- Supports A/B testing via prompt_variant_id
- Question hash enables duplicate detection and pattern analysis
- Partial indexes optimize queries for flagged/escalated chats
- Conversation context enables multi-turn dialogues
