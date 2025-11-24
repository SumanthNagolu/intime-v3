# InTime v3 - Master Design & Execution Guide
## Vision Manifested: From Conversation to Reality

**Date:** 2025-11-20
**Purpose:** Complete system design to manifest 100% of project vision
**Approach:** Simple orchestrator + powerful workflows + intelligent automation

---

## 🎯 THE VISION

> "InTime is a living organism - not traditional software. It thinks with your principles, learns from every interaction, grows with your business, extends your capabilities, and scales your impact."

### What Success Looks Like

**You type:** "Let's build the candidate screening system"

**System does:**
1. 🤔 Orchestrator understands intent
2. 📋 PM Agent creates requirements
3. 🏗️ Architect Agent designs solution
4. 💻 Developer Agent implements with tests
5. ✅ QA Agent validates everything
6. 🚀 Deploy Agent ships to production
7. 📊 Documentation auto-updates
8. 📈 You see progress dashboard

**Time:** 2-4 hours (not weeks)
**Your effort:** One sentence
**Result:** Production-ready feature

---

## 🏛️ MASTER ARCHITECTURE

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         YOU                                 │
│              (Natural Language Input)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  ORCHESTRATOR LAYER                         │
│  • Understands intent                                       │
│  • Selects workflow                                         │
│  • Manages execution                                        │
│  • Tracks progress                                          │
│  • Provides feedback                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   WORKFLOW   │  │   WORKFLOW   │  │   WORKFLOW   │
│   /feature   │  │   /database  │  │   /deploy    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AGENT EXECUTION LAYER                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │    PM    │→ │ Architect│→ │Developer │→ │    QA    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                      │                     │
│                                      ▼                     │
│                              ┌──────────┐                 │
│                              │  Deploy  │                 │
│                              └──────────┘                 │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MEMORY     │  │     MCPs     │  │  SERVICES    │
│   LAYER      │  │   (Tools)    │  │  (APIs)      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### The 4 Core Layers

#### 1. **Orchestrator Layer** (Your Interface)
- **Input:** Natural language ("Build candidate screening")
- **Output:** Executed workflow with progress tracking
- **Intelligence:** Understands intent, selects workflow, manages execution
- **Tools:** Claude Sonnet 4.5, Intent classification, Context management

#### 2. **Workflow Layer** (The How)
- **Purpose:** Coordinate multi-agent execution
- **Examples:** `/feature`, `/database`, `/deploy`, `/test`
- **Features:** Sequential/parallel execution, error handling, checkpoints
- **Output:** Completed feature/fix/deployment

#### 3. **Agent Layer** (The Who)
- **8 Specialist Agents:** PM, Architect, Developer, QA, Deploy, CEO, CFO, Operations
- **Each Agent:** Specific expertise, tools, context
- **Communication:** Event bus + direct handoffs
- **Memory:** Shared context + agent-specific state

#### 4. **Foundation Layer** (The Tools)
- **Memory:** Redis (hot) + PostgreSQL (persistent) + pgvector (patterns)
- **MCPs:** File system, Git, Database, Browser automation, Slack, etc.
- **Services:** OpenAI, Anthropic, Helicone, Supabase, Vercel
- **Monitoring:** Sentry, Helicone, Timeline, Status dashboards

---

## 🧠 ORCHESTRATOR DESIGN

### Core Concept: Natural Language → Automated Execution

**You shouldn't need to know workflow names or syntax.**

### How It Works

```typescript
// You type (natural language):
"Let's build the resume matching feature for candidates"

// Orchestrator process:
1. Intent Analysis
   ├─ Keywords: "build", "resume matching", "feature"
   ├─ Entity: "resume matching"
   ├─ Action: "create new feature"
   └─ Workflow: /workflows:feature

2. Context Gathering
   ├─ Current sprint: Sprint 6
   ├─ Current epic: Epic 2
   ├─ Related stories: Check if exists
   └─ Dependencies: Check prerequisites

3. Workflow Selection
   ├─ Primary: /workflows:feature resume-matching
   ├─ Pre-req check: Foundation complete? ✅
   └─ Resources available? ✅

4. Execution Plan
   ├─ Agent sequence: PM → Architect → Developer → QA → Deploy
   ├─ Estimated time: 3 hours
   ├─ Output: Production-ready feature
   └─ Approval gates: After QA (manual review)

5. Execute & Monitor
   ├─ Run workflow
   ├─ Track progress (STATUS.md updates)
   ├─ Handle errors (retry/escalate)
   └─ Report completion

6. Feedback Loop
   ├─ Show progress: "PM completed requirements (15 min)"
   ├─ Request input: "Architect needs API key preference"
   ├─ Report completion: "Feature deployed to staging"
   └─ Update memory: Remember this for next time
```

### Orchestrator Implementation

**File:** `.claude/orchestration/orchestrator.ts`

