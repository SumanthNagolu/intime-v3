# ai_mentor_sessions Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_sessions` |
| Schema | `public` |
| Purpose | Groups related AI Mentor chats into sessions for tracking conversation threads and cumulative metrics |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the session |
| user_id | uuid | NO | - | Student participating in the session |
| topic_id | uuid | YES | - | Primary topic being discussed (if applicable) |
| course_id | uuid | YES | - | Related course (if applicable) |
| title | text | YES | - | Session title or summary |
| message_count | integer | NO | 0 | Number of messages in this session |
| total_tokens | integer | NO | 0 | Cumulative tokens used in the session |
| total_cost_usd | numeric | YES | 0 | Cumulative cost for the session |
| started_at | timestamp with time zone | YES | now() | When session began |
| last_message_at | timestamp with time zone | YES | now() | Timestamp of most recent message |
| ended_at | timestamp with time zone | YES | - | When session concluded (null for active sessions) |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | user_profiles.id | - |
| topic_id | module_topics.id | - |
| course_id | courses.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_mentor_sessions_pkey | CREATE UNIQUE INDEX ai_mentor_sessions_pkey ON public.ai_mentor_sessions USING btree (id) |
| idx_ai_mentor_sessions_user_id | CREATE INDEX idx_ai_mentor_sessions_user_id ON public.ai_mentor_sessions USING btree (user_id) |
| idx_ai_mentor_sessions_last_message | CREATE INDEX idx_ai_mentor_sessions_last_message ON public.ai_mentor_sessions USING btree (last_message_at DESC) |

## Usage Notes

- Groups multiple ai_mentor_chats into logical conversation sessions
- Tracks session duration and engagement metrics
- Null ended_at indicates active/ongoing session
- Cumulative metrics help track session-level costs and usage
