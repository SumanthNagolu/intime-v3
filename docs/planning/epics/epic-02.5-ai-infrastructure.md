# Epic 2.5: AI Infrastructure & Services

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** AI Infrastructure & Services

**🎯 Goal:** Build unified AI infrastructure that powers all AI-driven features across the platform

**💰 Business Value:** Enables $3M/year in cost savings (vs. human labor); 10× productivity multiplier; 24/7 automated intelligence

**👥 User Personas:**
- Students (AI mentor, 24/7 help)
- Trainers (AI assistant for grading, student insights)
- Recruiters (AI-powered sourcing, matching, outreach)
- Employees (AI productivity tracking, workflow optimization)
- System Admins (Cost monitoring, performance dashboards)

**🎁 Key Features:**

### Core Infrastructure (Week 5-6)
- **AI Model Router** - Intelligent model selection (GPT-4o-mini/GPT-4o/Claude Sonnet)
- **RAG Layer** - Semantic search with pgvector embeddings
- **Memory System** - Three-tier (Redis short-term, PostgreSQL long-term, pgvector patterns)
- **Cost Tracking** - Real-time monitoring with Helicone
- **Base Agent Framework** - Reusable agent templates with memory + RAG
- **Prompt Library** - Standardized templates (Socratic, classification, etc.)

### AI-Powered Features (Week 7-12)
- **Guidewire Guru** - Multi-agent training assistant (Code Mentor, Resume Builder, Interview Coach)
- **Productivity Tracking** - Screenshot analysis with activity classification
- **Employee AI Twins** - Personalized workflow assistants per role
- **Resume Matching** - Semantic candidate-job pairing

**📊 Success Metrics:**

- **Infrastructure Performance:**
  - AI response time: <2 seconds (95th percentile)
  - RAG search latency: <500ms
  - Memory retrieval: <100ms
  - Uptime: 99.5%+

- **Cost Efficiency:**
  - Total AI spend: <$280K/year (200 employees + 1,000 students)
  - Cost per student: <$0.50 for 8-week program
  - Cost per employee: <$1,200/year
  - Budget alerts trigger at $500/day threshold

- **Business Impact:**
  - Guidewire Guru accuracy: 95%+ helpful responses
  - Productivity classification accuracy: 90%+
  - Employee bot adoption: 80%+ daily active use
  - Time saved per employee: 15+ hours/week

**🔗 Dependencies:**

- **Requires:** Epic 1 (Foundation - database, auth, event bus, file structure)
- **Enables:**
  - Epic 2 (Training Academy - AI Mentor)
  - Epic 6 (HR & Employee - Productivity tracking, AI twins)
  - Epic 3 (Recruiting - Resume matching, candidate sourcing AI)
- **Blocks:** Nothing (can proceed after Epic 1 complete)

**⏱️ Effort Estimate:** 8 weeks, ~40 stories

**📅 Tentative Timeline:** Week 5-12 (Post-Foundation)

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                  AI Service Layer (Unified)                     │
│  Routes all AI requests, manages cost, tracks performance      │
└───────────────────────┬────────────────────────────────────────┘
                        │
        ┌───────────────┴────────────┬────────────┬──────────────┐
        │                            │            │              │
┌───────▼──────────┐  ┌──────────────▼──────┐  ┌─▼────────┐  ┌─▼──────────┐
│ Guidewire Guru   │  │ Productivity        │  │ Employee │  │ Resume     │
│ (Multi-Agent)    │  │ Tracking (Vision)   │  │ AI Twins │  │ Matching   │
│                  │  │                     │  │ (Multi)  │  │ (RAG)      │
│ 4 specialists:   │  │ Screenshot → JSON   │  │ Per-role │  │ Semantic   │
│ - Code Mentor    │  │ classification      │  │ workflow │  │ search +   │
│ - Resume Builder │  │ Daily insights      │  │ guidance │  │ deep match │
│ - Project Plan   │  │                     │  │          │  │            │
│ - Interview Coach│  │                     │  │          │  │            │
└──────────────────┘  └─────────────────────┘  └──────────┘  └────────────┘
                        │
        ┌───────────────┴──────────────────────────────────────┐
        │         Core AI Infrastructure                        │
        ├───────────────────────────────────────────────────────┤
        │ • Model Router (optimal model selection)              │
        │ • RAG Layer (pgvector + embeddings)                   │
        │ • Memory Layer (Redis + PostgreSQL + patterns)        │
        │ • Cost Tracker (Helicone)                             │
        │ • Orchestrator (multi-agent coordination)             │
        │ • Prompt Library (reusable templates)                 │
        └───────────────────────────────────────────────────────┘