```typescript
interface OrchestrationRequest {
  userInput: string;
  context: ProjectContext;
  memory: ConversationMemory;
}

interface OrchestrationPlan {
  intent: Intent;
  workflow: Workflow;
  agents: Agent[];
  estimatedTime: number;
  approvalGates: ApprovalGate[];
}

class Orchestrator {
  private intentClassifier: IntentClassifier;
  private workflowSelector: WorkflowSelector;
  private memoryManager: MemoryManager;
  private progressTracker: ProgressTracker;

  async orchestrate(request: OrchestrationRequest): Promise<ExecutionResult> {
    // 1. Understand intent
    const intent = await this.classifyIntent(request.userInput, request.context);

    // 2. Select workflow
    const workflow = await this.selectWorkflow(intent, request.context);

    // 3. Gather context
    const context = await this.gatherContext(intent, request.memory);

    // 4. Create plan
    const plan = await this.createExecutionPlan(workflow, context);

    // 5. Get approval (if needed)
    if (plan.requiresApproval) {
      await this.requestApproval(plan);
    }

    // 6. Execute
    return await this.executeWorkflow(plan);
  }

  private async classifyIntent(
    input: string,
    context: ProjectContext
  ): Promise<Intent> {
    // Use Claude to classify intent
    const classification = await claude.analyze({
      prompt: `Classify user intent:

      User input: "${input}"

      Context:
      - Current sprint: ${context.currentSprint}
      - Recent work: ${context.recentWork}
      - Available workflows: ${this.getAvailableWorkflows()}

      Classify as:
      1. create_feature - Build new feature
      2. fix_bug - Fix existing issue
      3. deploy - Deploy to environment
      4. database_change - Modify database
      5. test - Run tests
      6. review - Review code/design
      7. plan_sprint - Plan upcoming sprint
      8. other - Something else

      Return JSON: { intent, confidence, entities, suggestedWorkflow }`,
      model: 'claude-sonnet-4',
    });

    return classification;
  }

  private async selectWorkflow(
    intent: Intent,
    context: ProjectContext
  ): Promise<Workflow> {
    // Map intent to workflow
    const workflowMap = {
      create_feature: '/workflows:feature',
      fix_bug: '/workflows:feature', // Same workflow, different story type
      deploy: '/workflows:deploy',
      database_change: '/workflows:database',
      test: '/workflows:test',
      plan_sprint: '/workflows:plan-sprint',
    };

    const workflowName = workflowMap[intent.type];
    return this.loadWorkflow(workflowName);
  }

  private async executeWorkflow(plan: OrchestrationPlan): Promise<ExecutionResult> {
    const result: ExecutionResult = {
      status: 'in_progress',
      stages: [],
      errors: [],
      outputs: {},
    };

    try {
      // Execute each stage
      for (const stage of plan.stages) {
        this.progressTracker.updateStage(stage.name, 'in_progress');

        const stageResult = await this.executeStage(stage, result);

        result.stages.push(stageResult);

        if (stageResult.status === 'failed') {
          // Handle failure
          if (stage.optional) {
            console.warn(`Optional stage ${stage.name} failed, continuing...`);
          } else {
            throw new Error(`Critical stage ${stage.name} failed`);
          }
        }

        this.progressTracker.updateStage(stage.name, 'completed');

        // Check if approval needed before next stage
        if (stage.requiresApproval) {
          await this.requestStageApproval(stage, stageResult);
        }
      }

      result.status = 'completed';
      return result;

    } catch (error) {
      result.status = 'failed';
      result.errors.push(error);

      // Attempt recovery
      await this.handleFailure(plan, result, error);

      return result;
    }
  }
}
```

### Intent Classification Examples

**User Input → Intent → Workflow**

| User Says | Intent | Entities | Workflow | Why |
|-----------|--------|----------|----------|-----|
| "Let's build resume matching" | create_feature | feature: resume-matching | /workflows:feature | Creating new functionality |
| "Fix the login bug" | fix_bug | issue: login | /workflows:feature | Bug fix uses same pipeline |
| "Deploy to production" | deploy | env: production | /workflows:deploy | Deployment workflow |
| "Add user_preferences table" | database_change | table: user_preferences | /workflows:database | DB migration |
| "Run all tests" | test | scope: all | /workflows:test | Testing workflow |
| "Plan sprint 7" | plan_sprint | sprint: 7 | /workflows:plan-sprint | Sprint planning |

---

## 🔄 WORKFLOW SYSTEM

### Complete Workflow Library

#### 1. **Feature Development** (`/workflows:feature`)

**Purpose:** End-to-end feature implementation

**Usage:**
```bash
# You type:
"Build the candidate screening feature"

# Orchestrator runs:
/workflows:feature candidate-screening
```

**Stages:**
```
1. PM Requirements (15 min)
   ├─ Create story file
   ├─ Define acceptance criteria
   ├─ Estimate story points
   └─ Output: docs/planning/stories/.../candidate-screening.md

2. Architecture Design (30 min)
   ├─ Design system architecture
   ├─ Define API contracts
   ├─ Plan database schema
   └─ Output: EXECUTION/03-ARCHITECT-HANDOFF.md

3. Development (2-3 hours)
   ├─ Implement code
   ├─ Write unit tests (80%+ coverage)
   ├─ Write integration tests
   └─ Output: src/features/candidate-screening/*

4. QA Validation (30 min)
   ├─ Run all tests
   ├─ Validate acceptance criteria
   ├─ Check test coverage
   └─ Output: TESTING/TEST-RESULTS.md

5. Deployment (15 min)
   ├─ Deploy to staging
   ├─ Run smoke tests
   ├─ Deploy to production (if approved)
   └─ Output: RELEASE/DEPLOYMENT.md

6. Documentation (15 min)
   ├─ Auto-update STATUS.md
   ├─ Update progress percentages
   ├─ Generate release notes
   └─ Output: Updated documentation
```

**Total Time:** 3-4 hours
**Your Involvement:** Approval after QA (5 minutes)
**Result:** Production-ready feature

---

#### 2. **Database Changes** (`/workflows:database`)

**Purpose:** Safe database migrations

**Usage:**
```bash
# You type:
"Add email preferences to users"

# Orchestrator runs:
/workflows:database add-email-preferences
```

**Stages:**
```
1. Schema Design (20 min)
   ├─ Design table changes
   ├─ Plan indexes
   ├─ Consider performance
   └─ Output: Migration SQL

2. Migration Creation (10 min)
   ├─ Generate up migration
   ├─ Generate down migration (rollback)
   ├─ Add to version control
   └─ Output: supabase/migrations/XXX_add_email_prefs.sql

3. Testing (15 min)
   ├─ Test on local DB
   ├─ Test rollback
   ├─ Verify data integrity
   └─ Output: Test results

4. Deployment (10 min)
   ├─ Backup production DB
   ├─ Run migration
   ├─ Verify success
   └─ Output: Deployment log
```

**Safety Features:**
- ✅ Always creates rollback script
- ✅ Tests on local first
- ✅ Backs up before production
- ✅ Validates after migration

