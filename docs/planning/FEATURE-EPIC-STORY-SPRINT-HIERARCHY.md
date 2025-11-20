# Feature → Epic → Story → Sprint Hierarchy

**Last Updated:** 2025-11-20
**Status:** Active System Design

---

## 🎯 Overview

This document defines the complete planning hierarchy for InTime v3. Every piece of work flows through this 4-level system.

---

## 📊 The 4-Level Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  FEATURE (Business Capability)                          │
│  - What business value are we delivering?               │
│  - Timeline: 3-12 months                                │
│  - Example: "AI-Powered Recruitment System"             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  EPIC (Major Component)                                 │
│  - What major pieces make up this feature?              │
│  - Timeline: 1-3 months                                 │
│  - Example: "Resume Matching Engine"                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  STORY (Implementable Unit)                             │
│  - What specific functionality do we build?             │
│  - Timeline: 1-5 days                                   │
│  - Example: "AI-MATCH-001: Semantic Search"             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  SPRINT (Time-boxed Execution)                          │
│  - When do we build these stories?                      │
│  - Timeline: 2 weeks (fixed)                            │
│  - Example: "Sprint 5: Weeks 13-14"                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 The Planning Workflow

### Stage 1: Feature Definition
**Command:** `/workflows:define-feature [feature-name]`

**What Happens:**
1. PM Agent documents the business capability
2. Identifies success metrics and ROI
3. Creates feature canvas
4. **Output:** `docs/planning/features/[feature-name].md`

**Example:**
```bash
/workflows:define-feature AI-Powered-Training-System
```

**PM Agent Creates:**
```markdown
# Feature: AI-Powered Training System

## Business Value
Enable 24/7 training for 1,000+ students with <5% human escalation

## Success Metrics
- 95%+ helpful responses
- $600K/year cost savings
- 80%+ student satisfaction

## Proposed Epics
1. Guidewire Guru Multi-Agent System
2. Resume Matching Engine
3. Interview Preparation System
```

---

### Stage 2: Epic Breakdown
**Command:** `/workflows:create-epics [feature-name]`

**What Happens:**
1. PM Agent reads the feature definition
2. Breaks it into 3-5 major epics
3. Estimates timeline and dependencies
4. **Output:** `docs/planning/epics/[epic-id]-[name].md` (multiple files)

**Example:**
```bash
/workflows:create-epics AI-Powered-Training-System
```

**PM Agent Creates:**
```
docs/planning/epics/
  ├── epic-2.5-ai-infrastructure.md (Foundation)
  ├── epic-2.6-guidewire-guru.md (Multi-agent system)
  ├── epic-2.7-resume-matching.md (Semantic search)
  └── epic-2.8-interview-prep.md (Mock interviews)
```

---

### Stage 3: Story Creation
**Command:** `/workflows:create-stories [epic-id]`

**What Happens:**
1. PM Agent reads the epic definition
2. Breaks epic into 5-15 implementable stories
3. Defines acceptance criteria for each
4. Estimates story points
5. **Output:** `docs/planning/stories/[epic-id]/[story-id]-[name].md` (multiple files)

**Example:**
```bash
/workflows:create-stories epic-2.6-guidewire-guru
```

**PM Agent Creates:**
```
docs/planning/stories/epic-2.6-guidewire-guru/
  ├── README.md (Epic overview)
  ├── AI-GURU-001-coordinator-agent.md (3 points)
  ├── AI-GURU-002-code-mentor.md (8 points)
  ├── AI-GURU-003-resume-builder.md (5 points)
  ├── AI-GURU-004-project-planner.md (3 points)
  └── AI-GURU-005-interview-coach.md (5 points)
```

---

### Stage 4: Sprint Planning
**Command:** `/workflows:plan-sprint [sprint-number] [epic-id]`

**What Happens:**
1. PM Agent reads all stories for the epic
2. Selects stories for this sprint (target: 20-25 story points)
3. Orders by dependencies
4. Creates sprint plan
5. **Output:** `docs/planning/sprints/sprint-[N]/sprint-plan.md`

**Example:**
```bash
/workflows:plan-sprint 5 epic-2.6-guidewire-guru
```