```

---

## Sprint Breakdown

### Sprint 1: Core Infrastructure (Week 5-6, 21 points)

**AI-INF-001: AI Model Router** (5 points)
- Intelligent model selection based on task complexity
- Route to GPT-4o-mini (cheap), GPT-4o (writing), or Claude Sonnet (reasoning)
- Automatic fallback on errors
- Cost tracking per request

**AI-INF-002: RAG Infrastructure** (8 points)
- pgvector extension setup in Supabase
- Document indexing pipeline (curriculum, policies, best practices)
- Semantic search with cosine similarity
- Embedding generation (text-embedding-3-small)

**AI-INF-003: Memory Layer** (8 points)
- Redis setup for short-term memory (conversations, 24h TTL)
- PostgreSQL tables for long-term memory (interactions, preferences)
- pgvector storage for learned patterns (vector similarity)
- Memory retrieval APIs (getConversation, findSimilarPatterns)

---

### Sprint 2: Monitoring & Base Agents (Week 7-8, 19 points)

**AI-INF-004: Cost Monitoring with Helicone** (5 points)
- Helicone integration for real-time cost tracking
- Tag requests by use case, user, model
- Budget alerts ($500/day threshold)
- Weekly cost reports (by use case, model, user)

**AI-INF-005: Base Agent Framework** (8 points)
- Reusable BaseAgent class (memory + RAG + prompts)
- Agent lifecycle management (init, query, learn, cleanup)
- Context management (conversation history, user profile)
- Error handling and retry logic

**AI-INF-006: Prompt Library** (3 points)
- Standardized prompt templates (Socratic, classification, generation)
- Prompt versioning and A/B testing
- Token optimization (concise prompts)
- Prompt injection protection

**AI-INF-007: Multi-Agent Orchestrator** (3 points)
- Route queries to correct specialist agent
- Manage agent coordination and handoffs
- Track conversation context across agents
- Detect escalation triggers

---

### Sprint 3: Guidewire Guru (Week 9-10, 26 points)

**AI-GURU-001: Code Mentor Agent** (8 points)
- Socratic method implementation
- Curriculum RAG retrieval
- Student progress context
- Struggle detection and escalation

**AI-GURU-002: Resume Builder Agent** (5 points)
- ATS-optimized resume generation
- GPT-4o for writing quality
- Skill highlighting from completed modules
- Multiple format exports (PDF, DOCX, LinkedIn)

**AI-GURU-003: Project Planner Agent** (5 points)
- Capstone project breakdown
- Realistic milestone timelines
- Resource allocation
- Risk identification

**AI-GURU-004: Interview Coach Agent** (8 points)
- Claude Sonnet for nuanced coaching
- STAR method training
- Mock interview with feedback
- Company-specific preparation

---

### Sprint 4: Productivity & Employee Bots (Week 11-12, 21 points)

**AI-PROD-001: Desktop Screenshot Agent** (5 points)
- Electron app for screenshot capture (every 30s)
- Compression and upload to Supabase Storage
- Privacy controls (pause, opt-in)
- Offline queue for retry

**AI-PROD-002: Activity Classification** (8 points)
- GPT-4o-mini vision API integration
- Classify: coding, email, meeting, social media, idle
- JSON structured output
- Confidence scoring

**AI-PROD-003: Daily Timeline Generator** (3 points)
- Batch process 120 activity summaries
- Generate narrative report with insights
- Manager dashboard (aggregated metrics only)
- Privacy-safe (no raw screenshots)

**AI-TWIN-001: Employee AI Twin Framework** (5 points)
- Role-specific twin templates (Recruiter, Trainer, Bench Sales)
- Morning briefings (personalized)
- Proactive suggestions (3×/day)
- Struggle detection and help offering

---

## Key Stories (Detailed)

### AI-INF-001: AI Model Router

**As a** developer
**I want** intelligent model routing based on task complexity
**So that** I optimize cost (cheap model for simple tasks) and quality (expensive model for complex reasoning)

**Acceptance Criteria:**
1. ✅ Route simple tasks (Q&A, classification) to GPT-4o-mini ($0.0006/1K tokens)
2. ✅ Route writing tasks (resumes, emails) to GPT-4o ($0.03/1K tokens)
3. ✅ Route reasoning tasks (coaching, strategy) to Claude Sonnet ($0.15/1K tokens)
4. ✅ Automatic fallback: If GPT-4o fails, retry with GPT-4o-mini
5. ✅ Cost tracking: Log model, tokens, cost per request
6. ✅ Performance tracking: Log latency per model
7. ✅ Error handling: Exponential backoff on rate limits
8. ✅ Testing: 95%+ successful routing

**Implementation:**

```typescript
// /src/lib/ai/router.ts
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type AITask = {
  type: 'chat' | 'completion' | 'embedding' | 'vision';
  complexity: 'simple' | 'medium' | 'complex';
  requiresReasoning?: boolean;
  requiresWriting?: boolean;
  useCase: string;
  userId: string;
};

