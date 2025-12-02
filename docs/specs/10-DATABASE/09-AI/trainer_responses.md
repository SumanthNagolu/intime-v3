# trainer_responses Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `trainer_responses` |
| Schema | `public` |
| Purpose | Stores trainer responses and notes for escalated AI Mentor interactions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the response |
| escalation_id | uuid | NO | - | Escalation being responded to |
| trainer_id | uuid | NO | - | Trainer providing the response |
| message | text | NO | - | Response message to student |
| is_internal_note | boolean | YES | false | Whether this is an internal note (not visible to student) |
| created_at | timestamp with time zone | YES | now() | When response was created |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| escalation_id | ai_mentor_escalations.id | - |
| trainer_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| trainer_responses_pkey | CREATE UNIQUE INDEX trainer_responses_pkey ON public.trainer_responses USING btree (id) |
| idx_trainer_responses_escalation_id | CREATE INDEX idx_trainer_responses_escalation_id ON public.trainer_responses USING btree (escalation_id) |
| idx_trainer_responses_trainer_id | CREATE INDEX idx_trainer_responses_trainer_id ON public.trainer_responses USING btree (trainer_id) |

## Usage Notes

- Supports multi-turn trainer-student dialogue on escalations
- Internal notes enable trainer collaboration without student visibility
- Links trainer expertise back to student questions
- Provides data for improving AI Mentor responses
