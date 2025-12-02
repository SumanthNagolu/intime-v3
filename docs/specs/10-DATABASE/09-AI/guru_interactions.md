# guru_interactions Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `guru_interactions` |
| Schema | `public` |
| Purpose | Tracks interactions with AI Guru agents that provide domain-specific guidance to students |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the interaction |
| org_id | uuid | NO | - | Organization context |
| student_id | uuid | NO | - | Student interacting with the Guru |
| agent_type | text | NO | - | Type of Guru agent (e.g., 'career_guru', 'tech_guru') |
| conversation_id | text | YES | - | Session/conversation identifier for grouping |
| input | jsonb | NO | - | Student's input/question as structured data |
| output | jsonb | NO | - | Guru's response as structured data |
| was_helpful | boolean | YES | - | Student feedback on helpfulness |
| user_feedback | text | YES | - | Optional student feedback text |
| model_used | text | NO | - | AI model used for the response |
| tokens_used | integer | NO | 0 | Tokens consumed in this interaction |
| cost_usd | numeric | NO | 0 | Cost in USD for this interaction |
| latency_ms | integer | NO | 0 | Response time in milliseconds |
| created_at | timestamp with time zone | NO | now() | Timestamp when interaction occurred |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | - |
| student_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| guru_interactions_pkey | CREATE UNIQUE INDEX guru_interactions_pkey ON public.guru_interactions USING btree (id) |
| idx_guru_interactions_student | CREATE INDEX idx_guru_interactions_student ON public.guru_interactions USING btree (student_id, created_at DESC) |
| idx_guru_interactions_agent_type | CREATE INDEX idx_guru_interactions_agent_type ON public.guru_interactions USING btree (agent_type, created_at DESC) |
| idx_guru_interactions_conversation | CREATE INDEX idx_guru_interactions_conversation ON public.guru_interactions USING btree (conversation_id) WHERE (conversation_id IS NOT NULL) |
| idx_guru_interactions_org | CREATE INDEX idx_guru_interactions_org ON public.guru_interactions USING btree (org_id, created_at DESC) |

## Usage Notes

- Specialized AI agents for domain-specific student guidance
- JSONB input/output supports structured interactions
- Conversation grouping enables multi-turn dialogues
- Feedback tracking measures guru effectiveness
- Supports multiple guru types for different domains