export async function routeAIRequest(
  task: AITask,
  prompt: string,
  options?: any
) {
  const model = selectModel(task);
  const startTime = Date.now();

  try {
    const response = await executeWithModel(model, prompt, options);

    await logMetrics({
      model,
      useCase: task.useCase,
      userId: task.userId,
      latency: Date.now() - startTime,
      tokensUsed: response.usage?.total_tokens,
      cost: calculateCost(model, response.usage)
    });

    return response;
  } catch (error) {
    // Fallback to cheaper model
    if (model === 'gpt-4o' && task.complexity !== 'complex') {
      return routeAIRequest(
        { ...task, complexity: 'simple' },
        prompt,
        options
      );
    }
    throw error;
  }
}

function selectModel(task: AITask): string {
  if (task.type === 'embedding') return 'text-embedding-3-small';
  if (task.requiresWriting) return 'gpt-4o';
  if (task.requiresReasoning) return 'claude-sonnet-4-5';
  return 'gpt-4o-mini'; // Default: cheap and fast
}
```

**Testing:**
```typescript
describe('AI Model Router', () => {
  it('routes simple Q&A to GPT-4o-mini', async () => {
    const response = await routeAIRequest({
      type: 'chat',
      complexity: 'simple',
      useCase: 'code_mentor',
      userId: 'test-user'
    }, 'What is JavaScript?');

    expect(response.model).toBe('gpt-4o-mini');
    expect(response.cost).toBeLessThan(0.001);
  });

  it('routes resume generation to GPT-4o', async () => {
    const response = await routeAIRequest({
      type: 'completion',
      complexity: 'medium',
      requiresWriting: true,
      useCase: 'resume_builder',
      userId: 'test-user'
    }, 'Generate resume for Guidewire developer');

    expect(response.model).toBe('gpt-4o');
  });

  it('routes interview coaching to Claude Sonnet', async () => {
    const response = await routeAIRequest({
      type: 'chat',
      complexity: 'complex',
      requiresReasoning: true,
      useCase: 'interview_coach',
      userId: 'test-user'
    }, 'Help me answer behavioral questions');

    expect(response.model).toBe('claude-sonnet-4-5');
  });

  it('falls back on error', async () => {
    // Mock GPT-4o failure
    mockGPT4oError();

    const response = await routeAIRequest({
      type: 'chat',
      complexity: 'medium',
      useCase: 'test',
      userId: 'test-user'
    }, 'Test prompt');

    // Should fallback to GPT-4o-mini
    expect(response.model).toBe('gpt-4o-mini');
  });
});
```

---

### AI-INF-002: RAG Infrastructure

**As a** AI agent
**I want** to retrieve relevant context from knowledge base (curriculum, policies, best practices)
**So that** my responses are accurate, up-to-date, and grounded in facts (not hallucinations)

**Acceptance Criteria:**
1. ✅ pgvector extension enabled in Supabase PostgreSQL
2. ✅ Document indexing pipeline: Text → Chunks → Embeddings → pgvector
3. ✅ Semantic search: Query → Embedding → Cosine similarity → Top K results
4. ✅ Indexable collections: curriculum, policies, resumes, job descriptions
5. ✅ Search threshold: 0.7 cosine similarity (70%+ relevance)
6. ✅ Performance: <500ms search latency
7. ✅ Storage: 1M+ vectors supported
8. ✅ Testing: 85%+ retrieval accuracy

**Database Schema:**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge chunks table
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection TEXT NOT NULL, -- 'curriculum' | 'policies' | 'resumes'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_collection (collection),
  INDEX idx_embedding vector_cosine_ops (embedding)
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  collection_name text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.content,
    k.metadata,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks k
  WHERE (collection_name IS NULL OR k.collection = collection_name)
    AND 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Implementation:**

```typescript
// /src/lib/ai/rag.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const openai = new OpenAI();