**PM Agent Creates:**
```markdown
# Sprint 5: Guidewire Guru Multi-Agent System

**Duration:** Weeks 13-14 (Nov 18 - Dec 1, 2025)
**Epic:** Epic 2.6 - Guidewire Guru
**Capacity:** 24 story points (2 devs × 12 points/sprint)

## Sprint Goals
1. Implement Coordinator Agent (routing logic)
2. Implement Code Mentor (Socratic teaching)
3. Implement Resume Builder (ATS optimization)

## Stories in This Sprint
- [x] AI-GURU-001: Coordinator Agent (3 points) - Week 13, Days 1-2
- [x] AI-GURU-002: Code Mentor (8 points) - Week 13, Days 3-5
- [x] AI-GURU-003: Resume Builder (5 points) - Week 14, Days 1-2
- [ ] AI-GURU-004: Project Planner (3 points) - Week 14, Day 3
- [ ] AI-GURU-005: Interview Coach (5 points) - Moved to Sprint 6

## Out of Scope (Next Sprint)
- AI-GURU-005: Interview Coach (5 points)
```

---

### Stage 5: Story Execution
**Command:** `/workflows:feature [story-id]`

**What Happens:**
1. Developer reads story from `docs/planning/stories/[epic-id]/[story-id].md`
2. Architect designs the solution
3. Developer implements with tests
4. QA validates
5. Deployment agent deploys
6. **Output:** Working code + documentation

**Example:**
```bash
/workflows:feature AI-GURU-002-code-mentor
```

**Pipeline Executes:**
```
PM Agent: ✅ Requirements already documented
  ↓
Architect Agent: 🏗️ Design RAG integration + Socratic prompt template
  ↓
Developer Agent: 💻 Implement Code Mentor agent
  ↓
QA Agent: ✅ Test Socratic responses (95%+ accuracy)
  ↓
Deployment Agent: 🚀 Deploy to Vercel
```

---

## 📁 File Structure

```
docs/planning/
├── features/                          # Stage 1: Business capabilities
│   ├── ai-powered-training.md
│   ├── recruitment-automation.md
│   └── productivity-tracking.md
│
├── epics/                             # Stage 2: Major components
│   ├── epic-2.5-ai-infrastructure.md
│   ├── epic-2.6-guidewire-guru.md
│   ├── epic-2.7-resume-matching.md
│   └── epic-2.8-interview-prep.md
│
├── stories/                           # Stage 3: Implementable units
│   ├── epic-2.5-ai-infrastructure/
│   │   ├── README.md
│   │   ├── AI-INF-001-model-router.md
│   │   └── AI-INF-002-rag-infrastructure.md
│   ├── epic-2.6-guidewire-guru/
│   │   ├── README.md
│   │   ├── AI-GURU-001-coordinator-agent.md
│   │   └── AI-GURU-002-code-mentor.md
│   └── epic-2.7-resume-matching/
│       ├── README.md
│       └── AI-MATCH-001-semantic-search.md
│
└── sprints/                           # Stage 4: Time-boxed execution
    ├── sprint-01/
    │   ├── sprint-plan.md             # What we're building
    │   ├── deliverables/              # What we built
    │   └── retrospective.md           # What we learned
    ├── sprint-02/
    ├── sprint-03/
    ├── sprint-04/
    └── sprint-05/
        ├── sprint-plan.md             # Links to stories: AI-GURU-001, AI-GURU-002, etc.
        └── deliverables/
```

---

## 🎯 Story Template

Every story follows this structure:

```markdown
# [STORY-ID]: [Story Name]

**Epic:** [Epic ID and Name]
**Story Points:** [1-13]
**Priority:** [CRITICAL|HIGH|MEDIUM|LOW]
**Sprint:** [Planned sprint number]
**Dependencies:** [Other story IDs]

## User Story

**As a** [user role]
**I want** [functionality]
**So that** [business value]

## Acceptance Criteria

1. ✅ [Specific, testable criterion]
2. ✅ [Another criterion]
3. ✅ [Another criterion]

## Technical Design

### API Contracts
[Request/response types]

### Database Schema
[Tables, indexes, RLS]

### Dependencies
- Requires: [Other stories]
- Blocks: [Stories waiting on this]

## Testing Requirements

**Unit Tests:**
- [Specific test cases]

**Integration Tests:**
- [End-to-end flows]

**E2E Tests:**
- [User scenarios]

## Definition of Done

- [ ] Code implemented
- [ ] Tests written (80%+ coverage)
- [ ] Documentation updated
- [ ] Deployed to production
- [ ] Verified in production
```

---

## 🚀 Complete Example Flow

### Step 1: Define Feature
```bash
/workflows:define-feature Recruiting-Automation
```

**Output:** `docs/planning/features/recruiting-automation.md`

```markdown
# Feature: Recruiting Automation

## Business Value
Reduce recruiter time by 75% (3 hours → 45 min per requisition)

## Success Metrics
- 85%+ match accuracy
- <10 seconds search time
- 80%+ placement rate

## Proposed Epics
1. Resume Matching Engine
2. Candidate Sourcing Automation
3. Interview Scheduling System
```

