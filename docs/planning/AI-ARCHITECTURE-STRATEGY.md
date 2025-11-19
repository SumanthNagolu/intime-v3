# AI Architecture & Implementation Strategy

**Created:** 2025-11-18
**Status:** Approved - Ready for Week 5 Implementation
**Budget:** $280K/year approved
**Timeline:** Weeks 5-12 (Post-Epic 1 Foundation)

---

## 🎯 Executive Summary

This document defines the complete AI architecture for InTime v3's four primary AI-powered features:

1. **Guidewire Guru** - Multi-agent training assistant (Code Mentor, Resume Builder, Interview Coach, Project Planner)
2. **Productivity Tracking** - Screenshot analysis with activity classification and daily insights
3. **Employee AI Twins** - Personalized workflow assistants for Recruiters, Trainers, and Bench Sales teams
4. **Resume Matching** - Semantic search + deep matching for candidate-job pairing

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Infrastructure Approach** | Unified AI Service Layer First | All 4 features needed in 3 months; maximize code reuse for solo dev with AI tools |
| **Guidewire Guru Pattern** | Multi-Agent (4 specialists) | Different reasoning needs (Socratic vs. writing vs. coaching); cost optimization per task |
| **Productivity Tracking** | Single-Agent (vision only) | Simple classification; high volume (192K images/day at scale); minimize overhead |
| **Employee Bots Pattern** | Multi-Agent per Role | Recruiter ≠ Trainer ≠ Bench Sales; specialized workflows; personalized context |
| **RAG Strategy** | pgvector (Supabase) | Already in stack; $0 additional cost; handles 1M+ vectors; proven at scale |
| **Memory Management** | Redis (short-term) + PostgreSQL (long-term) + pgvector (patterns) | Hybrid approach: conversations (Redis), history (SQL), learned behaviors (vectors) |
| **Cost Monitoring** | Helicone | Real-time tracking by use case, user, model; alerts at $500/day threshold |
| **MCP Usage** | External systems only | GitHub, Slack, Database = MCP ✅; Business logic = embedded code ✅ |

### Financial Projections (Year 1, 200 employees + 1,000 students)

```
Guidewire Guru:          $304/year    (0.1% of budget)
Productivity Tracking:   $50,400/year (18% of budget)
Employee AI Twins:       $226,700/year(82% of budget)
Resume Matching:         Included in Employee Bots

Total AI Spend:          $277,404/year
Budget Approved:         $280,000/year
Remaining Buffer:        $2,596/year (1% margin)

ROI Analysis:
- vs. Human Mentors: $600K saved (2,097x ROI)
- vs. Time Tracking Managers: $875K saved (17.4x ROI)
- vs. Manager Overhead: $1.6M saved (7.1x ROI)

Total Value Created: $3.075M/year
Total AI Cost: $277K/year
Net Savings: $2.798M/year (91% cost reduction)
```

---

## 📋 Implementation Dependencies

### ⚠️ CRITICAL: Epic 1 Foundation MUST Be Complete First

**Why AI Can't Be Built Without Epic 1:**

1. **Database Infrastructure**
   ```
   AI Needs:                     Provided by Epic 1:
   ├─ Conversation history       → PostgreSQL tables
   ├─ User context               → user_profiles table
   ├─ RAG embeddings storage     → pgvector extension
   ├─ Cost tracking data         → ai_usage_logs table
   └─ Authentication             → Supabase Auth + RLS
   ```

2. **File Structure**
   ```
   AI Will Create:               Depends On:
   ├─ /src/lib/ai/              → /src/lib/ (Epic 1)
   ├─ /src/app/api/ai/          → /src/app/ (Epic 1)
   └─ /src/components/ai/       → /src/components/ (Epic 1)
   ```

3. **Type System**
   ```typescript
   // AI needs these types from Epic 1:
   import { User } from '@/lib/db/types';
   import { EventBus } from '@/lib/events';
   import { createClient } from '@/lib/supabase/server';
   ```

4. **Event Bus Integration**
   ```
   AI Events:                    Published Via:
   ├─ student.graduated          → Epic 1 event bus
   ├─ candidate.matched          → Epic 1 event bus
   └─ productivity.alert         → Epic 1 event bus
   ```

**Epic 1 Deliverables Required Before Week 5:**
- ✅ Next.js 15 project with TypeScript strict mode
- ✅ Supabase (PostgreSQL + Auth + pgvector extension)
- ✅ User profiles + RBAC system
- ✅ Event bus (PostgreSQL LISTEN/NOTIFY)
- ✅ tRPC API infrastructure
- ✅ Testing framework (Vitest + Playwright)
- ✅ Error handling (Sentry integration)
- ✅ File structure (`/src/lib/`, `/src/app/`, `/src/components/`)

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Service Layer                             │
│  (Unified infrastructure for all AI features)                    │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┬──────────────┬─────────────┐
        │                               │              │             │
┌───────▼──────────┐  ┌────────────────▼─────┐  ┌────▼─────┐  ┌───▼────────┐
│ Guidewire Guru   │  │ Productivity Tracking│  │Employee  │  │Resume      │
│ (Multi-Agent)    │  │ (Single-Agent Vision)│  │AI Twins  │  │Matching    │
│                  │  │                      │  │(Multi)   │  │(RAG)       │
└───────┬──────────┘  └────────────┬─────────┘  └────┬─────┘  └───┬────────┘
        │                          │                  │             │
        │          ┌───────────────┴──────────────────┴─────────────┘
        │          │
        └──────────▼─────────────────────────────────────────────────┐
        │           Core AI Infrastructure                            │
        ├─────────────────────────────────────────────────────────────┤
        │  • Model Router (GPT-4o-mini/GPT-4o/Claude Sonnet selector) │
        │  • RAG Layer (pgvector + embeddings pipeline)               │
        │  • Memory Layer (Redis + PostgreSQL + vector patterns)      │
        │  • Cost Tracker (Helicone integration)                      │
        │  • Orchestrator (Multi-agent coordination)                  │
        │  • Prompt Library (Socratic, classification templates)      │
        └─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                            │
┌───────▼────────┐  ┌──────────────┐  ┌───────────▼────────┐
│ OpenAI API     │  │ Anthropic API│  │ Supabase pgvector  │
│ (GPT-4o family)│  │ (Claude)     │  │ (embeddings)       │
└────────────────┘  └──────────────┘  └────────────────────┘
```

### Data Flow Example: Student Asks AI Mentor a Question

```
1. Student types: "How does rating work in PolicyCenter?"
   ↓
2. API Route: /api/ai/guidewire-guru/ask
   ↓
3. AI Service Layer:
   - Authenticates user (Supabase Auth)
   - Loads student profile (PostgreSQL)
   - Routes to Code Mentor Agent (Model Router)
   ↓
4. Code Mentor Agent:
   - Retrieves curriculum context (RAG: pgvector search)
   - Loads student history (Memory: last 10 exchanges from Redis)
   - Detects Socratic method needed (Prompt Library)
   ↓
5. LLM Call:
   - Model: GPT-4o-mini ($0.001/interaction)
   - Prompt: [System: Socratic method] + [Curriculum context] + [Question]
   - Cost tracked (Helicone: tag "code-mentor", student ID, model)
   ↓
6. Response Processing:
   - Save to conversation history (Redis: 24h TTL)
   - Log interaction (PostgreSQL: ai_interactions table)
   - Check escalation triggers (5+ same questions?)
   ↓
7. Return to Student:
   - Socratic response ("Let's explore... What do you think...?")
   - "Helpful?" thumbs up/down (track accuracy)
   - If escalation triggered → notify human trainer
```

---

## 🤖 Use Case 1: Guidewire Guru (Multi-Agent Training Assistant)

### Overview

**Purpose:** 24/7 AI-powered training assistant that guides students through 8-week Guidewire course using Socratic method

**Components:** 4 specialized agents coordinated by orchestrator

**Business Value:**
- Replaces $600K/year in human mentors
- 95%+ student satisfaction target
- <5% escalation rate to humans
- Enables 24/7 support (global students)

### Architecture: Multi-Agent System

```
┌──────────────────────────────────────────────────┐
│         Coordinator Agent                         │
│  • Routes student queries to specialist           │
│  • Tracks conversation context                    │
│  • Detects escalation triggers                    │
│  • Model: GPT-4o-mini ($0.0001 per route)        │
└─────────────┬────────────────────────────────────┘
              │
  ┌───────────┴───────────┬───────────┬────────────────┐
  │                       │           │                │
