# ai_mentor_escalations Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_escalations` |
| Schema | `public` |
| Purpose | Manages escalation workflow when AI Mentor cannot adequately answer a student question and requires human trainer intervention |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the escalation |
| chat_id | uuid | NO | - | Reference to the original ai_mentor_chat |
| user_id | uuid | NO | - | Student who asked the question |
| topic_id | uuid | YES | - | Related topic (if applicable) |
| reason | text | NO | - | Reason for escalation |
| confidence | numeric | YES | - | AI confidence score (low confidence triggers escalation) |
| auto_detected | boolean | YES | true | Whether escalation was automatically detected |
| triggers | jsonb | YES | '{}'::jsonb | What triggered the escalation (keywords, patterns, etc.) |
| metadata | jsonb | YES | '{}'::jsonb | Additional context about the escalation |
| assigned_to | uuid | YES | - | Trainer assigned to handle this escalation |
| assigned_at | timestamp with time zone | YES | - | When escalation was assigned |
| status | text | YES | 'pending'::text | Current status (pending, in_progress, resolved, dismissed) |
| resolved_by | uuid | YES | - | Trainer who resolved the escalation |
| resolved_at | timestamp with time zone | YES | - | When escalation was resolved |
| resolution_notes | text | YES | - | Trainer's notes about the resolution |
| resolution_time_minutes | integer | YES | - | Time taken to resolve in minutes |
| created_at | timestamp with time zone | YES | now() | Timestamp when escalation was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp of last update |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| chat_id | ai_mentor_chats.id | - |
| user_id | user_profiles.id | - |
| topic_id | module_topics.id | - |
| assigned_to | user_profiles.id | - |
| resolved_by | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_mentor_escalations_pkey | CREATE UNIQUE INDEX ai_mentor_escalations_pkey ON public.ai_mentor_escalations USING btree (id) |
| idx_escalations_chat_id | CREATE INDEX idx_escalations_chat_id ON public.ai_mentor_escalations USING btree (chat_id) |
| idx_escalations_user_id | CREATE INDEX idx_escalations_user_id ON public.ai_mentor_escalations USING btree (user_id) |
| idx_escalations_topic_id | CREATE INDEX idx_escalations_topic_id ON public.ai_mentor_escalations USING btree (topic_id) |
| idx_escalations_status | CREATE INDEX idx_escalations_status ON public.ai_mentor_escalations USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'in_progress'::text])) |
| idx_escalations_assigned_to | CREATE INDEX idx_escalations_assigned_to ON public.ai_mentor_escalations USING btree (assigned_to) WHERE (assigned_to IS NOT NULL) |
| idx_escalations_created_at | CREATE INDEX idx_escalations_created_at ON public.ai_mentor_escalations USING btree (created_at DESC) |

## Usage Notes

- Supports both automatic and manual escalation workflows
- Tracks escalation SLAs via resolution_time_minutes
- Partial indexes optimize queries for active escalations
- Triggers JSONB stores detailed escalation criteria for analysis
- Enables workload distribution among trainers