---

#### 3. **Sprint Planning** (`/workflows:plan-sprint`)

**Purpose:** Plan next sprint with stories and capacity

**Usage:**
```bash
# You type:
"Let's plan sprint 7"

# Orchestrator runs:
/workflows:plan-sprint 7
```

**Stages:**
```
1. Sprint Setup (10 min)
   ├─ Create sprint folder structure
   ├─ Copy planning template
   ├─ Set sprint dates
   └─ Output: sprints/sprint-07/PLANNING/01-PLAN.md

2. Story Selection (30 min)
   ├─ Review backlog
   ├─ Prioritize stories
   ├─ Estimate capacity (team size × days)
   └─ Output: Story list (20-25 points)

3. Dependency Check (15 min)
   ├─ Check story dependencies
   ├─ Verify prerequisites complete
   ├─ Identify risks
   └─ Output: Dependency map

4. Review & Approval (20 min)
   ├─ Generate plan document
   ├─ Request stakeholder review
   ├─ Incorporate feedback
   └─ Output: PLANNING/01-PLAN-APPROVED.md

5. Sprint Kickoff (10 min)
   ├─ Update STATUS.md
   ├─ Assign stories
   ├─ Set up tracking
   └─ Output: Sprint ready to execute
```

---

#### 4. **Deployment** (`/workflows:deploy`)

**Purpose:** Safe production deployment

**Usage:**
```bash
# You type:
"Deploy AI infrastructure to production"

# Orchestrator runs:
/workflows:deploy production
```

**Stages:**
```
1. Pre-flight Checks (10 min)
   ├─ All tests passing?
   ├─ Code review complete?
   ├─ Staging validated?
   └─ Status: GO/NO-GO

2. Build (5 min)
   ├─ Production build
   ├─ Asset optimization
   ├─ Bundle analysis
   └─ Output: Build artifacts

3. Database Migrations (5 min)
   ├─ Backup database
   ├─ Run pending migrations
   ├─ Verify success
   └─ Output: Migration log

4. Deployment (10 min)
   ├─ Deploy to Vercel
   ├─ Update environment variables
   ├─ Warm up caches
   └─ Output: Deployment URL

5. Validation (10 min)
   ├─ Run smoke tests
   ├─ Check health endpoints
   ├─ Verify monitoring
   └─ Status: Deployed successfully

6. Rollback Plan (Always ready)
   ├─ Revert code (2 min)
   ├─ Restore database (5 min)
   └─ Total: <10 min to rollback
```

**Safety Features:**
- ✅ Comprehensive pre-flight checks
- ✅ Automatic rollback on failure
- ✅ Smoke tests after deployment
- ✅ Monitoring alerts configured

---

#### 5. **Testing** (`/workflows:test`)

**Purpose:** Run comprehensive test suite

**Usage:**
```bash
# You type:
"Run all tests"

# Orchestrator runs:
/workflows:test all
```

**Stages:**
```
1. Unit Tests (Fast)
   ├─ Run: pnpm test
   ├─ Coverage: 80%+ required
   └─ Time: ~30 seconds

2. Integration Tests
   ├─ Run: pnpm test:integration
   ├─ Database: Test fixtures
   └─ Time: ~2 minutes

3. E2E Tests
   ├─ Run: pnpm test:e2e
   ├─ Browser: Playwright multi-browser
   └─ Time: ~5 minutes

4. Performance Tests (Optional)
   ├─ Run: k6 load tests
   ├─ Check: Response times
   └─ Time: ~2 minutes

5. Report Generation
   ├─ Combine results
   ├─ Generate coverage report
   ├─ Update STATUS.md
   └─ Output: TESTING/TEST-RESULTS.md
```

---

#### 6. **CEO Review** (`/workflows:ceo-review`)

**Purpose:** Strategic business analysis

**Usage:**
```bash
# You type:
"Should we expand to Canada?"

# Orchestrator runs:
/workflows:ceo-review expansion-canada
```

**Agents:** CEO Advisor + CFO Advisor

**Output:**
- Market analysis
- Financial projections
- Risk assessment
- Recommendation

---

### Workflow Execution Modes

#### Sequential Execution (Default)
```typescript
// One agent after another
PM → Architect → Developer → QA → Deploy
```

**Use When:**
- Each stage depends on previous
- Need careful review at each stage
- Learning/training mode

#### Parallel Execution (Fast)
```typescript
// Multiple agents work simultaneously
PM + Architect (parallel) → Developer → QA + Deploy (parallel)
```

**Use When:**
- Stages are independent
- Time-sensitive
- Resources available

#### Hybrid Execution (Optimal)
```typescript
// Mix of sequential and parallel
PM → Architect → [Developer + Tests] (parallel) → QA → Deploy
```

**Use When:**
- Most scenarios (recommended)
- Balance speed and quality

---

## 📋 PLANNING HIERARCHY & DOCUMENTATION INTEGRATION

### The 4-Level Hierarchy

InTime v3 uses a structured hierarchy to organize all planning and execution:

```
FEATURE (6-12 months)
   └─ EPIC (4-6 weeks)
       └─ STORY (2-8 hours)
           └─ SPRINT (2 weeks)
```

**Purpose:** Every level serves a specific scope and audience, creating complete visibility from vision to implementation.

---

### Level 1: Feature (Business Capability)

**Scope:** Major business capability (e.g., "AI Infrastructure", "Training Academy")
**Duration:** 6-12 months
**Owner:** CEO, Product Leadership

**File Structure:**
```
docs/planning/features/
└── AI-INFRASTRUCTURE.md
    ├── Overview & Vision
    ├── Business Value
    ├── Epics List (with progress %)
    ├── Overall Progress: [32%] ███████░░░░░░░░░
    └── Timeline & Milestones
```

**Auto-Updated Fields:**
- Overall progress percentage (weighted by story points across all epics)
- Epic completion status
- Timeline adjustments
- Business metrics

---

