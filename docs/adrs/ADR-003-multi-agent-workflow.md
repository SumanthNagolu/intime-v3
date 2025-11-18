# ADR-003: Multi-Agent Development Workflow

**Date:** 2025-11-17
**Status:** Accepted
**Deciders:** CEO, CTO, Architecture Team
**Consulted:** All Agent Teams
**Informed:** Entire organization

---

## Context

InTime v3 is building a "living organism" - not just software. Traditional development (humans writing all code) would take 12-18 months and cost $500K+. We need to:
- **Build faster:** 3-6 months to MVP
- **Maintain quality:** Enterprise-grade, secure, tested code
- **Scale efficiently:** 1-2 developers managing 8+ AI agents
- **Reduce costs:** $50K vs $500K development budget

We evaluated:
- **Traditional dev:** Hire 5 developers → 12 months
- **Single AI assistant:** ChatGPT/Claude → unstructured, inconsistent
- **Multi-agent system:** Specialized AI agents → coordinated, high-quality

---

## Decision

**We will use a 12-agent orchestration system** where:
1. **Orchestrator routes** user requests to appropriate workflows
2. **Specialist agents** handle their domain (PM, Architect, Dev, QA, etc.)
3. **Sequential + parallel execution** based on dependencies
4. **Human approval gates** at critical points (requirements, deployment)
5. **Cost optimization** via prompt caching (90%+ savings)

### Agent Hierarchy

```
                         ORCHESTRATOR (Haiku - Routing)
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
    STRATEGIC TIER           PLANNING TIER        IMPLEMENTATION TIER
      (Opus 4)                (Sonnet 4)            (Sonnet 4)
           │                      │                      │
    ┌──────┴──────┐               │            ┌─────────┼─────────┐
    │             │               │            │         │         │
CEO Advisor   CFO Advisor    PM Agent    DB Architect API Dev Frontend Dev
                                               │
                                     Integration Specialist
                                               │
           ┌───────────────────────────────────┴───────────────┐
           │                                                    │
     QUALITY TIER                                        OPERATIONS TIER
      (Haiku - Fast)                                       (Sonnet 4)
           │                                                    │
    ┌──────┴──────┐                                     ┌───────┴───────┐
    │             │                                     │               │
Code Reviewer Security Auditor                   QA Engineer    Deployment
```

### Cost Optimization Strategy

| Agent | Model | Cost/1M Tokens | Use Case | Caching |
|-------|-------|----------------|----------|---------|
| **Orchestrator** | Haiku | $0.25 / $1.25 | Routing only | 95% |
| **CEO/CFO** | Opus | $15 / $75 | Strategic decisions | 90% |
| **PM/Architect/Dev** | Sonnet | $3 / $15 | Implementation | 90% |
| **Code Review/Security** | Haiku | $0.25 / $1.25 | Quality checks | 95% |
| **QA/Deploy** | Sonnet | $3 / $15 | Critical operations | 85% |

**Typical Feature Cost:**
- Without caching: $2.50
- With caching: **$0.10-0.25** (90% savings!)
- Sometimes **negative cost** (earn credits from cache hits)

---

## How This Prevents Legacy Project Issues

### Background: Legacy Project Audit Findings

We audited our 7-day legacy project (94,000 LOC, 8 modules) and found critical failures:
1. **Database fragmentation:** 3 separate user systems
2. **Integration as afterthought:** Event bus built but never used
3. **Dead code accumulation:** ~15% of codebase unused
4. **No testing:** Vitest/Playwright configured, zero tests written
5. **API pattern mixing:** 35 REST + 4 tRPC routes

**Result:** 70% complete, fragmented system, 3 weeks to fix integration issues.

### Multi-Agent Workflow as Solution

Each agent role prevents specific legacy failures:

