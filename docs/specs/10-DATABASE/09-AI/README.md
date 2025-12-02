# AI Domain - Database Documentation

## Overview

The AI domain in InTime v3 encompasses all artificial intelligence and machine learning functionality across the platform. This includes:

- **AI Mentor**: Intelligent tutoring system for Academy students
- **AI Twins**: Role-based AI assistants for employees (Recruiter Twin, Bench Sales Twin, etc.)
- **Document Generation**: AI-powered resume and document creation
- **Cost Tracking**: Comprehensive AI usage and cost monitoring
- **Pattern Detection**: Behavioral analysis and personalization
- **Prompt Management**: Versioned prompt engineering and A/B testing

## Table Categories

### 1. Core AI Infrastructure (6 tables)

| Table | Purpose |
|-------|---------|
| [ai_agent_interactions](./ai_agent_interactions.md) | Centralized audit log for all AI agent activities |
| [ai_conversations](./ai_conversations.md) | Multi-turn conversation history storage |
| [ai_cost_tracking](./ai_cost_tracking.md) | Detailed API cost tracking by provider and model |
| [ai_embeddings](./ai_embeddings.md) | Vector embeddings for semantic search |
| [ai_patterns](./ai_patterns.md) | User behavioral pattern detection |
| [ai_foundation_validation](./ai_foundation_validation.md) | Infrastructure validation table |

### 2. AI Mentor System (16 tables)

The AI Mentor provides intelligent tutoring for Academy students with escalation to human trainers when needed.

#### Core Tables (4)
| Table | Purpose |
|-------|---------|
| [ai_mentor_chats](./ai_mentor_chats.md) | Individual Q&A interactions with ratings and escalations |
| [ai_mentor_sessions](./ai_mentor_sessions.md) | Grouped conversation sessions |
| [ai_mentor_rate_limits](./ai_mentor_rate_limits.md) | Per-user usage limits and cost controls |
| [ai_mentor_escalations](./ai_mentor_escalations.md) | Escalation workflow management |

#### Escalation Support (4)
| Table | Purpose |
|-------|---------|
| [escalation_queue](./escalation_queue.md) | VIEW: Trainer work queue for pending escalations |
| [escalation_notifications](./escalation_notifications.md) | Multi-channel notification delivery tracking |
| [trainer_responses](./trainer_responses.md) | Trainer responses to escalated questions |
| [trainer_escalation_stats](./trainer_escalation_stats.md) | VIEW: Trainer performance metrics |

#### Analytics Views (8)
| Table | Purpose |
|-------|---------|
| [ai_mentor_daily_stats](./ai_mentor_daily_stats.md) | VIEW: Daily usage and performance metrics |
| [ai_mentor_hourly_stats](./ai_mentor_hourly_stats.md) | VIEW: Hourly usage patterns |
| [ai_mentor_cost_breakdown](./ai_mentor_cost_breakdown.md) | VIEW: Cost analysis by topic |
| [ai_mentor_student_stats](./ai_mentor_student_stats.md) | VIEW: Per-student usage statistics |
| [ai_mentor_student_engagement](./ai_mentor_student_engagement.md) | VIEW: Student engagement analysis |
| [ai_mentor_topic_stats](./ai_mentor_topic_stats.md) | VIEW: Topic-level summary metrics |
| [ai_mentor_topic_quality](./ai_mentor_topic_quality.md) | VIEW: Quality metrics by topic |
| [escalation_daily_stats](./escalation_daily_stats.md) | VIEW: Daily escalation metrics |

### 3. AI Twin System (3 tables)

Employee AI assistants that provide role-specific guidance and collaborate with each other.

| Table | Purpose |
|-------|---------|
| [twin_conversations](./twin_conversations.md) | Inter-twin collaboration conversations |
| [twin_events](./twin_events.md) | Asynchronous event queue for twin communication |
| [twin_preferences](./twin_preferences.md) | User preferences for twin behavior |

### 4. Prompt Engineering (5 tables)

| Table | Purpose |
|-------|---------|
| [ai_prompts](./ai_prompts.md) | Versioned prompt repository |
| [ai_prompt_variants](./ai_prompt_variants.md) | A/B testing variants |
| [ai_prompt_variant_performance](./ai_prompt_variant_performance.md) | VIEW: Variant comparison metrics |
| [ai_question_patterns](./ai_question_patterns.md) | Common question pattern detection |
| [ai_test](./ai_test.md) | Infrastructure test table |