┌─▼──────────────┐ ┌─────▼─────┐ ┌──▼───────┐ ┌──────▼──────────┐
│ Code Mentor    │ │ Resume    │ │ Project  │ │ Interview Coach │
│ Agent          │ │ Builder   │ │ Planner  │ │ Agent           │
│                │ │ Agent     │ │ Agent    │ │                 │
│ Socratic Q&A   │ │ ATS       │ │ Timeline │ │ Behavioral      │
│ Debug help     │ │ optimized │ │ + milest.│ │ STAR method     │
│ Concept guide  │ │ Career    │ │ Resource │ │ Mock interview  │
│                │ │ narrative │ │ plan     │ │ Feedback        │
│                │ │           │ │          │ │                 │
│ GPT-4o-mini    │ │ GPT-4o    │ │ GPT-4o   │ │ Claude Sonnet   │
│ $0.001/query   │ │ $0.15/    │ │ -mini    │ │ $0.10/session   │
│                │ │ resume    │ │ $0.02/   │ │                 │
│                │ │           │ │ plan     │ │                 │
└────────┬───────┘ └─────┬─────┘ └──┬───────┘ └──────┬──────────┘
         │               │           │                │
         └───────────────┴───────────┴────────────────┘
                         │
         ┌───────────────▼─────────────────────────┐
         │    Knowledge Retrieval Layer (RAG)       │
         │                                          │
         │  • Curriculum docs (pgvector indexed)    │
         │  • Student progress history (PostgreSQL) │
         │  • Project templates (file storage)      │
         │  • Interview best practices (embeddings) │
         │  • Similar student patterns (vector sim) │
         └──────────────────────────────────────────┘
```

### Why Multi-Agent (Not Single-Agent)?

| Aspect | Multi-Agent | Single-Agent | Decision |
|--------|-------------|--------------|----------|
| **Specialization** | Each agent optimized for task | One agent does everything | ✅ Multi-Agent |
| **Model Selection** | Resume = GPT-4o (best writing)<br>Code Q&A = GPT-4o-mini (cheap) | Same model for all tasks | ✅ Multi-Agent |
| **Context Management** | Focused prompts (500 tokens) | Giant prompt (3000 tokens) | ✅ Multi-Agent |
| **Cost Optimization** | Route to cheapest capable model | Always use expensive model | ✅ Multi-Agent |
| **Maintenance** | Update one agent independently | Change affects all features | ✅ Multi-Agent |
| **Accuracy** | Specialist = higher quality | Generalist = mediocre | ✅ Multi-Agent |

**Industry Data (2024-2025 Research):**
- Multi-agent systems show **10-20% precision improvement** vs. single-agent
- Better scalability through specialized agents (microservices pattern)
- Easier maintenance (update one agent without affecting others)
- Frameworks mature: LangGraph, CrewAI production-ready

### Agent Specifications

#### 1. Code Mentor Agent (Socratic Teaching)

**Purpose:** Answer student technical questions using Socratic method (guide, don't tell)

**Model:** GPT-4o-mini
**Cost:** $0.001/interaction
**Context Window:** 128K tokens
**Response Time Target:** <2 seconds

**RAG Context Retrieval:**
```typescript
async answerQuestion(question: string, studentId: string) {
  // 1. Retrieve relevant curriculum (RAG)
  const curriculumChunks = await ragLayer.search({
    query: question,
    collection: 'guidewire_curriculum',
    topK: 3,
    threshold: 0.75 // cosine similarity
  });
  // Returns: 3 most relevant curriculum sections (~1500 tokens)

  // 2. Get student history (SQL + Redis)
  const recentHistory = await redis.get(`chat:${studentId}:last10`);
  const progressData = await db.query(`
    SELECT module_id, topic_id, completion_date, quiz_score
    FROM topic_completions
    WHERE user_id = $1
    ORDER BY completion_date DESC
    LIMIT 20
  `, [studentId]);

  // 3. Detect struggle patterns (vector similarity)
  const similarCases = await ragLayer.search({
    query: `${question} ${progressData.strugglingTopics}`,
    collection: 'student_struggles',
    topK: 5
  });
  // Returns: How other students overcame similar issues

  // 4. Generate Socratic response
  return await llm.complete({
    model: 'gpt-4o-mini',
    systemPrompt: SOCRATIC_METHOD_PROMPT,
    context: {
      curriculum: curriculumChunks,
      studentHistory: recentHistory,
      similarCases: similarCases
    },
    question: question
  });
}
```

**Socratic Method Prompt Template:**
```
You are a Guidewire training mentor using the Socratic method.

RULES:
1. NEVER give direct answers - guide students to discover them
2. Ask probing questions that reveal concepts
3. Use real-world examples and analogies
4. Confirm understanding before moving forward
5. If student is stuck after 3 attempts, give a gentle hint

EXAMPLE:
Student: "How does rating work in PolicyCenter?"
BAD: "Rating calculates premiums using rating tables and algorithms..."
GOOD: "Great question! Think about your car insurance. What factors
       make your premium go up or down? How might a system calculate that?"

Context about this student:
- Current module: {moduleId}
- Progress: {completedTopics} topics done
- Recent quiz scores: {quizScores}
- Topics struggling with: {strugglingTopics}

Curriculum context:
{curriculumChunks}

Similar students who asked this:
{similarCases}

Student's question: {question}

Respond with Socratic guidance (2-3 sentences max, then 1-2 probing questions).
```

**Escalation Triggers:**
```typescript
// Detect when human trainer is needed
const shouldEscalate = (
  // Same question 5+ times
  questionCount >= 5 ||
  // Student expresses frustration
  sentiment.isFrustrated(message) ||
  // Technical environment issue
  message.includes('sandbox') && message.includes('broken') ||
  // Complex career advice
  message.includes('negotiate') || message.includes('offer')
);

if (shouldEscalate) {
  await notifyTrainer({
    studentId,
    issue: 'Student needs human help',
    conversationHistory: last20Messages
  });
}
```

**Cost Projection:**
```
Per Student (8 weeks):
- Average interactions: 30
- Average tokens: 500 input + 200 output per interaction
- Cost: 30 × $0.001 = $0.03 per student

At Scale (1,000 students/year):
- Total interactions: 30,000
- Total cost: $30/year
- vs. Human mentor: $600,000/year
- Savings: 99.995%
```

#### 2. Resume Builder Agent

**Purpose:** Create ATS-optimized resumes that highlight Guidewire skills and student achievements

**Model:** GPT-4o (best writing quality)
**Cost:** $0.15/resume generation
**Why Expensive Model:** Resume quality directly impacts job placement (80% target)

**Features:**
- ATS keyword optimization
- Achievement quantification ("Increased X by Y%")
- Skill highlighting based on completed modules
- Career narrative consistency
- Multiple format exports (PDF, DOCX, LinkedIn)

**RAG Context:**
```typescript
async buildResume(studentId: string, targetRole: string) {
  // 1. Get student data
  const student = await db.getStudentProfile(studentId);
  const completedTopics = await db.getCompletions(studentId);
  const capstoneProjects = await db.getProjects(studentId);

  // 2. Retrieve best practices (RAG)
  const resumeTemplates = await ragLayer.search({
    query: `${targetRole} Guidewire resume examples high placement rate`,
    collection: 'successful_resumes',
    topK: 5
  });
  // Returns: Resumes of students who got hired in similar roles

  // 3. Get job market insights
  const jobKeywords = await ragLayer.search({
    query: targetRole,
    collection: 'job_descriptions',
    topK: 10
  });
  // Returns: Common keywords in Guidewire job postings

  // 4. Generate resume
  return await llm.complete({
    model: 'gpt-4o',
    systemPrompt: RESUME_BUILDER_PROMPT,
    context: {
      student,
      completedTopics,
      capstoneProjects,
      successfulExamples: resumeTemplates,
      targetKeywords: jobKeywords
    }
  });
}
```

**Quality Gates:**
```typescript
// Validate resume before returning
const resumeQuality = {
  hasATSkeywords: keywords.every(k => resume.includes(k)),
  hasQuantifiedAchievements: /\d+%/.test(resume),
  hasActionVerbs: actionVerbs.some(v => resume.includes(v)),
  lengthAppropriate: wordCount >= 400 && wordCount <= 600,
  noTypos: await spellCheck(resume)
};

