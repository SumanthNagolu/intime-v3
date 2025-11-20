# Architect Handoff: Sprint 5 Implementation

**To:** Developer Agent
**From:** Architect Agent
**Date:** 2025-11-20
**Sprint:** Sprint 5 (Week 13-14)
**Status:** ✅ Ready for Implementation

---

## Quick Summary

Sprint 5 delivers:
- **Guidewire Guru:** 5 AI agents (Coordinator + 4 specialists)
- **Resume Matching:** Semantic candidate-job pairing (pgvector)
- **Business Value:** $729K/year savings at $782/year AI cost (932x ROI)

**Key Point:** Everything builds on Sprint 4 infrastructure. No new infrastructure needed!

---

## Answers to PM's 10 Critical Questions

### 1. RAG Indexing Strategy
**Answer:** Manual SQL scripts (not automated cron job)

**Why:** Curriculum changes quarterly, manual ensures quality control, saves cost

**Implementation:** See `/docs/planning/SPRINT-5-ARCHITECTURE.md` section "Database Design" for SQL script

### 2. pgvector Tuning
**Answer:** ivfflat index with lists=100 (not hnsw)

**Why:** Balances speed/accuracy for 10K candidates. Formula: `sqrt(10,000) = 100`

**When to upgrade to hnsw:** If candidate count >100K or search latency >1s

### 3. Socratic Validation
**Who creates 100 test questions:** QA Agent generates diverse questions

**Who validates Socratic compliance:** Human trainer reviews responses

**Automated check:** Runtime validation for direct answer patterns (see architecture doc)

### 4. Resume Quality Validation
**Who reviews samples:** Recruiter reviews 10 generated resumes

**Checklist:** ATS keywords, quantified achievements, action verbs, length, no typos

**Automated:** Quality score 0-100 (keyword density, format validation)

### 5. Matching Validation Dataset
**Who creates requisitions:** Recruiter creates 20 diverse job requisitions

**Who labels pairs:** Recruiter labels 1,000 pairs (20 reqs × 50 candidates) as relevant (yes/no)

**Accuracy calculation:** (relevant matches / total matches) × 100. Target: 85%+

### 6. Cost Optimization
**Strategy:** GPT-4o-mini generates resume → validate quality → upgrade to GPT-4o if quality <80%

**Expected:** 80% pass with GPT-4o-mini, 20% need GPT-4o upgrade

**Savings:** $117.60 (78% cost reduction vs. all GPT-4o)

### 7. Escalation Workflow
**Channel:** Slack notification to #trainers

**Triggers:** 5+ same question, student frustration, technical issues, complex career advice

**Workflow:** Slack alert → Trainer views context in dashboard → Responds to student → Marks resolved

### 8. Multi-Tenancy
**Shared:** Guidewire curriculum, interview questions (universal content)

**Org-specific:** Candidate profiles, job requisitions (RLS enforced via org_id)

**Year 2 B2B:** Other companies get own candidate data, shared curriculum (cost savings)

### 9. Performance
**Current scale:** 1,000 students, 10,000 candidates (handles easily)

**Benchmarks:** All operations <500ms to <5s (see architecture doc for full table)

**Bottleneck:** API rate limits (not database/compute). Upgrade to OpenAI tier 2 if needed.

### 10. Testing
**Load testing:** Simulate 1,000 students with 100 concurrent queries

**Validation datasets:** Mix of automated (80%) + human validation (20%)

**Process:** QA generates test data, Trainer/Recruiter reviews, automated accuracy calculation

---

## Implementation Checklist

### Phase 1: Database (Day 1)

- [ ] Create migration 021_add_sprint_5_features.sql
  - [ ] `generated_resumes` table
  - [ ] `candidate_embeddings` table (with pgvector index)
  - [ ] `requisition_embeddings` table (with pgvector index)
  - [ ] `resume_matches` table
  - [ ] `search_candidates()` function
  - [ ] `calculate_matching_accuracy()` function
  - [ ] All RLS policies