| Legacy Issue | Preventing Agent | How It Prevents |
|-------------|------------------|-----------------|
| **Database Fragmentation** | DB Architect Agent | Reviews entire schema before implementation. Rejects multiple user tables. Enforces unified schema pattern. |
| **Integration Afterthought** | Integration Specialist Agent | Designs event bus connections BEFORE building modules. Tests cross-module flows first. |
| **Dead Code** | Code Reviewer + Orchestrator | Reviewer flags unused code. Orchestrator archives old implementations immediately. Monthly audits automated. |
| **No Testing** | QA Engineer Agent | Writes tests BEFORE deployment. Blocks deployment if tests fail. Enforces 80%+ coverage. |
| **API Pattern Mixing** | API Developer Agent | Uses tRPC-only template. Rejects REST API additions. Enforces single response type pattern. |
| **Scope Creep** | PM Agent | Validates requirements against product vision. Breaks large features into manageable tasks. Gets approval before proceeding. |
| **Architectural Drift** | Architect Agent | Reviews all schema/API changes against ADRs. Enforces patterns from ADR-001, ADR-002. Maintains consistency. |

### Systematic Quality Gates

The multi-agent workflow enforces quality at every step:

```
User Request: "Add candidate bulk upload feature"
  │
  ├─> PM AGENT
  │   └─ ✅ Validates: Aligns with product vision?
  │   └─ ✅ Validates: Breaks into manageable tasks?
  │   └─ ✅ Creates: GitHub issues with acceptance criteria
  │
  ├─> ARCHITECT AGENT
  │   └─ ✅ Validates: Uses unified user_profiles table?
  │   └─ ✅ Validates: Integration via event bus?
  │   └─ ✅ Validates: tRPC-only API pattern?
  │   └─ ✅ Creates: Architecture design doc
  │
  ├─> DEVELOPER AGENT
  │   └─ ✅ Validates: Follows architecture design?
  │   └─ ✅ Validates: TypeScript strict mode?
  │   └─ ✅ Validates: Implements RLS policies?
  │   └─ ✅ Creates: Implementation code
  │
  ├─> CODE REVIEWER AGENT
  │   └─ ✅ Validates: No dead code introduced?
  │   └─ ✅ Validates: Follows conventions?
  │   └─ ✅ Validates: No security vulnerabilities?
  │
  ├─> QA AGENT
  │   └─ ✅ Validates: Tests written?
  │   └─ ✅ Validates: 80%+ coverage?
  │   └─ ✅ Validates: All tests passing?
  │   └─ ⛔ BLOCKS: Deployment if tests fail
  │
  └─> DEPLOYMENT AGENT
      └─ ✅ Validates: Staging tests pass?
      └─ ✅ Validates: Human approval received?
      └─ ✅ Deploys: To production
```

**Key Difference from Raw AI Coding:**
- Raw AI: One agent does everything → easy to skip testing, drift from patterns
- Multi-agent: Specialist agents enforce their domain → impossible to skip quality gates

### Traceability & Audit Trail

Every workflow produces artifacts:

```
.artifacts/
└── feature-candidate-bulk-upload/
    ├── requirements.md         # PM Agent output
    ├── architecture-db.md      # DB Architect output
    ├── architecture-api.md     # API Developer output
    ├── implementation-log.md   # Developer output
    ├── code-review.md          # Code Reviewer output
    ├── security-audit.md       # Security Auditor output
    ├── test-report.md          # QA Engineer output
    └── deployment-log.md       # Deployment output
```

**Benefits:**
- ✅ Can review why decisions were made
- ✅ New team members can understand feature evolution
- ✅ Compliance audits have complete trail
- ✅ Post-mortems have detailed context

### Cost-Benefit Analysis

**Compared to Traditional Development:**

| Aspect | Traditional | Raw AI Coding | Multi-Agent System |
|--------|------------|---------------|-------------------|
| **Speed** | 12-18 months | 3-6 months | 3-6 months |
| **Cost** | $500K+ | $50K | $50K |
| **Quality** | Variable (human error) | Inconsistent | Systematic (enforced) |
| **Testing** | Often skipped | Often skipped | Enforced (blocked) |
| **Integration** | Late-stage issues | Hope it works | Designed upfront |
| **Traceability** | Scattered docs | Chat history | File artifacts |

**Multi-agent system combines speed of AI with quality of traditional structured development.**

### Learning from Legacy: Week 1 is Sacred

**Legacy Mistake:**
- Day 1-7: Built 8 modules rapidly
- Week 2-4: Discovered integration issues, spent 3 weeks fixing

**v3 Approach (via multi-agent workflow):**