### Level 2: Epic (Major Component)

**Scope:** Significant system component (e.g., "Orchestrator System", "Memory Layer")
**Duration:** 4-6 weeks (1-2 sprints)
**Owner:** Product Manager, Architect

**File Structure:**
```
docs/planning/epics/
└── epic-02.5-ai-infrastructure/
    └── EPIC-2.5-AI-INFRASTRUCTURE.md
        ├── Epic Overview
        ├── Stories List (with status badges)
        │   ├── AI-INF-001: Build Orchestrator ⚪ Not Started
        │   ├── AI-INF-002: Memory Layer 🟡 In Progress
        │   └── AI-INF-003: Workflow Engine 🟢 Completed
        ├── Progress: [32%] ███░░░░░░░
        ├── Dependencies
        └── Acceptance Criteria
```

**Auto-Updated Fields:**
- Progress percentage (stories completed / total stories)
- Story status badges (⚪ → 🟡 → 🟢)
- Completion dates
- Dependencies status

---

### Level 3: Story (Implementable Unit)

**Scope:** Single implementable feature (e.g., "Build Intent Classifier")
**Duration:** 2-8 hours
**Owner:** Developer, QA

**File Structure:**
```
docs/planning/stories/epic-02.5-ai-infrastructure/
└── AI-INF-001-orchestrator.md
    ├── **Status:** 🟡 In Progress  ← Auto-updated!
    ├── Story Points: 5
    ├── Sprint: Sprint 5
    ├── Acceptance Criteria
    │   ├── [x] Intent classification works
    │   ├── [x] Workflow selection logic
    │   └── [ ] Integration tests
    ├── Implementation Notes
    └── Test Coverage: 85%  ← Auto-updated!
```

**Auto-Updated Fields:**
- Status badge (⚪ Not Started → 🟡 In Progress → 🟢 Completed)
  - Detects implementation in `src/**/*.{ts,tsx}`
  - Detects tests in `**/*.{test,spec}.{ts,tsx}`
  - Checks acceptance criteria completion
- Test coverage percentage
- Completion timestamp
- Related files list

---

### Level 4: Sprint (Time-Boxed Execution)

**Scope:** 2-week execution cycle with assigned stories
**Duration:** 2 weeks
**Owner:** Entire team

**File Structure:**
```
docs/planning/sprints/sprint-05/
├── STATUS.md  ← Living dashboard (auto-updated!)
│   ├── Sprint 5: Epic 2.5 AI Infrastructure
│   ├── Progress: [32%] ███░░░░░░░
│   ├── Stories: 3 total (1 completed, 1 in progress, 1 pending)
│   ├── Story Points: 8/25 completed
│   ├── Velocity: 4 points/week
│   └── Last updated: 2025-11-20T15:30:00Z
│
├── PLANNING/
│   ├── 01-PLAN.md
│   ├── 01-PLAN-REVIEW.md
│   └── 01-PLAN-APPROVED.md
│
├── EXECUTION/
│   ├── 02-PM-HANDOFF.md
│   ├── 03-ARCHITECT-HANDOFF.md
│   ├── 04-DEV-LOG.md
│   ├── 05-QA-REPORT.md
│   └── 06-DEPLOY-LOG.md
│
├── TESTING/
│   ├── TEST-PLAN.md
│   ├── TEST-RESULTS.md
│   └── TEST-COVERAGE.md
│
├── RELEASE/
│   ├── BUILD-LOG.md
│   ├── DEPLOYMENT.md
│   ├── RELEASE-NOTES.md
│   └── RELEASE-APPROVAL.md
│
├── deliverables/
│   ├── code/     ← Actual implementation
│   └── docs/     ← Sprint documentation
│
└── stories/
    ├── AI-INF-001-orchestrator.md
    ├── AI-INF-002-memory-layer.md
    └── AI-INF-003-workflow-engine.md
```

**Auto-Updated Fields (STATUS.md):**
- Sprint progress percentage
- Story completion counts
- Velocity calculation (points/week)
- Timeline updates
- Last updated timestamp

---

### How Workflows Integrate with Hierarchy

#### Workflow: `/workflows:feature [story-id]`

**Example:** `/workflows:feature AI-INF-001`

**What happens at each level:**

1. **Story Level** (`AI-INF-001-orchestrator.md`)
   - Status: ⚪ → 🟡 (when workflow starts)
   - Execution log: Track PM → Architect → Dev → QA → Deploy
   - Status: 🟡 → 🟢 (when tests pass and deployed)
   - Auto-detects: Implementation files, test files, coverage %

2. **Epic Level** (`EPIC-2.5-AI-INFRASTRUCTURE.md`)
   - Progress: Recalculated (1 more story completed)
   - Story list: Badge updated (AI-INF-001: ⚪ → 🟢)
   - Timeline: Adjusted based on velocity

3. **Feature Level** (`AI-INFRASTRUCTURE.md`)
   - Overall progress: Recalculated (weighted by story points)
   - Epic status: Updated if epic now complete
   - Business metrics: Updated

4. **Sprint Level** (`sprint-05/STATUS.md`)
   - Progress: +8 story points completed
   - Velocity: Recalculated
   - Stories list: Updated status
   - Timeline: On track / ahead / behind

**All updates happen automatically via post-workflow hook!**

---

### Auto-Documentation Cascade

When any story is completed, the system automatically updates:

```typescript
// Trigger: Story AI-INF-001 completed

1. Story File (AI-INF-001-orchestrator.md)
   ├─ Status: ⚪ → 🟢 Completed
   ├─ Completion date: 2025-11-20
   ├─ Test coverage: 87%
   └─ Related files: List of src/ and test/ files

2. Epic File (EPIC-2.5-AI-INFRASTRUCTURE.md)
   ├─ Progress: 20% → 32%  (1 more story done)
   ├─ Stories list: AI-INF-001 badge ⚪ → 🟢
   └─ Updated: 2025-11-20T15:30:00Z

3. Feature File (AI-INFRASTRUCTURE.md)
   ├─ Overall progress: 0% → 8%  (weighted by points)
   ├─ Epic 2.5 status: Updated
   └─ Timeline: Adjusted

4. Sprint Status (sprint-05/STATUS.md)
   ├─ Progress: 0% → 32%
   ├─ Velocity: 4 points/week
   ├─ Story count: 0 → 1 completed
   └─ Last updated: 2025-11-20T15:30:00Z
```