- [ ] Apply migration to staging
- [ ] Verify: `SELECT * FROM v_sprint_5_status;`
- [ ] Create Supabase Storage bucket: `generated-resumes`

### Phase 2: Guidewire Guru Agents (Days 2-8)

**AI-GURU-001: Coordinator Agent (Day 2)**
- [ ] Extend BaseAgent
- [ ] Implement `classifyQuery()` using GPT-4o-mini
- [ ] Route to appropriate specialist agent
- [ ] Implement escalation detection (5+ same question)
- [ ] Slack notification on escalation
- [ ] Unit tests (classification accuracy)

**AI-GURU-002: Code Mentor Agent (Days 3-5)**
- [ ] Extend BaseAgent with enableRAG=true, enableMemory=true
- [ ] Socratic system prompt (NEVER give direct answers)
- [ ] Retrieve curriculum context (RAG: guidewire_curriculum collection)
- [ ] Load conversation history (Memory Layer)
- [ ] Generate Socratic response
- [ ] Runtime Socratic validation
- [ ] Log interaction to `guidewire_guru_interactions`
- [ ] Unit tests (Socratic compliance, accuracy)

**AI-GURU-003: Resume Builder Agent (Day 6)**
- [ ] Extend BaseAgent
- [ ] GPT-4o-mini pre-validation strategy
- [ ] Quality score calculation
- [ ] Upgrade to GPT-4o if quality <80%
- [ ] Export PDF (Supabase Storage)
- [ ] Export DOCX, LinkedIn formats
- [ ] Log to `generated_resumes` table
- [ ] Unit tests (quality validation, format exports)

**AI-GURU-004: Project Planner Agent (Day 7)**
- [ ] Extend BaseAgent
- [ ] Sprint breakdown algorithm
- [ ] Realistic time estimates (based on student skill level)
- [ ] Risk identification
- [ ] Unit tests (plan generation)

**AI-GURU-005: Interview Coach Agent (Day 8)**
- [ ] Extend BaseAgent (use Claude Sonnet for empathetic feedback)
- [ ] STAR method validation
- [ ] Mock interview question bank (RAG: interview_questions)
- [ ] Feedback scoring
- [ ] Unit tests (STAR scoring)

### Phase 3: Resume Matching (Days 9-11)

**AI-MATCH-001: Resume Matching Service**
- [ ] `generateEmbedding()` using text-embedding-3-small
- [ ] `indexCandidate()` - store embedding in `candidate_embeddings`
- [ ] `indexRequisition()` - store embedding in `requisition_embeddings`
- [ ] `findMatches()` - semantic search via pgvector
- [ ] `analyzeMatches()` - deep analysis with GPT-4o-mini
- [ ] Store matches in `resume_matches` table
- [ ] Unit tests (embedding generation, search, analysis)

### Phase 4: API Routes (Day 12)

**tRPC Routers**
- [ ] `/src/server/routers/guidewire-guru.ts`
  - [ ] `ask` mutation (routes to Coordinator)
  - [ ] `generateResume` mutation
  - [ ] `createProjectPlan` mutation
  - [ ] `mockInterview` mutation
  - [ ] `getHistory` query
  - [ ] `provideFeedback` mutation
- [ ] `/src/server/routers/resume-matching.ts`
  - [ ] `findMatches` query
  - [ ] `indexCandidate` mutation
  - [ ] `indexRequisition` mutation
  - [ ] `provideFeedback` mutation
  - [ ] `getAccuracy` query

### Phase 5: Testing (Days 13-14)

**Unit Tests**
- [ ] CoordinatorAgent classification (90%+ accuracy)
- [ ] CodeMentorAgent Socratic compliance (100%)
- [ ] ResumeBuilderAgent quality validation
- [ ] ResumeMatchingService embedding generation
- [ ] ResumeMatchingService semantic search

