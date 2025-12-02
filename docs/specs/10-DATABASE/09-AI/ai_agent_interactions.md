# ai_agent_interactions Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_agent_interactions` |
| Schema | `public` |
| Purpose | Tracks all AI agent interactions across the platform, including inputs, outputs, performance metrics, and costs for monitoring and analytics |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the interaction |
| org_id | uuid | NO | - | Organization that owns this interaction |
| user_id | uuid | YES | - | User who initiated the interaction (nullable for system-initiated interactions) |
| agent_name | text | NO | - | Name/identifier of the AI agent (e.g., 'resume_generator', 'mentor', 'twin') |
| interaction_type | text | NO | - | Type of interaction (e.g., 'question', 'generation', 'suggestion') |
| input | text | YES | - | User input or prompt sent to the agent |
| output | text | YES | - | Agent's response or generated output |
| model_used | text | YES | - | AI model used for this interaction (e.g., 'gpt-4o-mini', 'claude-3-sonnet') |
| tokens_used | integer | YES | 0 | Total tokens consumed in this interaction |
| cost_usd | numeric | YES | 0.00 | Cost in USD for this interaction |
| latency_ms | integer | YES | 0 | Response time in milliseconds |
| success | boolean | NO | true | Whether the interaction completed successfully |
| error_message | text | YES | - | Error message if the interaction failed |
| metadata | jsonb | NO | '{}'::jsonb | Additional context and metadata about the interaction |
| created_at | timestamp with time zone | NO | now() | Timestamp when the interaction occurred |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | - |
| user_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_agent_interactions_pkey | CREATE UNIQUE INDEX ai_agent_interactions_pkey ON public.ai_agent_interactions USING btree (id) |
| idx_ai_agent_interactions_org_date | CREATE INDEX idx_ai_agent_interactions_org_date ON public.ai_agent_interactions USING btree (org_id, created_at DESC) |
| idx_ai_agent_interactions_user | CREATE INDEX idx_ai_agent_interactions_user ON public.ai_agent_interactions USING btree (user_id) |
| idx_ai_agent_interactions_agent | CREATE INDEX idx_ai_agent_interactions_agent ON public.ai_agent_interactions USING btree (agent_name) |
| idx_ai_agent_interactions_type | CREATE INDEX idx_ai_agent_interactions_type ON public.ai_agent_interactions USING btree (interaction_type) |
| idx_ai_agent_interactions_success | CREATE INDEX idx_ai_agent_interactions_success ON public.ai_agent_interactions USING btree (success) WHERE (success = false) |

## Usage Notes

- This table serves as a centralized audit log for all AI agent activities
- The success partial index optimizes queries for failed interactions
- Cost tracking enables budget monitoring and optimization
- Metadata field allows flexible storage of agent-specific context