**How It Works:**
- Post-workflow hook triggers: `.claude/hooks/post-workflow.sh`
- Auto-update script runs: `scripts/update-documentation.ts`
- Scans codebase for story ID mentions
- Checks test files existence and coverage
- Updates all 4 levels automatically
- No manual intervention required!

---

### Status Badge System

**Story status is auto-detected:**

⚪ **Not Started**
- No implementation files found
- No test files found
- Acceptance criteria unchecked

🟡 **In Progress**
- Implementation files exist in `src/`
- OR test files exist
- OR some acceptance criteria checked
- BUT not all completion criteria met

🟢 **Completed**
- Implementation exists ✅
- Tests exist ✅
- Acceptance criteria all checked ✅
- Deployed to production ✅

**Detection Logic:**
```typescript
async function calculateStoryStatus(storyId: string): Promise<StatusBadge> {
  const hasImplementation = await checkImplementationExists(storyId);
  const hasTests = await checkTestsExist(storyId);
  const allCriteriaMet = await checkAcceptanceCriteria(storyId);

  if (hasImplementation && hasTests && allCriteriaMet) {
    return '🟢 Completed';
  } else if (hasImplementation || hasTests) {
    return '🟡 In Progress';
  } else {
    return '⚪ Not Started';
  }
}
```

---

### Complete Integration Example

**Scenario:** "Build AI Infrastructure" feature

**Stage 1: Define Feature**
```bash
You: "Create feature for AI Infrastructure"
System: Creates docs/planning/features/AI-INFRASTRUCTURE.md
```

**Stage 2: Create Epics**
```bash
You: "Break down AI Infrastructure into epics"
System: Creates 3 epic files, auto-updates feature file with epic list
```

**Stage 3: Create Stories**
```bash
You: "Create stories for Epic 2.5"
System: Creates 8 story files, auto-updates epic file with story list
```

**Stage 4: Plan Sprint**
```bash
You: "Plan Sprint 5"
System: Creates sprint-05/ structure, assigns 5 stories (25 points)
```

**Stage 5: Execute Story**
```bash
You: "Build AI-INF-001"
System: Runs /workflows:feature AI-INF-001
  ├─ PM creates requirements → Updates AI-INF-001.md
  ├─ Architect designs → Creates ARCHITECT-HANDOFF.md
  ├─ Developer implements → Creates src/orchestrator/*, tests/
  ├─ QA validates → Updates TEST-RESULTS.md
  ├─ Deploy ships → Updates DEPLOYMENT.md
  └─ Auto-update cascade → Updates all 4 levels!
```

**Result:**
- Story: Status 🟢, 87% coverage
- Epic: Progress 32% (1/3 stories done)
- Feature: Progress 8% (weighted by points)
- Sprint: 8/25 points, 4 pts/week velocity

**Time:** 3.5 hours from "Build AI-INF-001" to production
**Manual effort:** 5 minutes (approval gates)
**Documentation:** 100% automated

---

### Benefits of This Integration

✅ **Complete Visibility**
- See progress at every level (Feature → Epic → Story → Sprint)
- Real-time updates (no stale documentation)
- Automatic cascade (update once, propagate everywhere)

✅ **Zero Manual Overhead**
- Status badges auto-detected from code
- Progress percentages auto-calculated
- Documentation auto-generated

✅ **Proper Scope Management**
- Features = strategic (months)
- Epics = tactical (weeks)
- Stories = execution (hours)
- Sprints = time-boxing (2 weeks)

✅ **Workflow Integration**
- Every workflow knows which level it operates on
- Updates flow upward automatically
- Dependencies tracked across levels

---

### Reference Documentation

**For complete integration details, see:**
- **HIERARCHY-WORKFLOW-INTEGRATION.md** - Full integration specification with examples
- **SPRINT-STRUCTURE-DESIGN.md** - Sprint lifecycle and file organization
- **DOCUMENTATION-AUTO-UPDATE-SPEC.md** - Auto-update system specification

---

## 🛠️ MCP INTEGRATION STRATEGY

### Best MCPs for InTime v3

#### 1. **Filesystem MCP** (Core)
**Purpose:** File operations with proper permissions

**Operations:**
- Read/write source code
- Manage documentation
- Handle configuration files

**Example:**
```typescript
// Orchestrator uses for:
- Creating story files
- Writing generated code
- Updating documentation
```

#### 2. **Sequential Thinking MCP** (Intelligence)
**Purpose:** Complex problem-solving with chain-of-thought

**Use Cases:**
- Architecture design decisions
- Bug root cause analysis
- System design trade-offs

**Example:**
```typescript
// When: User says "Design the notification system"
// MCP: Breaks down into 20+ thought steps
// Output: Comprehensive architecture design
```

#### 3. **Context7 MCP** (Documentation)
**Purpose:** Up-to-date library documentation

**Use Cases:**
- Fetch latest Next.js docs
- Get Supabase API reference
- Find code examples

**Example:**
```typescript
// Developer Agent: "How do I implement RLS in Supabase?"
// Context7: Returns latest Supabase RLS documentation
```

#### 4. **Playwright MCP** (Testing)
**Purpose:** Browser automation for E2E tests

**Use Cases:**
- E2E test execution
- UI interaction testing
- Screenshot comparison

**Example:**
```typescript
// QA Agent: Run E2E test for login flow
// Playwright: Opens browser, clicks buttons, validates
```

#### 5. **Slack MCP** (Communication)
**Purpose:** Team notifications

