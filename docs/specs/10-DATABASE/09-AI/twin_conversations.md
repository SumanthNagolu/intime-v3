# twin_conversations Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `twin_conversations` |
| Schema | `public` |
| Purpose | Records inter-twin conversations where AI twins collaborate to help users with role-specific insights and recommendations |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the conversation |
| org_id | uuid | NO | - | Organization context for the conversation |
| initiator_user_id | uuid | YES | - | User who initiated the conversation (nullable for system-initiated) |
| initiator_role | text | NO | - | Role of the twin initiating the conversation |
| responder_role | text | NO | - | Role of the twin responding |
| question | text | NO | - | Question or request from the initiator |
| response | text | YES | - | Response from the responder twin |
| tokens_used | integer | YES | - | Total tokens consumed in this conversation |
| cost_usd | numeric | YES | - | Cost in USD for this conversation |
| latency_ms | integer | YES | - | Response time in milliseconds |
| model_used | text | YES | 'gpt-4o-mini'::text | AI model used for the conversation |
| context | jsonb | YES | '{}'::jsonb | Additional context about the conversation |
| status | text | YES | 'completed'::text | Conversation status (completed, pending, error) |
| error_message | text | YES | - | Error message if conversation failed |
| created_at | timestamp with time zone | NO | now() | Timestamp when conversation occurred |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| initiator_user_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| twin_conversations_pkey | CREATE UNIQUE INDEX twin_conversations_pkey ON public.twin_conversations USING btree (id) |
| idx_twin_conversations_org | CREATE INDEX idx_twin_conversations_org ON public.twin_conversations USING btree (org_id, created_at DESC) |
| idx_twin_conversations_initiator | CREATE INDEX idx_twin_conversations_initiator ON public.twin_conversations USING btree (initiator_role, created_at DESC) |
| idx_twin_conversations_responder | CREATE INDEX idx_twin_conversations_responder ON public.twin_conversations USING btree (responder_role, created_at DESC) |

## Usage Notes

- Enables cross-functional AI collaboration (e.g., Recruiter Twin asks Bench Sales Twin)
- Supports the AI Twin ecosystem architecture
- Role-based indexing enables analysis of twin interaction patterns
- Context JSONB stores relevant business objects and metadata