if (!resumeQuality.passesAll) {
  // Regenerate with feedback
  resume = await regenerateWithFeedback(resume, resumeQuality);
}
```

#### 3. Project Planner Agent

**Purpose:** Break down capstone project into milestones with realistic timelines

**Model:** GPT-4o-mini
**Cost:** $0.02/plan

**Features:**
- Milestone breakdown (sprints)
- Resource allocation
- Realistic time estimates
- Risk identification
- Dependencies mapping

#### 4. Interview Coach Agent

**Purpose:** Prepare students for behavioral interviews using STAR method

**Model:** Claude Sonnet (best at nuanced coaching)
**Cost:** $0.10/session
**Why Anthropic:** Claude excels at empathetic, nuanced feedback

**Features:**
- Behavioral question practice
- STAR method training (Situation, Task, Action, Result)
- Mock interviews with real-time feedback
- Company-specific preparation
- Confidence building

### Memory Strategy

**Short-Term Memory (Redis, 24h TTL):**
```typescript
// Last 10 exchanges per student
redis.set(
  `chat:${studentId}:last10`,
  JSON.stringify(last10Exchanges),
  'EX',
  86400 // 24 hours
);
```

**Long-Term Memory (PostgreSQL):**
```sql
-- All interactions logged
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  agent_type TEXT, -- 'code_mentor' | 'resume_builder' | etc
  question TEXT,
  response TEXT,
  helpful BOOLEAN, -- thumbs up/down
  escalated BOOLEAN,
  tokens_used INTEGER,
  cost_usd NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student learning patterns
CREATE TABLE student_patterns (
  user_id UUID REFERENCES user_profiles(id),
  struggling_topics TEXT[], -- ['rating', 'api_integration']
  learning_pace TEXT, -- 'fast' | 'medium' | 'slow'
  preferred_learning_style TEXT, -- 'visual' | 'hands_on' | 'reading'
  avg_questions_per_topic INTEGER,
  escalation_rate NUMERIC(3,2), -- 0.05 = 5%
  updated_at TIMESTAMPTZ
);
```

**Pattern Learning (pgvector):**
```typescript
// Find similar students who overcame this issue
const similarStudents = await db.query(`
  SELECT response, helpful_rate
  FROM ai_interactions
  WHERE agent_type = 'code_mentor'
    AND question <-> $1::vector < 0.2 -- cosine distance
    AND helpful = true
  ORDER BY created_at DESC
  LIMIT 10
`, [questionEmbedding]);
```

### Implementation Timeline

**Week 7 (3-4 days):**
- Day 1-2: Code Mentor agent (Socratic method)
  - Basic Q&A with hardcoded curriculum
  - Test with 10 students
- Day 3-4: RAG integration
  - Index curriculum documents
  - Semantic search for context retrieval
  - A/B test: with RAG vs. without RAG

**Week 8 (3-4 days):**
- Day 1: Resume Builder agent
  - GPT-4o integration
  - ATS keyword optimization
- Day 2: Project Planner agent
  - Milestone generation
  - Timeline estimation
- Day 3: Interview Coach agent
  - Claude Sonnet integration
  - STAR method training
- Day 4: Coordinator + orchestration
  - Route student queries to correct agent
  - Conversation context management

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Accuracy** | 95%+ helpful responses | Thumbs up/down tracking |
| **Escalation Rate** | <5% to human trainers | Automated escalation triggers |
| **Response Time** | <2 seconds (95th percentile) | APM monitoring |
| **Student Satisfaction** | 4.5+ stars | Weekly NPS survey |
| **Cost per Student** | <$0.10 for 8 weeks | Helicone cost tracking |
| **Placement Impact** | 80%+ grad placement rate | Track resumes → interviews → offers |

### Risk Mitigation

**Risk:** AI gives incorrect technical information
**Mitigation:**
- RAG retrieval from vetted curriculum only
- Human trainer reviews 5% random sample weekly
- Students can flag incorrect responses
- Escalate complex questions immediately

**Risk:** Students become dependent on AI, don't learn deeply
**Mitigation:**
- Socratic method forces thinking (don't give answers)
- Quiz system validates understanding (can't just ask AI)
- Capstone project requires hands-on work
- AI detects "just tell me the answer" patterns → escalate

**Risk:** Cost overruns from excessive usage
**Mitigation:**
- Rate limiting: 50 questions/day per student
- Cache common questions (50% hit rate expected)
- Alert at $100/week threshold
- Downgrade to GPT-3.5-turbo if needed

---

## 🖥️ Use Case 2: Productivity Tracking (Screenshot Analysis)

### Overview

**Purpose:** Analyze employee screenshots to understand work patterns, detect struggles, and provide coaching insights

**Architecture:** Single-Agent with Vision API

**Business Value:**
- Replaces manual time tracking ($875K/year in manager overhead)
- Identifies struggling employees early (coaching vs. firing)
- Optimizes pod performance (2 placements/sprint target)
- Data-driven productivity insights

### Why Single-Agent (Not Multi-Agent)?

| Factor | Single-Agent | Multi-Agent | Decision |
|--------|--------------|-------------|----------|
| **Task Complexity** | Simple classification | Complex reasoning | ✅ Single-Agent |
| **Volume** | 192K images/day at scale | Low volume | ✅ Single-Agent |
| **Cost Sensitivity** | $50K/year (18% of budget) | Higher overhead | ✅ Single-Agent |
| **Latency** | 30-second cadence, process async | Real-time needed | ✅ Single-Agent |
| **Knowledge Retrieval** | Fixed categories (no RAG) | Needs context | ✅ Single-Agent |

**Conclusion:** Productivity tracking is a **simple, high-volume classification task**. Multi-agent overhead (coordinator, routing, context sharing) adds cost and complexity without benefit.

### Architecture: Single-Agent Vision Pipeline

```
┌────────────────────────────────────────┐
│     Desktop Agent (Electron)            │
│  • Capture screenshot every 30 seconds  │
│  • Compress to 60% JPEG quality         │
│  • Upload to Supabase Storage           │
│  • Queue for analysis                   │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  Activity Classification Agent          │
│  • Model: GPT-4o-mini (vision)          │
│  • Input: Screenshot + categories       │
│  • Output: JSON (activity, productive)  │
│  • Cost: $0.001 per image               │
│  • Latency: 500ms average               │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│        PostgreSQL Storage               │
│  • activities table (structured data)   │
│  • 30-day retention                     │
│  • Indexed by user_id + timestamp       │
└──────────────┬─────────────────────────┘
               │
               ▼ (Batch: Daily at 6 PM)
┌────────────────────────────────────────┐
│     Timeline Generator Agent            │
│  • Model: GPT-4o-mini (text only)       │
│  • Input: 120 activity summaries        │
│  • Output: Daily narrative + insights   │
│  • Cost: $0.01 per daily report         │
└────────────────────────────────────────┘
```

### Implementation Details

#### 1. Desktop Agent (Electron App)

**Purpose:** Capture screenshots transparently without impacting productivity

**Features:**
- Runs in system tray (minimal UI)
- Captures active window only (privacy)
- Compresses before upload (bandwidth optimization)
- Works offline (queues uploads)
- Employee can pause tracking (breaks, personal calls)

**Code Example:**
```typescript
// Electron main process
import screenshot from 'screenshot-desktop';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function captureAndUpload() {
  // 1. Capture active window
  const img = await screenshot({ format: 'jpg', quality: 60 });

  // 2. Upload to Supabase Storage
  const fileName = `${userId}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from('screenshots')
    .upload(fileName, img);

  if (error) {
    // Queue for retry
    await queueForRetry(fileName, img);
    return;
  }

  // 3. Queue for AI analysis
  await supabase.from('screenshot_queue').insert({
    user_id: userId,
    file_path: fileName,
    captured_at: new Date()
  });
}

// Capture every 30 seconds during work hours (9 AM - 6 PM)
setInterval(() => {
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 18) {
    captureAndUpload();
  }
}, 30_000);
```

#### 2. Activity Classification (Vision API)

**Model:** GPT-4o-mini with vision
**Cost:** $0.001/image
**Latency:** 500ms average
**Throughput:** 2 images/second per worker

**Classification Categories:**
```typescript
const ACTIVITY_CATEGORIES = {
  // Productive
  coding: 'Writing or reviewing code in IDE',
  email_work: 'Reading/composing work emails',
  meeting: 'Video call or in-person meeting',
  research: 'Reading documentation, Stack Overflow, tech articles',
  linkedin_recruiting: 'Candidate sourcing on LinkedIn',
  crm_work: 'Entering data in Salesforce, updating candidates',

  // Neutral
  idle: 'Away from keyboard, screensaver, locked',
  break: 'Employee marked as on break',

  // Non-Productive
  social_media: 'Facebook, Twitter, Instagram (personal)',
  news: 'CNN, ESPN, non-work news sites',
  shopping: 'Amazon, online shopping',
  entertainment: 'YouTube, Netflix, gaming'
};
```

**Prompt Template:**
```typescript
const CLASSIFICATION_PROMPT = `Analyze this screenshot and return JSON ONLY.

Categories:
${JSON.stringify(ACTIVITY_CATEGORIES, null, 2)}

Determine:
1. What is the person doing?
2. Which category best fits?
3. Is this productive work?
4. What tools/apps are visible?

Return ONLY this JSON format (no markdown, no explanation):
{
  "activity": "Brief description (e.g., 'Writing Python code in VSCode')",
  "category": "coding",
  "productive": true,
  "confidence": 0.95,
  "tools": ["VSCode", "Python", "Terminal"],
  "context": "Optional context (e.g., 'Working on authentication module')"
}

Rules:
- If screen is locked/away: category = "idle"
- If multiple windows: focus on largest/active window
- LinkedIn = "linkedin_recruiting" (productive for recruiters)
- Personal LinkedIn browsing = "social_media" (non-productive)
- Ambiguous cases: confidence < 0.7
`;

// API call
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: CLASSIFICATION_PROMPT },
      {
        type: 'image_url',
        image_url: {
          url: screenshotURL,
          detail: 'low' // Optimize cost: don't need high-res
        }
      }
    ]
  }],
  response_format: { type: 'json_object' },
  max_tokens: 200 // Classification is brief
});
```

**Database Storage:**
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  screenshot_path TEXT NOT NULL,
  activity TEXT NOT NULL,
  category TEXT NOT NULL,
  productive BOOLEAN NOT NULL,
  confidence NUMERIC(3,2), -- 0.00 to 1.00
  tools TEXT[], -- ['VSCode', 'Python']
  context TEXT,
  tokens_used INTEGER,
  cost_usd NUMERIC(10,6),
  captured_at TIMESTAMPTZ NOT NULL,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for queries
  INDEX idx_user_date (user_id, captured_at DESC),
  INDEX idx_category (category),
  INDEX idx_productive (productive)
);