**Week 1 enforced by Orchestrator:**
```typescript
// Week 1 checklist - Orchestrator blocks feature work until complete
const week1Requirements = {
  unifiedSchemaDeployed: false,    // DB Architect agent
  eventBusImplemented: false,      // Integration Specialist agent
  trpcRootRouterSetup: false,      // API Developer agent
  qualityHooksConfigured: false,   // QA agent
  cicdPipelinePassing: false,      // Deployment agent
};

// Orchestrator rejects "/feature" workflow if Week 1 incomplete
if (!allWeek1RequirementsMet()) {
  throw new Error('Complete Week 1 foundation before building features');
}
```

**Result:** Foundation complete before features → Integration works from Day 1.

---

## Consequences

### Positive ✅

1. **10x Speed:** 3-6 months vs 12-18 months
2. **10x Cost Savings:** $50K vs $500K
3. **Consistent Quality:** Agents follow rules perfectly
4. **No Human Error:** Agents don't forget RLS policies, tests, etc.
5. **Scalable:** Add more agents easily (e.g., Mobile Dev Agent)
6. **24/7 Availability:** Agents work weekends, holidays
7. **Knowledge Retention:** All decisions documented in artifacts
8. **Parallel Execution:** DB + API + Frontend simultaneously
9. **Always Up-to-Date:** Agents use latest best practices
10. **Rapid Iteration:** Fix and redeploy in minutes

### Negative ❌

1. **Learning Curve:** Team needs to learn workflow orchestration
2. **Agent Maintenance:** Prompts need tuning over time
3. **Dependency on Claude API:** If Anthropic down, we're blocked
4. **Less "Craft":** Less room for creative problem-solving
5. **Debugging Complexity:** Agent outputs harder to debug than own code
6. **Context Limits:** Very large features need breaking down
7. **Approval Overhead:** Human gates add latency (but necessary)

### Neutral ⚖️

1. **Different Process:** Not better/worse, just different
2. **Trust Building:** Takes time to trust agent outputs
3. **Cultural Shift:** From "writing code" to "reviewing code"

---

## Workflow Patterns

### Pattern 1: Full Feature Development

```
User Request: "Add candidate bulk upload feature"
    │
    ▼
ORCHESTRATOR → Selects "feature" workflow
    │
    ▼
PM AGENT → Gathers requirements, creates user stories
    │ (Human approves)
    ▼
PARALLEL EXECUTION:
    ├─> DB ARCHITECT → Designs schema, RLS policies
    ├─> API DEVELOPER → Designs server actions, validation
    └─> FRONTEND DEV → Designs UI components, forms
    │
    ▼
INTEGRATION SPECIALIST → Merges all components
    │
    ▼
PARALLEL EXECUTION:
    ├─> CODE REVIEWER → Checks quality, conventions
    └─> SECURITY AUDITOR → Scans for vulnerabilities
    │
    ▼
QA ENGINEER → Writes and runs tests
    │
    ▼
DEPLOYMENT SPECIALIST → Deploys to staging
    │ (Human approves)
    ▼
DONE ✅
```

**Timeline:** 30-60 minutes
**Cost:** $0.10-0.50 (with caching)

### Pattern 2: Bug Fix (Fast Path)

```
User Request: "Fix login redirect loop"
    │
    ▼
ORCHESTRATOR → Selects "bug-fix" workflow
    │
    ▼
DEVELOPER → Analyzes, fixes issue
    │
    ▼
QA → Tests fix
    │
    ▼
DEPLOY → Ships to production
```

**Timeline:** 10-20 minutes
**Cost:** $0.05-0.15

### Pattern 3: Strategic Review

```
User Request: "Should we add a mobile app?"
    │
    ▼
ORCHESTRATOR → Selects "ceo-review" workflow
    │
    ▼
PARALLEL EXECUTION:
    ├─> CEO ADVISOR → Market analysis, strategic fit
    └─> CFO ADVISOR → Cost-benefit analysis, ROI
    │
    ▼
REPORT GENERATED → Human makes decision
```

**Timeline:** 15-30 minutes
**Cost:** $0.20-0.40

---

## Alternatives Considered

### Alternative 1: Traditional Development (Hire Developers)
**Pros:**
- Full control
- Deep domain expertise
- Flexible problem-solving

