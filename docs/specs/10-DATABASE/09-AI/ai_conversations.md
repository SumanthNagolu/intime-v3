# ai_conversations Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_conversations` |
| Schema | `public` |
| Purpose | Stores multi-turn conversations between users and AI agents, maintaining conversation history and context |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the conversation |
| user_id | uuid | NO | - | User participating in the conversation |
| agent_type | text | NO | - | Type of AI agent in the conversation |
| messages | jsonb | NO | '[]'::jsonb | Array of conversation messages with roles and content |
| metadata | jsonb | NO | '{}'::jsonb | Additional conversation context and settings |
| created_at | timestamp with time zone | NO | now() | Timestamp when conversation started |
| updated_at | timestamp with time zone | NO | now() | Timestamp of last message in the conversation |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_conversations_pkey | CREATE UNIQUE INDEX ai_conversations_pkey ON public.ai_conversations USING btree (id) |
| idx_ai_conversations_user_id | CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations USING btree (user_id) |
| idx_ai_conversations_agent_type | CREATE INDEX idx_ai_conversations_agent_type ON public.ai_conversations USING btree (agent_type) |
| idx_ai_conversations_updated_at | CREATE INDEX idx_ai_conversations_updated_at ON public.ai_conversations USING btree (updated_at DESC) |
| idx_ai_conversations_metadata | CREATE INDEX idx_ai_conversations_metadata ON public.ai_conversations USING gin (metadata) |

## Usage Notes

- Messages are stored as JSONB array for flexible conversation structures
- GIN index on metadata enables efficient querying of conversation attributes
- Updated_at tracks the last activity for conversation management
- Supports various agent types for different use cases