**Use Cases:**
- Sprint completion alerts
- Deployment notifications
- Error alerts

**Example:**
```typescript
// Deploy Agent: Posts to #deployments
// "✅ AI Infrastructure deployed to production"
```

#### 6. **Apidog MCP** (API Testing)
**Purpose:** API documentation and testing

**Use Cases:**
- API endpoint documentation
- Contract testing
- Integration testing

---

### MCP Usage Matrix

| Agent | Primary MCPs | Use Case |
|-------|-------------|----------|
| **PM** | Filesystem, Sequential Thinking | Requirements docs, complexity analysis |
| **Architect** | Filesystem, Sequential Thinking, Context7 | Design docs, library research |
| **Developer** | Filesystem, Context7 | Code generation, API docs |
| **QA** | Playwright, Apidog, Filesystem | E2E tests, API tests, reports |
| **Deploy** | Filesystem, Slack | Deployment scripts, notifications |

---

## 🧠 MEMORY & CONTEXT LAYERS

### Three-Tier Memory Architecture

```
┌─────────────────────────────────────────┐
│          LAYER 1: HOT CACHE             │
│              (Redis)                    │
│  • Current conversation                 │
│  • Active workflow state                │
│  • Temporary decisions                  │
│  • Latency: <100ms                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│       LAYER 2: PERSISTENT STORE         │
│           (PostgreSQL)                  │
│  • All conversations (long-term)        │
│  • Workflow execution history           │
│  • Project decisions & rationale        │
│  • Agent outputs                        │
│  • Latency: <500ms                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      LAYER 3: PATTERN LEARNING          │
│            (pgvector)                   │
│  • Similar conversations (semantic)     │
│  • Best practices learned               │
│  • Common patterns                      │
│  • Success/failure analysis             │
│  • Latency: <2s (batch)                 │
└─────────────────────────────────────────┘
```

### Memory Usage Examples

#### Current Conversation (Layer 1: Redis)
```typescript
// Orchestrator maintains conversation context
const conversationContext = {
  sessionId: 'session-2025-11-20-abc123',
  userIntent: 'build candidate screening',
  currentWorkflow: '/workflows:feature',
  currentStage: 'architecture',
  decisions: [
    { question: 'Use Redis or Postgres for cache?', answer: 'Redis', reason: 'Speed' }
  ],
  artifacts: [
    { type: 'story', path: 'stories/candidate-screening.md' }
  ]
};

// Stored in Redis with 24-hour TTL
await redis.set(`conversation:${sessionId}`, conversationContext, { ex: 86400 });
```

#### Workflow History (Layer 2: PostgreSQL)
```sql
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  user_input TEXT,
  intent JSONB,
  stages JSONB,
  duration_seconds INTEGER,
  success BOOLEAN,
  outputs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query: What workflows succeeded recently?
SELECT workflow_name, COUNT(*), AVG(duration_seconds)
FROM workflow_executions
WHERE success = true AND created_at > NOW() - INTERVAL '7 days'
GROUP BY workflow_name;
```

#### Pattern Learning (Layer 3: pgvector)
```sql
CREATE TABLE workflow_patterns (
  id UUID PRIMARY KEY,
  user_input TEXT,
  embedding vector(1536),  -- OpenAI embeddings
  successful_workflow TEXT,
  success_rate DECIMAL,
  avg_duration INTEGER,
  learned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query: Find similar successful patterns
SELECT user_input, successful_workflow, success_rate
FROM workflow_patterns
ORDER BY embedding <-> query_embedding
LIMIT 5;
```

### Context Gathering Strategy

**When starting any workflow:**

```typescript
async function gatherContext(userInput: string, sessionId: string) {
  // 1. Current conversation (Layer 1)
  const currentContext = await redis.get(`conversation:${sessionId}`);

  // 2. Recent project history (Layer 2)
  const recentWork = await db.query(`
    SELECT * FROM workflow_executions
    WHERE created_at > NOW() - INTERVAL '7 days'
    ORDER BY created_at DESC LIMIT 10
  `);

  // 3. Similar past conversations (Layer 3)
  const embedding = await openai.embeddings.create({ input: userInput });
  const similarPatterns = await db.query(`
    SELECT * FROM workflow_patterns
    ORDER BY embedding <-> $1
    LIMIT 5
  `, [embedding]);

  // 4. Current sprint/epic context
  const projectContext = {
    currentSprint: await getCurrentSprint(),
    currentEpic: await getCurrentEpic(),
    recentStories: await getRecentStories(7),
  };

  return {
    current: currentContext,
    recent: recentWork,
    similar: similarPatterns,
    project: projectContext,
  };
}
```

---

## 📖 EXECUTION PLAYBOOK

### How to Actually Use This System

#### Day-to-Day Usage

**Morning: Check Status**
```
You: "What's our progress?"

Orchestrator:
├─ Reads STATUS.md for current sprint
├─ Checks workflow executions from yesterday
├─ Summarizes: "Sprint 6, Day 3/10. Completed 8/23 points.
│   AI-INF-001 deployed. AI-INF-002 in testing."
└─ Suggests: "Ready to start AI-INF-003?"
```

**Start New Feature**
```
You: "Let's build the email notification system"

Orchestrator:
├─ Classifies intent: create_feature
├─ Checks prerequisites: Email service configured? ✅
├─ Suggests workflow: /workflows:feature
├─ Creates plan: 3-4 hours, PM→Arch→Dev→QA→Deploy
├─ Asks confirmation: "Start feature workflow? (y/n)"
└─ You: "yes"

[Workflow executes automatically]

PM Agent (15 min):
├─ Creates story file with acceptance criteria
├─ Estimates 8 story points
└─ Outputs: stories/email-notifications.md

Architect Agent (30 min):
├─ Designs email queue system (Bull + Redis)
├─ Defines API contracts
├─ Plans database schema (email_logs table)
└─ Outputs: EXECUTION/03-ARCHITECT-HANDOFF.md

Developer Agent (2 hours):
├─ Implements EmailService class
├─ Adds queue processing
├─ Writes 25 unit tests (88% coverage)
└─ Outputs: src/services/email/*

QA Agent (20 min):
├─ Runs all tests: 45/45 passing ✅
├─ Validates acceptance criteria: 5/5 met ✅
├─ Checks performance: <500ms send time ✅
└─ Outputs: TESTING/TEST-RESULTS.md

Deploy Agent (15 min):
├─ Deploys to staging
├─ Runs smoke tests: All passing ✅
├─ Asks: "Deploy to production? (y/n)"
└─ You: "yes"

[Deploys to production]

Orchestrator:
└─ Summary: "✅ Email notification system deployed.
    Time: 3.5 hours. All tests passing. Docs updated."
```