**Cons:**
- $500K+ budget needed
- 12-18 months to MVP
- 5+ developers to hire/manage
- Human error (forget RLS, skip tests)
- Slower iteration

**Why Rejected:** Too slow, too expensive. Can't compete with AI-first competitors.

### Alternative 2: Single AI Assistant (ChatGPT/Claude)
**Pros:**
- Simple setup
- Low learning curve
- Flexible

**Cons:**
- Inconsistent outputs
- No specialization
- Forgets context
- No orchestration
- Manual copy-paste workflow

**Why Rejected:** Doesn't scale. Works for prototypes, not production systems.

### Alternative 3: GitHub Copilot / Cursor AI (Augmentation Only)
**Pros:**
- Works within existing workflow
- Developer stays in control
- Faster typing

**Cons:**
- Still requires full developer time
- No orchestration
- No quality gates
- No systematic approach

**Why Rejected:** Augmentation is good, but we need automation for 10x speed.

### Alternative 4: No-Code/Low-Code (Bubble, Retool, etc.)
**Pros:**
- Fast initial build
- No coding required

**Cons:**
- Limited customization
- Vendor lock-in
- Can't build "living organism"
- Poor performance at scale
- Expensive at scale

**Why Rejected:** Our vision requires full control. No-code too limiting.

---

## Related Decisions

- **ADR-001:** Use Drizzle ORM (agents generate Drizzle schemas)
- **ADR-002:** Standard Schema Patterns (agents follow these rules)
- **Future ADR:** Human-in-the-Loop Patterns (when to intervene)

---

## Implementation Notes

### Workflow Definition Structure

```typescript
// .claude/orchestration/workflows/feature.ts
export const featureWorkflow: WorkflowDefinition = {
  name: 'feature',
  description: 'Complete feature development pipeline',

  steps: [
    {
      name: 'requirements',
      agent: 'pm',
      approvalRequired: true, // Human gate
      outputArtifact: 'requirements.md',
    },
    {
      name: 'architecture',
      dependsOn: ['requirements'],
      parallel: [ // Execute in parallel
        {
          name: 'database',
          agent: 'database-architect',
          outputArtifact: 'architecture-db.md',
        },
        {
          name: 'api',
          agent: 'api-developer',
          outputArtifact: 'architecture-api.md',
        },
        {
          name: 'frontend',
          agent: 'frontend-developer',
          outputArtifact: 'architecture-frontend.md',
        },
      ],
    },
    {
      name: 'implementation',
      dependsOn: ['architecture'],
      agent: 'integration-specialist',
      outputArtifact: 'implementation-log.md',
    },
    {
      name: 'quality',
      dependsOn: ['implementation'],
      parallel: [
        {
          name: 'code-review',
          agent: 'code-reviewer',
          outputArtifact: 'code-review.md',
        },
        {
          name: 'security-audit',
          agent: 'security-auditor',
          outputArtifact: 'security-audit.md',
        },
      ],
    },
    {
      name: 'testing',
      dependsOn: ['quality'],
      agent: 'qa',
      outputArtifact: 'test-report.md',
      failOnError: true, // Block deployment if tests fail
    },
    {
      name: 'deployment',
      dependsOn: ['testing'],
      agent: 'deployment',
      approvalRequired: true, // Human gate
      outputArtifact: 'deployment-log.md',
    },
  ],
}
```

### CLI Usage

```bash
# Start feature development
pnpm orchestrate:feature "Add candidate bulk upload with CSV validation"

# Fix a bug
pnpm orchestrate:bug-fix "Login redirect loop on /dashboard"

# Get strategic review
pnpm orchestrate:ceo-review "Should we add a mobile app?"

# Design database schema
pnpm orchestrate:database "Create bench sales tracking tables"

# Run comprehensive testing
pnpm orchestrate:test "Test entire recruiting workflow"

# Deploy to production
pnpm orchestrate:deploy "Deploy version 1.2.0"
```

### Approval Gates (Human Review)