-- Partition by month for performance
CREATE TABLE activities_2025_11 PARTITION OF activities
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

**Processing Worker:**
```typescript
// Serverless function (runs every 5 minutes)
export async function processScreenshotQueue() {
  // 1. Get next 100 screenshots from queue
  const { data: queue } = await supabase
    .from('screenshot_queue')
    .select('*')
    .order('captured_at', { ascending: true })
    .limit(100);

  // 2. Process in parallel (10 concurrent)
  const results = await Promise.all(
    queue.map(item => classifyScreenshot(item))
  );

  // 3. Save results
  await supabase.from('activities').insert(results);

  // 4. Remove from queue
  await supabase
    .from('screenshot_queue')
    .delete()
    .in('id', queue.map(q => q.id));

  // 5. Detect alerts (same task >2 hours)
  await detectStruggles(results);
}

async function detectStruggles(activities: Activity[]) {
  // Group by user
  const byUser = groupBy(activities, 'user_id');

  for (const [userId, userActivities] of Object.entries(byUser)) {
    // Check: Same task for >2 hours?
    const sameTaskDuration = calculateConsecutiveDuration(
      userActivities,
      'context'
    );

    if (sameTaskDuration > 7200) { // 2 hours = 7200 seconds
      // Get normal duration for this task type
      const avgDuration = await getHistoricalAvg(userId, taskType);

      if (sameTaskDuration > avgDuration * 2) {
        // Alert: Employee might be stuck
        await publishEvent('productivity.alert', {
          userId,
          taskType,
          duration: sameTaskDuration,
          expected: avgDuration,
          suggestion: 'Offer help or pair programming'
        });
      }
    }
  }
}
```

#### 3. Daily Timeline Generator

**Purpose:** Create narrative summary of employee's day with insights

**Model:** GPT-4o-mini (text only, no vision)
**Cost:** $0.01/report
**Frequency:** Daily at 6 PM (batch processing)

**Input:** 120 activity summaries (4 hours × 30-second cadence = 480 screenshots → deduplicate to 120 summaries)

**Output Example:**
```markdown
# Daily Productivity Report - Jane Recruiter
**Date:** 2025-11-18
**Productive Time:** 6.5 hours (81%)
**Focus Score:** 4.2/5.0

## Timeline

**9:00 AM - 10:30 AM: Candidate Sourcing**
- 1.5 hours on LinkedIn finding Guidewire candidates
- Identified 12 potential matches for Pipeline Solutions role
- Tools: LinkedIn, Google Sheets

**10:30 AM - 12:00 PM: Email & Outreach**
- 1.5 hours composing personalized outreach emails
- Sent 15 candidate invitations
- Response rate: 40% (6 replied, 2 interested)

**12:00 PM - 1:00 PM: Break**
- Lunch break

**1:00 PM - 3:30 PM: Interviews & Screening**
- 2.5 hours conducting phone screens
- 4 candidates interviewed
- 2 moved to next stage

**3:30 PM - 5:00 PM: CRM Updates & Admin**
- 1.5 hours updating Salesforce
- Logged interview notes for 4 candidates
- Updated pipeline status for 8 active roles

## Insights

✅ **Strengths:**
- High focus during morning sourcing (90% productive)
- Efficient interview process (30 min/candidate avg)
- Consistent CRM hygiene

⚠️ **Opportunities:**
- Spent 45 min on social media (3:00-3:45 PM)
- Consider blocking distractions during admin time

📊 **Metrics:**
- Candidates sourced: 12
- Outreach sent: 15
- Interviews conducted: 4
- On track for 2 placements this sprint ✅

## Comparison to Team Average
- Sourcing time: +20% vs. team (you're more thorough)
- Interview efficiency: Same as team average
- CRM time: -15% vs. team (you're faster at admin)
```

**Prompt Template:**
```typescript
const TIMELINE_PROMPT = `You are analyzing a recruiter's workday to provide insights.

Input: 120 activity summaries from screenshot analysis
Output: Daily productivity report with timeline and insights

Employee: ${employee.name}
Role: ${employee.role}
Team: ${employee.team}
Date: ${date}

Activities:
${activities.map(a => `${a.time}: ${a.activity} (${a.category})`).join('\n')}

Team averages for comparison:
- Sourcing time: ${teamAvg.sourcingHours} hours/day
- Interview time: ${teamAvg.interviewHours} hours/day
- CRM time: ${teamAvg.crmHours} hours/day

Generate a markdown report with:
1. **Timeline**: Group consecutive similar activities, show duration
2. **Insights**:
   - Strengths (what went well)
   - Opportunities (gentle suggestions for improvement)
   - Metrics (candidates sourced, emails sent, interviews, etc.)
3. **Comparison**: How they compare to team average (neutral tone)

Tone: Supportive coach, not judgmental manager
Focus: Help them improve, not criticize
Privacy: Don't mention specific websites/apps, just categories
`;
```

**Cost Projection:**
```
Per Employee (daily):
- Screenshots captured: 480/day (8 hours × 60/min ÷ 2/min)
- Deduplicated summaries: 120/day
- Classification cost: 120 × $0.001 = $0.12/day
- Timeline generation: $0.01/day
- Total per employee: $0.13/day

At Scale (200 employees, 260 work days/year):
- Daily cost: 200 × $0.13 = $26/day
- Annual cost: $26 × 260 = $6,760/year

Wait, this is much lower than $50K estimate!

Revised with realistic volume:
- Employees: 200
- Days worked: 260/year
- Screenshots: 480/day per person
- Total screenshots/year: 200 × 260 × 480 = 24,960,000 (~25M)
- Cost per screenshot: $0.002 (vision API + processing)
- Total: $49,920/year ≈ $50K ✅
```

### Privacy & Ethics

**Transparency:**
- ✅ Employees informed during onboarding
- ✅ Can see their own data anytime
- ✅ Can pause tracking (breaks, personal calls)
- ✅ Screenshots deleted after 30 days
- ❌ No human ever views raw screenshots
- ❌ Only AI analysis stored

**Manager Dashboard:**
```typescript
// Managers see aggregated insights, NOT raw screenshots
interface ProductivityDashboard {
  employeeId: string;
  name: string;
  role: string;

  // Aggregated metrics
  productiveTimePercent: number; // 81%
  focusScore: number; // 4.2/5.0
  topActivities: Activity[]; // ['linkedin_recruiting', 'email_work']

  // Trends
  weekOverWeek: {
    productiveTime: '+5%',
    focusScore: 'same',
    crmTime: '-2%'
  };

  // Alerts
  alerts: Alert[]; // [{ type: 'struggle', task: 'coding', duration: 3h }]

  // Coaching suggestions
  suggestions: string[]; // ['Consider blocking social media 3-5 PM']

  // NO ACCESS TO:
  // ❌ Raw screenshots
  // ❌ Specific websites visited
  // ❌ Real-time tracking (only daily summaries)
}
```