**Quick Fix**
```
You: "Login button isn't working on mobile"

Orchestrator:
├─ Classifies intent: fix_bug
├─ Suggests workflow: /workflows:feature (bug fix)
├─ Creates bug story
└─ Executes: Faster path (30-60 min vs 3-4 hours)

[Workflow completes]
└─ Result: Bug fixed, tested, deployed
```

**Database Change**
```
You: "Add user preferences table"

Orchestrator:
├─ Classifies intent: database_change
├─ Suggests workflow: /workflows:database
└─ Executes:
    1. Architect designs schema
    2. Creates migration SQL
    3. Tests on local DB
    4. Deploys to staging
    5. Asks approval for production

[You approve]
└─ Result: Table added, rollback script ready
```

**Sprint Planning**
```
You: "Let's plan Sprint 7"

Orchestrator:
├─ Workflow: /workflows:plan-sprint 7
└─ Executes:
    1. Creates sprint-07/ folder structure
    2. Reviews Epic 2 backlog
    3. Selects stories (25 points capacity)
    4. Checks dependencies
    5. Generates PLANNING/01-PLAN.md
    6. Requests your review

[You review and approve]
└─ Result: Sprint 7 ready to start
```

---

### Advanced Usage

#### Parallel Feature Development
```
You: "Build email notifications and SMS notifications in parallel"

Orchestrator:
├─ Classifies: create_feature (x2)
├─ Creates two parallel workflows
└─ Executes:

    Workflow 1: Email               Workflow 2: SMS
    ├─ PM Agent                     ├─ PM Agent
    ├─ Architect                    ├─ Architect
    ├─ Developer (parallel) ←───────→ Developer (parallel)
    ├─ QA Agent                     ├─ QA Agent
    └─ Deploy                       └─ Deploy

[Both complete simultaneously]
└─ Time: 3.5 hours (vs 7 hours sequential)
```

#### Cross-Epic Dependencies
```
You: "Build candidate screening (Epic 2) that uses AI Router (Epic 2.5)"

Orchestrator:
├─ Detects dependency: AI Router must exist
├─ Checks: Is AI Router complete? ✅ (Yes, in Sprint 5)
├─ Safe to proceed: ✅
└─ Executes workflow with AI Router as dependency
```

#### Emergency Deployment
```
You: "Critical security fix - deploy NOW"

Orchestrator:
├─ Detects urgency keywords: "critical", "NOW"
├─ Fast-track mode: Skip optional stages
└─ Executes:
    1. Code review (5 min) - REQUIRED
    2. Essential tests only (5 min) - REQUIRED
    3. Staging deploy - SKIPPED
    4. Production deploy (5 min) - IMMEDIATE
    5. Monitor for 1 hour - REQUIRED

└─ Time: 15 minutes vs normal 3 hours
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (COMPLETE ✅)

**Status:** Already built

**Components:**
- ✅ 8 specialist agents defined
- ✅ Basic workflow commands
- ✅ Planning system (features/epics/stories/sprints)
- ✅ Database schema (Supabase)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Deployment (Vercel)

---

### Phase 2: Orchestrator Core (NEXT - 2 weeks)

**Goal:** Natural language → automated workflows

**Week 1: Intent Classification**
- [ ] Build intent classifier (Claude Sonnet 4.5)
- [ ] Create intent training data (50 examples)
- [ ] Test classification accuracy (>90% required)
- [ ] Integration with existing workflows

**Week 2: Workflow Orchestration**
- [ ] Build workflow selector
- [ ] Create execution engine
- [ ] Add progress tracking
- [ ] Implement error handling & recovery

**Deliverables:**
```typescript
// Working example:
You: "Build resume matching"
Orchestrator: [Understands → Selects /workflows:feature → Executes → Reports]
Result: Feature deployed in 3 hours
```

**Test Cases:**
1. Feature creation (10 variations)
2. Bug fixing (5 variations)
3. Database changes (5 variations)
4. Deployments (3 variations)
5. Sprint planning (3 variations)

**Success Criteria:**
- ✅ 90%+ intent classification accuracy
- ✅ Successful workflow execution end-to-end
- ✅ Progress visible in real-time
- ✅ Error recovery working

---

### Phase 3: Memory Integration (Weeks 3-4)

**Goal:** System learns from every interaction

**Week 3: Memory Layers**
- [ ] Implement Redis hot cache (Layer 1)
- [ ] Connect PostgreSQL workflow history (Layer 2)
- [ ] Add pgvector pattern learning (Layer 3)
- [ ] Create memory retrieval system

**Week 4: Learning System**
- [ ] Build pattern extraction
- [ ] Create similarity search
- [ ] Implement recommendations ("Based on past, I suggest...")
- [ ] Add feedback loop (success/failure tracking)

**Deliverables:**
```typescript
// Example:
You: "Build email system"
Orchestrator: "Based on similar projects (SMS system in Sprint 5),
               I'll use Bull + Redis queue. Estimated: 3 hours. Sound good?"