```typescript
// During workflow execution
console.log('🔍 PM Agent completed requirements gathering')
console.log('📄 Artifact: requirements.md')
console.log('')
console.log('--- REQUIREMENTS ---')
console.log(requirementsContent)
console.log('--------------------')
console.log('')

const approved = await promptUser('Approve these requirements? (yes/no): ')

if (approved === 'yes') {
  // Continue to next step
} else {
  // Ask for modifications
  const feedback = await promptUser('What needs to change?: ')
  // Re-run PM agent with feedback
}
```

---

## Quality Assurance

### Agent Output Validation

Every agent output is validated:

1. **TypeScript Compilation** - Must compile with no errors
2. **ESLint** - Must pass linting (warnings OK with reason)
3. **Schema Validation** - Drizzle schemas must follow ADR-002
4. **Test Coverage** - Critical paths must have tests
5. **Build Success** - `pnpm build` must succeed

If validation fails → workflow stops → human intervention required.

### Cost Monitoring

Track costs per workflow:

```typescript
{
  workflowId: 'uuid',
  workflow: 'feature',
  totalTokens: 125000,
  cacheHits: 112500, // 90% cache hit rate
  cacheMisses: 12500,
  estimatedCost: 0.15, // $0.15
  timeSaved: '$2.25', // Would have cost $2.40 without caching
}
```

### Performance Benchmarks

| Workflow | Target Time | Target Cost | Target Quality |
|----------|-------------|-------------|----------------|
| **Feature** | <60 min | <$0.50 | 95% approval rate |
| **Bug Fix** | <20 min | <$0.15 | 100% fix rate |
| **CEO Review** | <30 min | <$0.40 | 90% actionable |
| **Database** | <15 min | <$0.10 | 100% RLS compliant |
| **Test** | <10 min | <$0.05 | 100% pass rate |

---

## Risk Mitigation

### Risk 1: Claude API Downtime
**Mitigation:**
- Monitor Anthropic status page
- Have manual fallback plan
- Local work continues (agents run async)
- Implement retry logic with exponential backoff

### Risk 2: Agent Output Quality Degrades
**Mitigation:**
- Monthly prompt tuning based on feedback
- A/B test prompt variations
- Track approval rates (alert if <85%)
- Human can always override/fix

### Risk 3: Cost Explosion
**Mitigation:**
- Cost alerts at $100, $500, $1000/month
- Caching reduces costs 90%+
- Rate limiting (max 10 workflows/day initially)
- Cost review in weekly meetings

### Risk 4: Context Window Limitations
**Mitigation:**
- Break large features into smaller chunks
- Use folder CLAUDE.md files (concise context)
- Agents request specific files, not entire codebase
- Incremental development (small PRs)

---

## Success Metrics

### Quantitative

| Metric | Baseline | 3-Month Target |
|--------|----------|----------------|
| **Feature Velocity** | 0 | 20 features/month |
| **Bug Fix Time** | - | <1 hour |
| **Deployment Frequency** | - | Daily |
| **Code Quality** | - | 95%+ approval |
| **Test Coverage** | - | 80%+ |
| **Cost per Feature** | - | <$0.50 |

### Qualitative

- [ ] Team trusts agent outputs (survey: 8/10+)
- [ ] Faster iteration vs traditional dev (10x)
- [ ] High-quality, maintainable code
- [ ] Clear audit trail (artifacts)
- [ ] Positive developer experience

---

## Review Schedule

- **Weekly:** Review workflow metrics (velocity, cost, quality)
- **Monthly:** Tune agent prompts based on feedback
- **Quarterly:** Add new agents or workflows as needed
- **Annually:** Full retrospective on approach

---

## Future Enhancements

### Planned (Next 6 Months)
- [ ] Self-healing: Agent detects + fixes own mistakes
- [ ] Context memory: Agents remember past decisions
- [ ] Visual design agent: Generate Figma designs
- [ ] Mobile dev agent: React Native development
- [ ] Performance agent: Automatic optimization

### Under Consideration
- [ ] Multi-language support (Python, Go, etc.)
- [ ] Agent specialization (GPT-4 for code, Claude for reasoning)
- [ ] Community agent marketplace (reusable agents)
- [ ] Agent-to-agent collaboration (no human orchestrator)

---

**Last Updated:** 2025-11-17
**Owner:** CEO, Architecture Team
**Review Date:** 2026-02-17 (3 months)