export class RAGLayer {
  /**
   * Index documents for semantic search
   */
  async indexDocuments(
    documents: Array<{ id: string; content: string; metadata: any }>,
    collection: string
  ) {
    for (const doc of documents) {
      // Generate embedding
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: doc.content
      });

      // Store in pgvector
      await supabase.from('knowledge_chunks').insert({
        id: doc.id,
        collection,
        content: doc.content,
        metadata: doc.metadata,
        embedding: embedding.data[0].embedding
      });
    }
  }

  /**
   * Semantic search
   */
  async search({
    query,
    collection,
    topK = 5,
    threshold = 0.7
  }: {
    query: string;
    collection: string;
    topK?: number;
    threshold?: number;
  }) {
    // Generate query embedding
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });

    // Search pgvector
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding.data[0].embedding,
      match_threshold: threshold,
      match_count: topK,
      collection_name: collection
    });

    if (error) throw error;

    return data.map(row => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      similarity: row.similarity
    }));
  }
}
```

**Testing:**

```typescript
describe('RAG Layer', () => {
  it('indexes curriculum documents', async () => {
    const rag = new RAGLayer();

    await rag.indexDocuments([
      {
        id: 'guidewire-rating-101',
        content: 'Rating in PolicyCenter calculates premiums using rating tables...',
        metadata: { module: 'PolicyCenter', topic: 'Rating' }
      }
    ], 'curriculum');

    // Verify indexed
    const results = await rag.search({
      query: 'How does rating work?',
      collection: 'curriculum'
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain('Rating in PolicyCenter');
    expect(results[0].similarity).toBeGreaterThan(0.7);
  });

  it('returns empty for irrelevant queries', async () => {
    const rag = new RAGLayer();

    const results = await rag.search({
      query: 'What is the weather today?', // Irrelevant
      collection: 'curriculum'
    });

    expect(results.length).toBe(0); // No matches above threshold
  });

  it('respects similarity threshold', async () => {
    const rag = new RAGLayer();

    const results = await rag.search({
      query: 'rating',
      collection: 'curriculum',
      threshold: 0.9 // Very high threshold
    });

    // Only exact matches
    expect(results.every(r => r.similarity > 0.9)).toBe(true);
  });
});
```

---

## Cost Projections (Year 1)

### Breakdown by Use Case

| Use Case | Volume | Cost per Unit | Annual Cost | % of Budget |
|----------|--------|---------------|-------------|-------------|
| **Guidewire Guru** | 1,000 students | $0.30/student | $304 | 0.1% |
| - Code Mentor | 30K interactions | $0.001/query | $30 | - |
| - Resume Builder | 1K resumes | $0.15/resume | $150 | - |
| - Project Planner | 1K plans | $0.02/plan | $20 | - |
| - Interview Coach | 1K sessions | $0.10/session | $104 | - |
| **Productivity Tracking** | 200 employees | $252/employee | $50,400 | 18% |
| - Screenshot classification | 25M images | $0.002/image | $50,000 | - |
| - Daily timelines | 52K reports | $0.01/report | $400 | - |
| **Employee AI Twins** | 200 employees | $1,133/employee | $226,700 | 82% |
| - Morning briefings | 52K briefings | $0.005/briefing | $260 | - |
| - Proactive suggestions | 156K suggestions | $0.005/suggestion | $780 | - |
| - On-demand questions | 260K queries | $0.005/query | $1,300 | - |
| - Real-time coaching | 52K hours | $3/hour | $156,000 | - |
| - Advanced analytics | 52K reports | $0.50/report | $26,000 | - |
| - Infrastructure | - | - | $42,360 | - |
| **Resume Matching** | Included in Employee Bots | - | - | - |
| **TOTAL** | - | - | **$277,404** | **100%** |

**Budget Approved:** $280,000/year
**Remaining Buffer:** $2,596 (1%)

---

## Risk Analysis & Mitigation

### Technical Risks

**Risk:** RAG accuracy below expectations (< 70% relevance)
**Impact:** High - AI gives wrong answers, student confusion
**Mitigation:**
- A/B test: RAG vs. no-RAG in Week 6
- Measure: Thumbs up/down on AI responses
- Fallback: Use prompt-only if RAG doesn't improve accuracy
- Threshold: If RAG improvement < 10%, remove it

**Risk:** Cost overruns (exceed $280K budget)
**Impact:** High - Business case breaks, need emergency optimization
**Mitigation:**
- Daily cost monitoring (Helicone dashboard)
- Alerts at $500/day threshold ($182K/year pace)
- Rate limiting: 50 questions/day per student, 20 queries/day per employee
- Model downgrading: GPT-4o → GPT-4o-mini if budget exceeded
- Caching: 50% hit rate expected, reduces calls by half

**Risk:** AI latency too high (> 5 seconds response time)
**Impact:** Medium - Poor user experience, students frustrated
**Mitigation:**
- Streaming responses (show partial results immediately)
- Async processing (queue long-running tasks)
- CDN for embeddings (cache common queries)
- Upgrade if needed: GPT-4o-mini is 2× faster than GPT-4o

**Risk:** Memory layer doesn't scale (Redis out of memory)
**Impact:** Medium - Can't store conversation history
**Mitigation:**
- Redis memory limits: 5GB max (handle 100K concurrent conversations)
- TTL cleanup: 24-hour automatic expiration
- Fallback: Use PostgreSQL if Redis unavailable
- Upgrade path: Redis Enterprise if needed ($500/month)

### Business Risks

**Risk:** Students become dependent on AI, don't learn deeply
**Impact:** High - Low job placement rate, reputation damage
**Mitigation:**
- Socratic method forces thinking (don't give answers)
- Quiz system validates understanding (can't just ask AI)
- Capstone project requires hands-on work
- AI detects "just tell me" patterns → escalate to human

**Risk:** Privacy concerns with screenshot tracking
**Impact:** High - Legal liability, employee morale
**Mitigation:**
- Transparent communication (onboarding disclosure)
- Employee controls (pause tracking, see own data)
- No human review of raw screenshots (AI-only)
- Privacy audit before launch (GDPR, CCPA compliance)
- Opt-in pilot (10 volunteers first)

**Risk:** Low adoption of Employee AI Twins
**Impact:** Medium - ROI doesn't materialize, wasted investment
**Mitigation:**
- Onboarding training (30-min session per employee)
- Early wins (show time savings in Week 1)
- Manager endorsement (leadership uses it publicly)
- Feedback loop (improve based on user suggestions)
- Incentives (gamify usage, leaderboard)

---

## Success Criteria

### Definition of Done (Epic 2.5)

**Sprint 1 (Week 5-6):**
- [x] AI Model Router routes to correct model 95%+ accuracy
- [x] RAG Layer retrieves relevant context 85%+ precision
- [x] Memory Layer stores and retrieves conversation history
- [x] Tests passing, 80%+ coverage

**Sprint 2 (Week 7-8):**
- [x] Cost monitoring live with Helicone
- [x] Budget alerts trigger at $500/day
- [x] Base Agent Framework operational
- [x] Prompt Library has 10+ templates

**Sprint 3 (Week 9-10):**
- [x] Guidewire Guru answers student questions (95%+ accuracy)
- [x] Socratic method working (not giving direct answers)
- [x] Resume Builder generates ATS-optimized resumes
- [x] Escalation to human trainers < 5% of queries

**Sprint 4 (Week 11-12):**
- [x] Productivity tracking classifies activities (90%+ accuracy)
- [x] Daily timelines generated for all employees
- [x] Employee AI Twins deliver morning briefings
- [x] Adoption rate: 80%+ employees use AI Twin daily

### Quality Gates

**Code Quality:**
- TypeScript: 0 compilation errors
- ESLint: 0 errors
- Tests: 80%+ coverage on AI services
- Build: <3 minutes

**Performance:**
- AI response time: <2 seconds (95th percentile)
- RAG search: <500ms
- Memory retrieval: <100ms
- Uptime: 99.5%+

**Business Metrics:**
- Budget: <$280K/year total AI spend
- Guidewire Guru: 95%+ accuracy, <5% escalation
- Productivity: 90%+ classification accuracy
- Employee Bots: 80%+ adoption

---

## Related Documentation

- **Architecture Details:** `/docs/planning/AI-ARCHITECTURE-STRATEGY.md` (50+ pages of technical decisions)
- **Use Case Guides:** `/docs/planning/ai-use-cases/` (Implementation details per feature)
- **Epic 2:** Training Academy (depends on AI Infrastructure)
- **Epic 6:** HR & Employee (productivity tracking, AI twins)

---

**Next Epic:** [Epic 2: Training Academy](./epic-02-training-academy.md) (AI Mentor integration)

**Status:** ✅ PLANNED - Ready for Implementation (Week 5-12)

---

*AI Infrastructure is the foundation for all AI-powered features in InTime v3. Build once, use everywhere.*