---

### Step 2: Create Epics
```bash
/workflows:create-epics Recruiting-Automation
```

**Output:** 3 epic files created

```
docs/planning/epics/
  ├── epic-3.1-resume-matching.md
  ├── epic-3.2-candidate-sourcing.md
  └── epic-3.3-interview-scheduling.md
```

---

### Step 3: Create Stories for Epic
```bash
/workflows:create-stories epic-3.1-resume-matching
```

**Output:** Story files created

```
docs/planning/stories/epic-3.1-resume-matching/
  ├── README.md
  ├── MATCH-001-semantic-search.md (8 points)
  ├── MATCH-002-candidate-embeddings.md (5 points)
  ├── MATCH-003-job-embeddings.md (5 points)
  ├── MATCH-004-matching-algorithm.md (8 points)
  └── MATCH-005-recruiter-feedback.md (3 points)

Total: 29 story points (2 sprints needed)
```

---

### Step 4: Plan Sprint
```bash
/workflows:plan-sprint 6 epic-3.1-resume-matching
```

**Output:** `docs/planning/sprints/sprint-06/sprint-plan.md`

```markdown
# Sprint 6: Resume Matching Engine (Part 1)

**Stories in Sprint:**
- MATCH-001: Semantic Search (8 points)
- MATCH-002: Candidate Embeddings (5 points)
- MATCH-003: Job Embeddings (5 points)

**Deferred to Sprint 7:**
- MATCH-004: Matching Algorithm (8 points)
- MATCH-005: Recruiter Feedback (3 points)
```

---

### Step 5: Execute Stories
```bash
# Execute each story in order
/workflows:feature MATCH-001-semantic-search
/workflows:feature MATCH-002-candidate-embeddings
/workflows:feature MATCH-003-job-embeddings
```

Each execution goes through: PM → Architect → Developer → QA → Deploy

---

## 📋 Planning Commands Summary

| Command | Purpose | Input | Output |
|---------|---------|-------|--------|
| `/workflows:define-feature [name]` | Create feature canvas | Feature name | Feature doc |
| `/workflows:create-epics [feature]` | Break feature into epics | Feature name | Epic docs |
| `/workflows:create-stories [epic]` | Break epic into stories | Epic ID | Story docs |
| `/workflows:plan-sprint [N] [epic]` | Plan sprint execution | Sprint # + Epic ID | Sprint plan |
| `/workflows:feature [story]` | Execute story | Story ID | Working code |

---

## 🔄 Auto-Updating System

### Progress Tracking

Each story has a status badge:
- ⚪ **Not Started** - In backlog
- 🔵 **Planned** - In sprint plan
- 🟡 **In Progress** - Developer working
- 🟢 **Complete** - Deployed to production
- 🔴 **Blocked** - Waiting on dependencies

### Automatic Updates

When you run `/workflows:feature [story-id]`:
1. Story status updates from ⚪ → 🟡
2. Sprint plan shows progress percentage
3. Epic progress updates (e.g., "5/15 stories complete")
4. Feature progress updates (e.g., "Epic 1/3 complete")

### Burndown Charts

Each sprint automatically generates:
- Story completion rate
- Story points burned down
- Velocity trend
- Blocked items alert

---

## ⚠️ Important Rules

1. **Never skip levels** - Must go: Feature → Epic → Story → Sprint
2. **Stories must belong to an epic** - No orphan stories
3. **Sprints must reference stories** - No vague sprint goals
4. **One sprint at a time** - Don't plan more than 2 sprints ahead
5. **Re-plan as needed** - Sprint plans can change, stories cannot (once started)

---

## 🎓 Examples from InTime v3

### Current Structure (Corrected)

```
FEATURE: AI-Powered Business Operations
  └── EPIC 2.5: AI Infrastructure & Services
      ├── Stories: AI-INF-001 through AI-INF-007 (Infrastructure)
      ├── Stories: AI-GURU-001 through AI-GURU-005 (Guidewire Guru)
      ├── Stories: AI-PROD-001 through AI-PROD-003 (Productivity)
      └── Stories: AI-TWIN-001 (Employee Twins)

      Organized into Sprints:
      ├── Sprint 4: Infrastructure + Productivity (Week 11-12)
      └── Sprint 5: Guidewire Guru + Resume Matching (Week 13-14)
```

---

**Next Steps:**
1. Create the 4 workflow commands
2. Backfill existing work into this structure
3. Train team on the process

---

*This is the source of truth for all planning activities.*