### 5. Document Generation (3 tables)

| Table | Purpose |
|-------|---------|
| [document_templates](./document_templates.md) | Template management for AI generation |
| [generated_documents](./generated_documents.md) | Generated document tracking |
| [generated_resumes](./generated_resumes.md) | Resume-specific generation with quality metrics |

### 6. Specialized Agents (1 table)

| Table | Purpose |
|-------|---------|
| [guru_interactions](./guru_interactions.md) | Domain-specific Guru agent interactions |

## Key Design Patterns

### 1. Cost Tracking
Multiple tables track AI costs at different granularities:
- **ai_cost_tracking**: Per-API-call tracking
- **ai_agent_interactions**: Agent-level cost aggregation
- **ai_mentor_chats**: Feature-specific costs
- Various VIEW tables: Rollup analytics

### 2. Quality Monitoring
Quality is tracked through:
- **User ratings**: Student feedback on responses
- **Escalation rates**: Percentage of interactions requiring human help
- **Response quality**: AI-assessed quality scores
- **Pattern detection**: Identifying problematic questions

### 3. A/B Testing
Systematic prompt optimization:
- **ai_prompt_variants**: Define test variants
- **ai_mentor_chats.prompt_variant_id**: Track which variant was used
- **ai_prompt_variant_performance**: Compare variant performance

### 4. Escalation Workflow
When AI can't adequately help:
1. **ai_mentor_chats**: Flags for escalation
2. **ai_mentor_escalations**: Creates escalation record
3. **escalation_queue**: Trainer sees in work queue
4. **escalation_notifications**: Trainer is notified
5. **trainer_responses**: Trainer provides response
6. Resolution metrics tracked for SLA monitoring

### 5. Multi-Tenant Architecture
All transactional tables include:
- **org_id**: Organization isolation
- Indexes optimized for org-scoped queries
- Cost tracking per organization

## View vs Table

Tables marked as VIEW are materialized views or database views that aggregate data from base tables:

**Views** (12 total):
- ai_mentor_daily_stats
- ai_mentor_hourly_stats
- ai_mentor_cost_breakdown
- ai_mentor_student_stats
- ai_mentor_student_engagement
- ai_mentor_topic_stats
- ai_mentor_topic_quality
- ai_prompt_variant_performance
- escalation_daily_stats
- escalation_queue
- trainer_escalation_stats

**Physical Tables** (22 total):
- All other tables store actual data

## Performance Considerations

### Indexes
- **Partial indexes**: Optimize queries for active/flagged/escalated records
- **GIN indexes**: Enable efficient JSONB and array queries
- **Composite indexes**: Optimize common query patterns (org + date, etc.)
- **Vector indexes**: IVFFlat for semantic search

### Cost Optimization
- **Rate limits**: Prevent runaway API costs
- **Quality monitoring**: Identify expensive low-quality interactions
- **Variant testing**: Find cost-effective prompts
- **Usage analytics**: Track and optimize high-cost features

## Related Documentation

- [Core Domain](../01-CORE/README.md) - Organizations and user profiles
- [Academy Domain](../05-ACADEMY/README.md) - Course content and student learning
- [Recruiting Domain](../03-RECRUITING/README.md) - Jobs and candidate data for resume generation

## Summary Statistics

- **Total Tables**: 34 (22 physical tables + 12 views)
- **Core Infrastructure**: 6 tables
- **AI Mentor**: 16 tables (4 core + 4 escalation + 8 views)
- **AI Twins**: 3 tables
- **Prompt Engineering**: 5 tables
- **Document Generation**: 3 tables
- **Specialized Agents**: 1 table

## Technology Stack

- **Vector Search**: pgvector extension with IVFFlat indexes
- **AI Providers**: OpenAI (GPT-4, GPT-4o-mini), Anthropic (Claude), Google (Gemini)
- **Cost Tracking**: Per-token pricing across providers
- **Embeddings**: Support for various embedding models
- **Storage**: JSONB for flexible metadata, arrays for lists