```

**Success Criteria:**
- ✅ Context retrieval <2 seconds
- ✅ Relevant suggestions (>80% helpful)
- ✅ Learning from feedback
- ✅ Pattern recognition working

---

### Phase 4: Enhanced Workflows (Weeks 5-6)

**Goal:** More intelligent, more automated

**Week 5: Workflow Improvements**
- [ ] Add parallel execution support
- [ ] Implement approval gates
- [ ] Create checkpoints (resume from failure)
- [ ] Add workflow templates for common patterns

**Week 6: Agent Improvements**
- [ ] Enhance PM Agent (better requirements)
- [ ] Upgrade Architect Agent (more design patterns)
- [ ] Improve Developer Agent (smarter code gen)
- [ ] Better QA Agent (comprehensive testing)

**Deliverables:**
- Parallel workflows working
- Resume from failure
- Better agent outputs

**Success Criteria:**
- ✅ 40% faster execution (parallel)
- ✅ 90%+ workflow success rate
- ✅ Recovery from failures
- ✅ Higher quality outputs

---

### Phase 5: Production Hardening (Weeks 7-8)

**Goal:** Bulletproof reliability

**Week 7: Monitoring & Observability**
- [ ] Add comprehensive logging
- [ ] Create orchestrator dashboard
- [ ] Set up alerts (Slack/email)
- [ ] Build debugging tools

**Week 8: Polish & Documentation**
- [ ] Complete user documentation
- [ ] Create video tutorials
- [ ] Build troubleshooting guide
- [ ] Load testing & optimization

**Deliverables:**
- Real-time dashboard
- Alert system
- Complete documentation

**Success Criteria:**
- ✅ 99%+ uptime
- ✅ <5 min alert response
- ✅ Comprehensive logs
- ✅ Easy to use

---

## 📊 SUCCESS METRICS

### User Experience
- **One-sentence requests** → Feature deployed (95% success rate)
- **Response time:** <5 seconds to start workflow
- **Execution time:** 3-4 hours feature, 30-60 min bug fix
- **User effort:** <5 minutes total (request + approvals)

### System Performance
- **Workflow success rate:** >90%
- **Error recovery:** <10 min to recover from failure
- **Intent classification:** >90% accuracy
- **Memory retrieval:** <2 seconds

### Business Impact
- **Development velocity:** 5x faster (vs manual)
- **Code quality:** 80%+ test coverage maintained
- **Deployment frequency:** 5-10 deployments/week
- **Time to production:** <4 hours (vs weeks)

---

## 🎓 BEST PRACTICES

### For You (Project Owner)

**DO:**
- ✅ Speak naturally ("Build X", "Fix Y", "Deploy Z")
- ✅ Provide approval when requested
- ✅ Review STATUS.md dashboard regularly
- ✅ Give feedback ("That worked great" or "This needs improvement")

**DON'T:**
- ❌ Micromanage workflow execution
- ❌ Override agent decisions without reason
- ❌ Skip approval gates for critical changes
- ❌ Forget to check STATUS.md

### For the System

**DO:**
- ✅ Ask clarifying questions when uncertain
- ✅ Suggest best practices based on past success
- ✅ Fail fast and recover automatically
- ✅ Learn from every interaction

**DON'T:**
- ❌ Proceed with ambiguous requirements
- ❌ Skip quality gates to save time
- ❌ Deploy without tests passing
- ❌ Ignore past patterns

---

## 🎯 QUICK START

### Today (30 minutes)

1. **Read this guide** (20 min) ✅ You're doing it!

2. **Try one workflow manually** (10 min)
```bash
/workflows:test all
# See how workflows work
```

### This Week (Phase 1)

1. **Set up orchestrator skeleton** (Day 1-2)
   - Basic intent classification
   - Workflow selection logic

2. **Test with 3 scenarios** (Day 3-4)
   - Create feature
   - Fix bug
   - Deploy

3. **Refine based on testing** (Day 5)
   - Fix issues
   - Improve accuracy

### Next 8 Weeks

Follow implementation roadmap above.

**Result:** Fully automated development system where you speak naturally and features get built, tested, and deployed automatically.

---

## 🎉 VISION MANIFESTED

### What You'll Have

**Before (Traditional Development):**
```
You: "Build email notifications"
Team: "Sure, let me write requirements, then design, then code,
       then test, then deploy. See you in 2 weeks."
Time: 80 hours
Your effort: Constant oversight
Result: Maybe what you wanted
```

**After (InTime v3 Orchestrated):**
```
You: "Build email notifications"
Orchestrator: "Got it. Email notification system.
               3-4 hours. I'll keep you posted."

[3.5 hours later]

Orchestrator: "✅ Done. Email notification system deployed to production.
               - Sent 50 test emails successfully
               - All tests passing (88% coverage)
               - Documentation updated
               - Cost: $0.12 AI + $0 human labor

               Want to see the code or try it out?"

Time: 3.5 hours
Your effort: 2 minutes (request + approval)
Result: Exactly what you wanted
```

### This Is Your Reality

- **Natural conversation** → Automated execution
- **One sentence** → Production-ready feature
- **Hours, not weeks** → Results today
- **Learning system** → Gets smarter with each use
- **Complete visibility** → Always know the status
- **Quality guaranteed** → 80%+ test coverage, all checks passing

---

## 📞 NEXT STEPS

**Choose your path:**

### Option A: Full Implementation (8 weeks)
Start Phase 2 next week. Complete orchestrator system in 2 months.

### Option B: MVP First (2 weeks)
Build basic orchestrator. Test with 3 workflows. Iterate based on results.

### Option C: Manual Workflows Now
Use existing workflows manually while planning orchestrator.

**My Recommendation:** **Option B (MVP First)**

**Why:**
- Quick validation (2 weeks)
- Test the concept
- Learn what works
- Then build complete system

**Next immediate action:**
1. Review this guide (30 min)
2. Decide on approach
3. I start building (if you want Option A or B)

---

**Your vision, manifested.**
**Simple to use. Powerful underneath.**
**Ready to build?**

---

**Document Version:** 1.0
**Status:** Ready for implementation
**Time to Reality:** 2-8 weeks depending on approach