**Integration Tests**
- [ ] Full Guidewire Guru flow (question → answer → log)
- [ ] Resume generation flow (input → generate → store → export)
- [ ] Resume matching flow (requisition → search → analyze → store)

**E2E Tests (Playwright)**
- [ ] Student asks question → receives Socratic response
- [ ] Student generates resume → downloads PDF
- [ ] Recruiter searches candidates → views matches
- [ ] Escalation flow (5x same question → Slack notification)

**Human Validation**
- [ ] QA generates 100 test questions
- [ ] Trainer reviews Code Mentor responses (95%+ helpful, 100% Socratic)
- [ ] Recruiter reviews 10 sample resumes (90%+ ATS-compliant)
- [ ] Recruiter labels 1,000 match pairs (target: 85%+ accuracy)

---

## Key Implementation Details

### 1. All Agents Extend BaseAgent

```typescript
import { BaseAgent } from '@/lib/ai/agents/BaseAgent';

export class CodeMentorAgent extends BaseAgent<any, any> {
  constructor(config: { orgId: string; userId: string }) {
    super({
      name: 'code_mentor',
      useCase: 'guidewire_guru_code_mentor',
      defaultModel: 'gpt-4o-mini',
      systemPrompt: `[Socratic prompt here]`,
      requiresReasoning: false,
      enableRAG: true,    // Auto-retrieves curriculum context
      enableMemory: true, // Auto-loads conversation history
    });
  }

  async answer(input: { question: string }): Promise<any> {
    // BaseAgent handles RAG, Memory, AI Router, Cost Tracking
    const response = await this.query(
      input.question,
      { conversationId: 'conv-123', userId: 'user-123', userType: 'student' },
      { temperature: 0.7, maxTokens: 300 }
    );

    return response;
  }
}
```

**BaseAgent provides for free:**
- AI Router (model selection)
- Memory Layer (conversation history)
- RAG (context retrieval)
- Cost Tracking (Helicone)

### 2. pgvector Search Pattern

```sql
-- Create ivfflat index
CREATE INDEX idx_candidate_embeddings_vector ON candidate_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- After bulk insert, run ANALYZE
ANALYZE candidate_embeddings;

-- Search function
CREATE FUNCTION search_candidates(
  p_query_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.70,
  p_match_count INT DEFAULT 10
)
RETURNS TABLE (...);
```

### 3. Socratic Validation Pattern

```typescript
function isSocraticResponse(response: string): boolean {
  // Red flags
  const directAnswerPatterns = [
    /^(the answer is|it is|that is)/i,
    /step 1:.*step 2:/i,
    /```.*```/s,
  ];

  // Green flags
  const socraticPatterns = [
    /\?$/,
    /(what|how|why) (do you think|would you)/i,
  ];

  const hasDirectAnswer = directAnswerPatterns.some(p => p.test(response));
  const hasSocraticQuestion = socraticPatterns.some(p => p.test(response));

  return !hasDirectAnswer && hasSocraticQuestion;
}
```

### 4. Cost Optimization Pattern (Resume Builder)

```typescript
// Step 1: Generate with GPT-4o-mini
const draft = await this.query({ type: 'simple', prompt });

// Step 2: Validate quality
const score = this.validateResume(draft);

// Step 3: Upgrade if needed
if (score < 80) {
  return await this.query({ type: 'reasoning', prompt });  // GPT-4o
}

return draft;
```

---

## File Structure