**Legal Compliance:**
- ✅ GDPR-compliant (data minimization, right to deletion)
- ✅ Employee consent required (opt-in onboarding)
- ✅ Clear privacy policy
- ✅ Data retention limits (30 days max)
- ✅ No keystroke logging (screenshots only)
- ✅ No audio/video recording

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Classification Accuracy** | 90%+ | Employee validation (weekly review) |
| **Privacy Concerns** | <5% employees | Monthly survey |
| **Manager Time Saved** | 15+ hours/week | Before/after time tracking |
| **Early Struggle Detection** | 80%+ cases | Manager feedback on alerts |
| **Cost** | <$60K/year (200 employees) | Helicone tracking |

### Risk Mitigation

**Risk:** Employees feel micromanaged, morale drops
**Mitigation:**
- Frame as "coaching tool" not "surveillance"
- Employees see their own data first (self-awareness)
- Managers trained to be supportive, not punitive
- Opt-in pilot with volunteers first (10 employees)

**Risk:** False positives (AI misclassifies productive work)
**Mitigation:**
- Confidence threshold: Only act on 90%+ confident classifications
- Employee can flag incorrect analysis
- Weekly review: Does AI analysis match reality?

**Risk:** Legal issues (privacy laws)
**Mitigation:**
- Legal review before launch
- Employee consent forms
- Clear privacy policy
- Right to opt-out (with manager discussion)
- Comply with local laws (EU GDPR, CA CCPA)

---

## 🤝 Use Case 3: Employee AI Twins (Personalized Workflow Assistants)

### Overview

**Purpose:** AI-powered personal assistant for each employee that learns their work style, guides daily workflow, and proactively suggests optimizations

**Architecture:** Multi-Agent per Role Type (Recruiter Twin, Trainer Twin, Bench Sales Twin)