```
intime-v3/
├── src/
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── agents/
│   │   │   │   ├── guru/
│   │   │   │   │   ├── CoordinatorAgent.ts     (NEW)
│   │   │   │   │   ├── CodeMentorAgent.ts      (NEW)
│   │   │   │   │   ├── ResumeBuilderAgent.ts   (NEW)
│   │   │   │   │   ├── ProjectPlannerAgent.ts  (NEW)
│   │   │   │   │   └── InterviewCoachAgent.ts  (NEW)
│   │   │   ├── resume-matching/
│   │   │   │   └── ResumeMatchingService.ts     (NEW)
│   │   ├── db/
│   │   │   └── migrations/
│   │   │       └── 021_add_sprint_5_features.sql (NEW)
│   ├── server/
│   │   └── routers/
│   │       ├── guidewire-guru.ts                (NEW)
│   │       └── resume-matching.ts               (NEW)
├── tests/
│   ├── unit/
│   │   ├── CoordinatorAgent.test.ts             (NEW)
│   │   ├── CodeMentorAgent.test.ts              (NEW)
│   │   ├── ResumeMatchingService.test.ts        (NEW)
│   ├── integration/
│   │   ├── guidewire-guru-flow.test.ts          (NEW)
│   │   └── resume-matching-flow.test.ts         (NEW)
│   └── e2e/
│       ├── guidewire-guru.spec.ts               (NEW)
│       └── resume-matching.spec.ts              (NEW)
```

---

## Testing Commands

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Full test suite
npm run test

# Test coverage report
npm run test:coverage
```

---

## Deployment Commands

```bash
# 1. Apply migration
psql $DATABASE_URL < src/lib/db/migrations/021_add_sprint_5_features.sql

# 2. Verify migration
psql $DATABASE_URL -c "SELECT * FROM v_sprint_5_status;"

# 3. Index RAG collections (manual)
node scripts/index-rag-collections.ts

# 4. Deploy to Vercel
git push origin main

# 5. Smoke test
npm run test:e2e:production
```

---

## Success Criteria

Before marking Sprint 5 complete, verify:

- [ ] All tests passing (unit + integration + E2E)
- [ ] Code Mentor: 95%+ helpful responses (validated on 100 questions)
- [ ] Code Mentor: 100% Socratic compliance (no direct answers)
- [ ] Resume Builder: 90%+ ATS-compliant resumes (recruiter review)
- [ ] Resume Matching: 85%+ accuracy (validated on 1,000 pairs)
- [ ] Response time: <2s (95th percentile, all agents)
- [ ] Cost tracking: <$10/day in Helicone
- [ ] Escalation rate: <5% (if higher, tune threshold)
- [ ] No critical Sentry errors

---

## Key Risks & Mitigations

### Risk 1: Socratic Compliance <95%
**If:** Automated validation detects direct answers
**Then:** Strengthen system prompt, add more examples, consider Claude Sonnet

### Risk 2: Resume Matching Accuracy <85%
**If:** Recruiter feedback shows low relevance
**Then:** Increase similarity threshold (0.70 → 0.75), upgrade embedding model

### Risk 3: Cost Overruns
**If:** Helicone shows >$100/day
**Then:** Enable rate limiting, reduce capture frequency, downgrade models

### Risk 4: Performance Degradation
**If:** Search latency >1s
**Then:** Upgrade ivfflat → hnsw, partition by org, add more indexes

---

## Reference Documents

- **Full Architecture:** `/docs/planning/SPRINT-5-ARCHITECTURE.md` (50+ pages)
- **PM Requirements:** `/docs/planning/PM-HANDOFF-SPRINT-5-EPIC-2.5.md`
- **PM Summary:** `/docs/planning/SPRINT-5-PM-SUMMARY.md`
- **Sprint 4 Arch:** `/docs/planning/SPRINT-4-ARCHITECTURE.md` (BaseAgent reference)

---

## Support

**Questions?** Architect Agent available for clarifications

**Blockers?** Escalate immediately (don't wait)

**Status Updates:** Daily standup + end-of-sprint demo

---

**Status:** ✅ Architecture Complete - Ready for Implementation

**Estimated Effort:** 128 hours (2 weeks, 2 developers)

**Expected Delivery:** End of Week 14

**Next Action:** Developer begins Phase 1 (Database migration)

---

**Architect Agent**
Date: 2025-11-20