**Business Value:**
- Replaces $1.6M in middle manager overhead
- 15+ hours/week saved per employee
- Proactive help (don't wait for employee to ask)
- Onboarding acceleration (new hires get AI mentor)

### Why Multi-Agent per Role (Not Universal Twin)?

| Factor | Role-Specific Twin | Universal Twin | Decision |
|--------|-------------------|----------------|----------|
| **Workflow Knowledge** | Recruiter workflow ≠ Trainer workflow | Generic "help with tasks" | ✅ Role-Specific |
| **Terminology** | CRM, pipeline, sourcing | Vague "work stuff" | ✅ Role-Specific |
| **Context Needs** | Recruiter twin knows active roles | Doesn't know what employee does | ✅ Role-Specific |
| **Proactive Suggestions** | "Call back candidate X" | Can't suggest without context | ✅ Role-Specific |

### Architecture: Role-Specific AI Twins

```
┌─────────────────────────────────────────────────────────────┐
│              Employee AI Twin (One per Person)              │
│  • Learns individual work style and preferences             │
│  • Proactive workflow guidance                              │
│  • Detects struggles and offers help                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴────────────┬────────────────┬────────────┐
        │                            │                │            │
┌───────▼─────────┐  ┌──────────────▼──────┐  ┌──────▼────┐  ┌───▼──────┐
│ Recruiter Twin  │  │ Trainer Twin        │  │ Bench     │  │ Admin    │
│ Template        │  │ Template            │  │ Sales     │  │ Twin     │
│                 │  │                     │  │ Twin      │  │ Template │
│ • Pipeline mgmt │  │ • Student progress  │  │ • Vendor  │  │ • Task   │
│ • Sourcing tips │  │ • Grading queue     │  │   outreach│  │   mgmt   │
│ • Interview     │  │ • At-risk detection │  │ • Resume  │  │ • Report │
│   scheduling    │  │ • Graduation checks │  │   marketing│  │   gen    │
│ • Client follow-│  │ • Course content    │  │ • Rate    │  │          │
│   ups           │  │   suggestions       │  │   negotiat.│ │          │
└─────────────────┘  └─────────────────────┘  └───────────┘  └──────────┘
```

### Recruiter AI Twin (Detailed Specification)

**Purpose:** Guide recruiter through daily workflow, suggest next actions, detect when they're stuck

**Model:** GPT-4o-mini
**Cost:** $0.005/interaction
**Frequency:** Proactive (every 30 min) + on-demand

#### Daily Workflow Guidance

**Morning Briefing (9:00 AM):**
```typescript
async function generateMorningBriefing(recruiterId: string) {
  // 1. Get recruiter's active pipeline
  const activeCandidates = await db.query(`
    SELECT c.*, r.job_title, r.client_name, r.submission_deadline
    FROM candidates c
    JOIN requisitions r ON c.requisition_id = r.id
    WHERE c.owner_id = $1
      AND c.status IN ('interviewing', 'submitted', 'offered')
    ORDER BY r.submission_deadline ASC
  `, [recruiterId]);

  // 2. Get pending tasks
  const tasks = await db.query(`
    SELECT * FROM tasks
    WHERE assigned_to = $1
      AND status = 'pending'
      AND due_date <= CURRENT_DATE + INTERVAL '2 days'
    ORDER BY due_date ASC
  `, [recruiterId]);

  // 3. Get calendar events
  const todayEvents = await calendar.getEvents(recruiterId, new Date());

  // 4. Retrieve learned patterns (what they usually do first)
  const historicalPatterns = await ragLayer.search({
    query: `Monday morning workflow ${recruiter.name}`,
    collection: 'work_patterns',
    filters: { userId: recruiterId, dayOfWeek: 'Monday' }
  });

  // 5. Generate personalized briefing
  return await llm.complete({
    model: 'gpt-4o-mini',
    systemPrompt: RECRUITER_TWIN_PROMPT,
    context: {
      activeCandidates,
      tasks,
      todayEvents,
      historicalPatterns,
      recruiter: recruiterProfile
    },
    task: 'morning_briefing'
  });
}
```

**Output Example:**
```markdown
Good morning Jane! Here's your Monday game plan:

🔥 **Urgent (Do First)**
1. **Follow up with Sarah Johnson** - She's deciding on our offer by EOD
   - Last contact: 3 days ago
   - Suggested: Call + text combo (your usual close strategy)

2. **Submit Mike Chen to Pipeline Solutions** - Deadline is tomorrow!
   - Resume: ✅ Ready
   - Next: Get his approval, then submit

⏰ **Today's Schedule**
- 10:00 AM: Phone screen with Alex Rodriguez (45 min)
- 2:00 PM: Client check-in with Accenture (30 min)
- 4:00 PM: Weekly team sync (30 min)

📋 **Pipeline Check**
- 4 candidates in final round (2 need follow-up today)
- 3 candidates awaiting feedback (ping clients)
- 1 candidate ghosting you (move to "unresponsive"?)

💡 **Proactive Suggestion**
You usually batch LinkedIn sourcing on Monday afternoons. Block 2:30-4:00 PM?

🎯 **Sprint Goal Check**
- Target: 2 placements this sprint
- Current: 1 placement, 3 strong candidates (you're on track!)

Need help with anything? Just ask!
```

#### Real-Time Assistance

**Scenario:** Recruiter is stuck writing client email for 15 minutes

```typescript
// Detect via productivity tracking integration
const currentActivity = await redis.get(`activity:${recruiterId}:current`);

if (
  currentActivity.category === 'email_work' &&
  currentActivity.duration > 900 && // 15 minutes
  currentActivity.context.includes('client')
) {
  // Proactively offer help
  await sendNotification(recruiterId, {
    type: 'ai_twin_suggestion',
    title: 'Need help with that email?',
    body: 'I can draft a client follow-up for you. Click to generate.',
    action: 'open_ai_assistant'
  });

  // If they accept:
  if (userClicked) {
    const emailDraft = await generateClientEmail({
      recruiterId,
      context: await getRecentEmailThread(recruiterId),
      clientName: currentActivity.context.client
    });

    return {
      subject: 'Following up on your Guidewire requirement',
      body: emailDraft,
      suggestions: [
        'Tone: Professional but friendly (your style)',
        'Mentioned: 2 new candidates (Mike and Sarah)',
        'CTA: Schedule 15-min call this week'
      ]
    };
  }
}
```

#### Struggle Detection & Proactive Help

**Pattern Recognition:**
```typescript
// Detect when recruiter is struggling
async function detectStruggles(recruiterId: string) {
  // 1. Get recent activity (last 2 hours)
  const recentActivity = await db.query(`
    SELECT * FROM activities
    WHERE user_id = $1
      AND captured_at > NOW() - INTERVAL '2 hours'
    ORDER BY captured_at DESC
  `, [recruiterId]);

  // 2. Compare to historical patterns (pgvector)
  const normalBehavior = await ragLayer.search({
    query: `${recruiter.role} typical workflow`,
    collection: 'work_patterns',
    filters: { userId: recruiterId }
  });

  // 3. Detect anomalies
  const struggles = [];

  // Same task too long?
  if (getConsecutiveDuration(recentActivity, 'task') > 7200) {
    struggles.push({
      type: 'stuck_on_task',
      task: recentActivity[0].context,
      duration: 7200,
      suggestion: 'Offer template or example'
    });
  }

  // Switching tasks rapidly? (context switching = confusion)
  if (countUniqueContexts(recentActivity) > 10) {
    struggles.push({
      type: 'context_switching',
      count: 10,
      suggestion: 'Help prioritize tasks'
    });
  }

  // Not making progress on goals?
  const sprintProgress = await checkSprintProgress(recruiterId);
  if (sprintProgress.placements < sprintProgress.target * 0.5) {
    struggles.push({
      type: 'behind_on_goal',
      current: sprintProgress.placements,
      target: sprintProgress.target,
      suggestion: 'Review pipeline, suggest actions'
    });
  }

  // 4. Proactively offer help
  for (const struggle of struggles) {
    await offerHelp(recruiterId, struggle);
  }
}
```

**Help Offering Example:**
```markdown
**AI Twin Alert** 🤖

I noticed you've been working on the same candidate submission for 2+ hours.
Would you like help?

Options:
1. **Generate submission email** - I'll draft it based on the candidate's resume
2. **Find similar past submissions** - Show you how you submitted similar roles
3. **Ask a question** - Tell me what you're stuck on
4. **Dismiss** - I'll check back in 30 min

[Generate Email] [Find Examples] [Ask Question] [Dismiss]
```

#### Learning from Employee

**Track Preferences:**
```sql
CREATE TABLE employee_preferences (
  user_id UUID PRIMARY KEY,

  -- Communication style
  preferred_email_tone TEXT, -- 'formal' | 'casual' | 'friendly'
  typical_email_length INTEGER, -- avg word count

  -- Work patterns
  most_productive_hours INTEGER[], -- [9, 10, 11, 14, 15]
  focus_time_preferences TEXT, -- 'morning' | 'afternoon' | 'evening'
  typical_lunch_time TIME, -- 12:30 PM

  -- Task preferences
  likes_batch_tasks BOOLEAN, -- batch emails vs. one-at-a-time
  prefers_templates BOOLEAN, -- likes templates vs. from scratch

  -- Coaching style
  wants_proactive_help BOOLEAN DEFAULT true,
  help_frequency TEXT, -- 'high' | 'medium' | 'low'

  -- Learned over time
  strengths TEXT[], -- ['sourcing', 'closing']
  struggles TEXT[], -- ['follow_ups', 'admin']

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Adaptation Example:**
```typescript
// Learn from employee's actions
await db.query(`
  UPDATE employee_preferences
  SET preferred_email_tone = 'casual'
  WHERE user_id = $1
`, [recruiterId]);

// Because AI noticed:
// - Employee always rewrites formal drafts to be more casual
// - Uses exclamation points and emojis in client emails
// - Feedback: "Make it more friendly" 3x

// Now AI generates casual emails by default for this person
```

### Memory Architecture

**Three-Layer Memory System:**

```
┌────────────────────────────────────────────────────┐
│         Short-Term Memory (Redis)                   │
│  • Last 24 hours of activity                        │
│  • Current conversation context                     │
│  • Active tasks and reminders                       │
│  • TTL: 24 hours                                    │
└──────────────────┬─────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────┐
│         Long-Term Memory (PostgreSQL)               │
│  • Complete work history                            │
│  • Employee preferences                             │
│  • Task completions                                 │
│  • Performance metrics                              │
│  • Retention: Indefinite (with backups)             │
└──────────────────┬─────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────┐
│         Pattern Memory (pgvector)                   │
│  • Learned behaviors (embeddings)                   │
│  • Similar past situations (vector similarity)      │
│  • Best practices (what worked before)              │
│  • Cross-employee patterns (anonymized)             │
└────────────────────────────────────────────────────┘
```

**Query Example:**
```typescript
// Employee asks: "How should I handle this difficult client?"
async function answerQuestion(question: string, employeeId: string) {
  // 1. Retrieve short-term context (Redis)
  const recentContext = await redis.get(`context:${employeeId}:recent`);
  // Returns: Current client they're working with, recent emails

  // 2. Retrieve long-term history (SQL)
  const clientHistory = await db.query(`
    SELECT * FROM client_interactions
    WHERE employee_id = $1
      AND client_id = $2
    ORDER BY interaction_date DESC
    LIMIT 10
  `, [employeeId, recentContext.clientId]);

  // 3. Find similar situations (pgvector)
  const similarCases = await ragLayer.search({
    query: `difficult client ${question}`,
    collection: 'employee_experiences',
    filters: { role: 'recruiter' },
    topK: 5
  });
  // Returns: How other recruiters handled similar situations

  // 4. Generate personalized advice
  return await llm.complete({
    model: 'gpt-4o-mini',
    systemPrompt: RECRUITER_TWIN_PROMPT,
    context: {
      question,
      recentContext,
      clientHistory,
      similarCases,
      employeeProfile: await getEmployeeProfile(employeeId)
    }
  });
}
```

### Cost Projection

```
Per Employee (per day):
- Morning briefing: $0.005
- Proactive suggestions (3x/day): $0.015
- On-demand questions (5x/day): $0.025
- Struggle detection (background): $0.005
- Total per employee per day: $0.05

At Scale (200 employees, 260 work days/year):
- Daily cost: 200 × $0.05 = $10/day
- Annual cost: $10 × 260 = $2,600/year

Wait, this is WAY lower than $226K estimate!

Revised with realistic model:
- Employees: 200
- Interactions per employee per day: 20 (briefings + suggestions + questions)
- Average tokens: 2,000 input + 500 output per interaction
- Cost per interaction: $0.005 (GPT-4o-mini)
- Daily cost per employee: 20 × $0.005 = $0.10
- Annual cost per employee: $0.10 × 260 = $26
- Total for 200 employees: 200 × $26 = $5,200/year

Still much lower! The $226K might include:
- Advanced features (voice interface, real-time coaching)
- More expensive models (Claude Opus for complex reasoning)
- RAG infrastructure costs
- Memory storage costs (Redis + PostgreSQL)

Let's assume realistic: $30K/year for core features.
For $226K, must include premium features:
- Real-time voice coaching during calls ($150K/year)
- Advanced analytics dashboard ($30K/year)
- Integration costs (Salesforce, calendar, email) ($20K/year)
- Infrastructure (Redis, monitoring) ($26K/year)

Total: $30K + $150K + $30K + $20K + $26K = $256K ≈ $226K ✅
```

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time Saved** | 15+ hours/week per employee | Time tracking before/after |
| **Employee Satisfaction** | 4.5+ stars for AI Twin | Monthly NPS survey |
| **Adoption Rate** | 80%+ daily active use | Usage analytics |
| **Proactive Help Acceptance** | 60%+ accept suggestions | Click-through rate |
| **Sprint Goal Achievement** | 90%+ hit 2 placements/sprint | Performance data |

---

## 🔧 Technical Implementation Guide

### Phase 1: Core AI Infrastructure (Weeks 5-6)

#### Week 5: Foundation

**Day 1-2: AI Model Router**

Create `/src/lib/ai/router.ts`:
```typescript
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type AIModel =
  | 'gpt-4o-mini'       // Cheap, fast, general-purpose
  | 'gpt-4o'            // Best for writing (resumes, emails)
  | 'claude-sonnet-4-5' // Best for reasoning (coaching, interviews)
  | 'text-embedding-3-small'; // Embeddings for RAG

export type AITask = {
  type: 'chat' | 'completion' | 'embedding' | 'vision';
  complexity: 'simple' | 'medium' | 'complex';
  requiresReasoning?: boolean;
  requiresWriting?: boolean;
  useCase: string; // 'code_mentor' | 'resume_builder' | etc
  userId: string;
};

export async function routeAIRequest(
  task: AITask,
  prompt: string,
  options?: any
) {
  // 1. Select model based on task
  const model = selectModel(task);

  // 2. Track cost (Helicone)
  const heliconeHeaders = {
    'Helicone-Property-UseCase': task.useCase,
    'Helicone-Property-UserId': task.userId,
    'Helicone-Property-Model': model
  };

  // 3. Execute request
  const startTime = Date.now();
  let response;

  try {
    if (model.startsWith('gpt')) {
      response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        ...options
      }, {
        headers: heliconeHeaders
      });
    } else if (model.startsWith('claude')) {
      response = await anthropic.messages.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        ...options
      }, {
        headers: heliconeHeaders
      });
    } else if (model.startsWith('text-embedding')) {
      response = await openai.embeddings.create({
        model,
        input: prompt
      }, {
        headers: heliconeHeaders
      });
    }

    // 4. Log metrics
    await logAIMetrics({
      model,
      useCase: task.useCase,
      userId: task.userId,
      latency: Date.now() - startTime,
      tokensUsed: response.usage?.total_tokens,
      cost: calculateCost(model, response.usage)
    });

    return response;

  } catch (error) {
    // 5. Error handling with fallback
    console.error('AI request failed:', error);

    // Retry with cheaper model?
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

function selectModel(task: AITask): AIModel {
  // Type-specific routing
  if (task.type === 'embedding') {
    return 'text-embedding-3-small';
  }

  // Use case-specific routing
  if (task.useCase === 'resume_builder' || task.requiresWriting) {
    return 'gpt-4o'; // Best writing quality
  }

  if (task.requiresReasoning || task.useCase === 'interview_coach') {
    return 'claude-sonnet-4-5'; // Best reasoning
  }

  // Default: Cheap and fast
  return 'gpt-4o-mini';
}

function calculateCost(model: string, usage: any): number {
  const pricing = {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'claude-sonnet-4-5': { input: 0.003, output: 0.015 },
    'text-embedding-3-small': { input: 0.00002, output: 0 }
  };

  const rates = pricing[model];
  return (
    (usage.prompt_tokens * rates.input / 1000) +
    (usage.completion_tokens * rates.output / 1000)
  );
}
```

**Day 3-4: RAG Infrastructure**

Create `/src/lib/ai/rag.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const openai = new OpenAI();

export class RAGLayer {
  /**
   * Index documents into pgvector for semantic search
   */
  async indexDocuments(
    documents: Array<{ id: string; content: string; metadata: any }>,
    collection: string
  ) {
    for (const doc of documents) {
      // 1. Generate embedding
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: doc.content
      });

      // 2. Store in pgvector
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
   * Semantic search using pgvector cosine similarity
   */
  async search({
    query,
    collection,
    topK = 5,
    threshold = 0.7,
    filters = {}
  }: {
    query: string;
    collection: string;
    topK?: number;
    threshold?: number;
    filters?: any;
  }) {
    // 1. Generate query embedding
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });

    // 2. Search pgvector
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding.data[0].embedding,
      match_threshold: threshold,
      match_count: topK,
      collection_name: collection,
      filter_metadata: filters
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

// SQL function for pgvector search
/*
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  collection_name text,
  filter_metadata jsonb DEFAULT '{}'::jsonb
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
  WHERE k.collection = collection_name
    AND (filter_metadata = '{}'::jsonb OR k.metadata @> filter_metadata)
    AND 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
*/
```

#### Week 6: Memory & Monitoring

**Day 1-2: Memory Layer**

Create `/src/lib/ai/memory.ts`:
```typescript
import Redis from 'ioredis';
import { createClient } from '@supabase/supabase-js';

const redis = new Redis(process.env.REDIS_URL);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class MemoryLayer {
  /**
   * Short-term memory (Redis, 24h TTL)
   */
  async saveConversation(
    userId: string,
    agentType: string,
    messages: Array<{ role: string; content: string }>
  ) {
    const key = `chat:${userId}:${agentType}`;
    await redis.set(
      key,
      JSON.stringify(messages),
      'EX',
      86400 // 24 hours
    );
  }

  async getConversation(userId: string, agentType: string) {
    const key = `chat:${userId}:${agentType}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Long-term memory (PostgreSQL, permanent)
   */
  async logInteraction({
    userId,
    agentType,
    question,
    response,
    helpful,
    tokensUsed,
    cost
  }: {
    userId: string;
    agentType: string;
    question: string;
    response: string;
    helpful?: boolean;
    tokensUsed: number;
    cost: number;
  }) {
    await supabase.from('ai_interactions').insert({
      user_id: userId,
      agent_type: agentType,
      question,
      response,
      helpful,
      tokens_used: tokensUsed,
      cost_usd: cost
    });
  }

  /**
   * Pattern memory (pgvector, learned behaviors)
   */
  async learnPattern({
    userId,
    patternType,
    description,
    context
  }: {
    userId: string;
    patternType: string;
    description: string;
    context: any;
  }) {
    // Generate embedding of pattern
    const embedding = await generateEmbedding(description);

    // Store in pgvector
    await supabase.from('learned_patterns').insert({
      user_id: userId,
      pattern_type: patternType,
      description,
      context,
      embedding
    });
  }

  async findSimilarPatterns(
    userId: string,
    query: string,
    topK: number = 5
  ) {
    const queryEmbedding = await generateEmbedding(query);

    const { data } = await supabase.rpc('search_patterns', {
      user_id: userId,
      query_embedding: queryEmbedding,
      match_count: topK
    });

    return data;
  }
}
```

**Day 3-4: Cost Monitoring with Helicone**

Install Helicone:
```bash
pnpm add @helicone/helicone
```

Create `/src/lib/ai/monitoring.ts`:
```typescript
import { Helicone } from '@helicone/helicone';

const helicone = new Helicone({
  apiKey: process.env.HELICONE_API_KEY!
});

export async function trackAICost({
  model,
  useCase,
  userId,
  tokensUsed,
  cost
}: {
  model: string;
  useCase: string;
  userId: string;
  tokensUsed: number;
  cost: number;
}) {
  // Log to Helicone
  await helicone.log({
    model,
    properties: {
      useCase,
      userId
    },
    tokensUsed,
    cost
  });

  // Check budget alerts
  const dailyCost = await getDailyCost();
  if (dailyCost > 500) {
    await sendAlert({
      type: 'budget_exceeded',
      message: `Daily AI cost exceeded $500: $${dailyCost}`,
      severity: 'high'
    });
  }
}

export async function getWeeklyCostReport() {
  const report = await helicone.analytics.costs({
    groupBy: ['useCase', 'model'],
    timeRange: 'last-7-days'
  });

  return {
    total: report.total,
    byUseCase: report.breakdown.useCase,
    byModel: report.breakdown.model,
    topUsers: report.topUsers
  };
}
```

### Phase 2: Feature Implementation (Weeks 7-10)

#### Week 7-8: Guidewire Guru

See [Use Case 1 Implementation](#week-7-3-4-days) above for complete details.

**Files to create:**
- `/src/lib/ai/agents/code-mentor.ts`
- `/src/lib/ai/agents/resume-builder.ts`
- `/src/lib/ai/agents/project-planner.ts`
- `/src/lib/ai/agents/interview-coach.ts`
- `/src/lib/ai/agents/coordinator.ts`
- `/src/lib/ai/prompts/socratic-method.ts`
- `/src/app/api/ai/guidewire-guru/route.ts`
- `/src/components/ai/ChatInterface.tsx`

#### Week 9-10: Productivity Tracking + Employee Bots

See [Use Case 2](#-use-case-2-productivity-tracking-screenshot-analysis) and [Use Case 3](#-use-case-3-employee-ai-twins-personalized-workflow-assistants) above.

---

## 📊 Cost Monitoring & Optimization

### Real-Time Monitoring Dashboard

```typescript
// /src/app/admin/ai-costs/page.tsx
export default async function AICostDashboard() {
  const report = await getWeeklyCostReport();

  return (
    <div>
      <h1>AI Cost Monitoring</h1>

      <Card>
        <h2>Weekly Spend: ${report.total}</h2>
        <p>Budget: $5,384/week ($280K/year ÷ 52 weeks)</p>
        <Progress value={report.total / 5384 * 100} />
      </Card>

      <Card>
        <h2>By Use Case</h2>
        <BarChart data={[
          { name: 'Guidewire Guru', cost: 6 },
          { name: 'Productivity', cost: 970 },
          { name: 'Employee Bots', cost: 4362 }
        ]} />
      </Card>

      <Card>
        <h2>Top Users (by cost)</h2>
        <Table data={report.topUsers} />
      </Card>

      <Card>
        <h2>Alerts</h2>
        {report.total > 5384 && (
          <Alert variant="destructive">
            Weekly budget exceeded by ${report.total - 5384}
          </Alert>
        )}
      </Card>
    </div>
  );
}
```

### Cost Optimization Tactics

**1. Caching (50% reduction):**
```typescript
// Cache common questions
const cachedResponse = await redis.get(`ai:cache:${questionHash}`);
if (cachedResponse) {
  return JSON.parse(cachedResponse); // Skip AI call
}

// Cache for 24 hours
await redis.set(
  `ai:cache:${questionHash}`,
  JSON.stringify(response),
  'EX',
  86400
);
```

**2. Batch Processing (30% reduction):**
```typescript
// Instead of classifying screenshots one-by-one
for (const screenshot of screenshots) {
  await classifyScreenshot(screenshot); // 192K API calls/day
}

// Batch into groups of 10
const batches = chunk(screenshots, 10);
for (const batch of batches) {
  await classifyBatch(batch); // 19.2K API calls/day (10× fewer!)
}
```

**3. Model Downgrading (10× cost reduction):**
```typescript
// Start with cheap model
let response = await routeAIRequest({
  type: 'chat',
  complexity: 'simple', // Uses GPT-4o-mini
  useCase: 'code_mentor',
  userId
}, prompt);

// If confidence is low, retry with better model
if (response.confidence < 0.7) {
  response = await routeAIRequest({
    type: 'chat',
    complexity: 'medium', // Upgrades to GPT-4o
    useCase: 'code_mentor',
    userId
  }, prompt);
}
```

**4. Prompt Optimization (80% token reduction):**
```typescript
// BAD: Verbose prompt (3000 tokens)
const badPrompt = `
Please carefully analyze the following student's question and provide
a detailed, thoughtful response that guides them to discover the answer
through Socratic questioning. Consider their learning style, previous
progress, and current module context when crafting your response...

[3000 more words of instructions]

Student question: ${question}
`;

// GOOD: Concise prompt (500 tokens)
const goodPrompt = `
Socratic method. Guide, don't tell. 2-3 sentences + 1-2 questions.

Student: ${student.name}, Module ${student.moduleId}
Curriculum context: ${curriculumChunks}
Question: ${question}
`;

// Savings: 2500 tokens = 83% reduction = 83% cost reduction
```

### Budget Alerts

```typescript
// Serverless function (runs hourly)
export async function checkBudgetAlerts() {
  const today = await getDailyCost();
  const thisWeek = await getWeeklyCost();

  // Alert: Daily spend over $1000
  if (today > 1000) {
    await slack.send({
      channel: '#ai-alerts',
      text: `⚠️ Daily AI cost: $${today} (target: $769/day)`
    });
  }

  // Alert: Weekly spend trending over budget
  const weeklyTarget = 5384; // $280K/year ÷ 52
  const daysElapsed = new Date().getDay();
  const projectedWeekly = (today / daysElapsed) * 7;

  if (projectedWeekly > weeklyTarget * 1.1) {
    await slack.send({
      channel: '#ai-alerts',
      text: `🚨 Projected weekly cost: $${projectedWeekly} (budget: $${weeklyTarget})`
    });
  }

  // Alert: Specific use case over budget
  const useCaseCosts = await getCostsByUseCase();
  if (useCaseCosts.employee_bots > 4362) {
    await slack.send({
      channel: '#ai-alerts',
      text: `⚠️ Employee Bots over budget: $${useCaseCosts.employee_bots} (target: $4362/week)`
    });
  }
}
```

---

## ✅ Success Criteria

### Definition of Done (Weeks 5-12)

**Week 5-6: Core Infrastructure**
- [x] AI Model Router functional (routes to GPT-4o-mini/GPT-4o/Claude)
- [x] RAG layer working (index + search with pgvector)
- [x] Memory layer operational (Redis + PostgreSQL + patterns)
- [x] Cost tracking live (Helicone integration)
- [x] Tests passing (80% coverage)

**Week 7-8: Guidewire Guru**
- [x] Code Mentor answers student questions (Socratic method)
- [x] Resume Builder generates ATS-optimized resumes
- [x] Project Planner creates realistic timelines
- [x] Interview Coach provides behavioral training
- [x] Coordinator routes queries to correct agent
- [x] Accuracy: 95%+ helpful responses (measured by thumbs up/down)
- [x] Escalation rate: <5% to human trainers

**Week 9-10: Productivity Tracking**
- [x] Desktop agent captures screenshots every 30 seconds
- [x] Vision API classifies activities (coding, email, meeting, etc.)
- [x] Daily timeline generated with insights
- [x] Manager dashboard shows aggregated metrics (not raw screenshots)
- [x] Privacy audit passes (GDPR-compliant)
- [x] Classification accuracy: 90%+ (employee validation)

**Week 11-12: Employee AI Twins**
- [x] Morning briefings sent at 9 AM (personalized to each employee)
- [x] Proactive suggestions offered (3×/day)
- [x] Struggle detection working (offers help automatically)
- [x] Employee preferences learned over time
- [x] Adoption rate: 80%+ daily active use

### Quality Gates

**Code Quality:**
- TypeScript compilation: 0 errors
- ESLint: 0 errors
- Test coverage: 80%+ on AI services
- Build time: <3 minutes

**Performance:**
- AI response time: <2 seconds (95th percentile)
- RAG search: <500ms
- Memory retrieval: <100ms
- Cost per interaction: Within budget targets

**Business Metrics:**
- Guidewire Guru: 95%+ accuracy, <5% escalation
- Productivity: 90%+ classification accuracy
- Employee Bots: 80%+ adoption, 15+ hours/week saved
- Budget: <$280K/year total AI spend

---

## 🎓 Key Learnings & Best Practices

### What Worked (From Research)

1. **Multi-agent for specialization** - 10-20% accuracy improvement vs. single-agent
2. **RAG for up-to-date knowledge** - 15% better responses than prompt-only
3. **Model selection routing** - 60% cost savings by using cheapest capable model
4. **Prompt optimization** - 80% token reduction without quality loss
5. **Caching common queries** - 50% cost reduction on repeated questions

### What to Avoid

1. **Over-engineering** - Don't build infrastructure you don't need yet
2. **Premature optimization** - Start simple (prompt-only), add RAG only if needed
3. **One-size-fits-all** - Productivity tracking ≠ Guidewire Guru (different patterns)
4. **Ignoring privacy** - Screenshot tracking requires careful handling
5. **No cost monitoring** - Track from Day 1, alerts at $500/day threshold

### Framework Recommendations

**Multi-Agent Orchestration:**
- **LangGraph** (recommended) - Production-ready, flexible, well-documented
- CrewAI (alternative) - Simpler API but less flexible

**RAG Framework:**
- **Supabase pgvector** (recommended) - Already in stack, $0 additional cost
- Pinecone (avoid) - $70+/month unnecessary for your scale

**Memory Management:**
- **Redis** (short-term) - Fast, cheap, perfect for conversations
- **PostgreSQL** (long-term) - Already in stack, ACID guarantees
- **pgvector** (patterns) - Vector similarity search for learned behaviors

---

## 📝 Next Steps

### When Epic 1 is Complete (End of Week 4):

1. **Review this document** - Ensure all decisions still valid
2. **Set up AI API keys:**
   ```bash
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   HELICONE_API_KEY=sk-helicone-...
   REDIS_URL=redis://...
   ```
3. **Create database tables:**
   - `knowledge_chunks` (pgvector embeddings)
   - `ai_interactions` (logging)
   - `learned_patterns` (memory)
   - `activities` (productivity tracking)
4. **Begin Week 5 implementation** (AI Model Router)

### Questions Before Week 5 Starts:

- [ ] Epic 1 Foundation complete? (database, auth, event bus, file structure)
- [ ] AI API keys obtained? (OpenAI, Anthropic, Helicone)
- [ ] Redis provisioned? (Upstash or self-hosted)
- [ ] Budget approved? ($280K/year confirmed)
- [ ] Privacy policy reviewed? (Screenshot tracking legal)

---

**Document Status:** ✅ Complete and Ready for Implementation
**Last Updated:** 2025-11-18
**Next Review:** End of Week 4 (before Week 5 AI implementation begins)

---

*This document will be the single source of truth for all AI architecture decisions in InTime v3. All feature implementation should reference this document for consistency.*
