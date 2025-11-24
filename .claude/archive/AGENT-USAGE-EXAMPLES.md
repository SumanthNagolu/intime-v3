# InTime v3 - Agent System Usage Examples

## How to Use InTime's Multi-Agent Orchestration System

This document provides real-world examples of how to use the 8 specialist agents for common InTime staffing scenarios.

---

## Quick Reference: When to Use Which Agent

| Scenario | Primary Agent | Supporting Agents |
|----------|--------------|-------------------|
| New feature decision | CEO Advisor | CFO Advisor |
| Feature requirements | PM Agent | - |
| Database design | Database Architect | - |
| API development | API Developer | Database Architect |
| UI development | Frontend Developer | API Developer |
| Cross-pillar integration | Integration Specialist | All implementation |
| Testing | QA Engineer | - |
| Deployment | Deployment Specialist | QA Engineer |
| Code review | Code Reviewer | - |
| Security audit | Security Auditor | Code Reviewer |

---

## Scenario 1: "Should we build AI resume builder?"

### Context
Training Academy wants to help graduates create better resumes. Is this worth building?

### Workflow Command
```bash
/ceo-review
```

### What Happens

#### CEO Advisor analyzes:
1. **Pillar Impact**:
   - Primary: Training Academy (better job placement rates)
   - Secondary: Recruiting (higher quality candidate resumes)
   - Cross-pollination: Graduates who get jobs faster refer more students

2. **Market Positioning**:
   - Differentiator: Most training programs don't offer this
   - Competitive advantage: End-to-end candidate transformation
   - Evidence: 70% of graduates struggle with resume writing (from survey)

3. **5-Year Vision Alignment**:
   - Year 1 (Internal): Helps IntimeESolutions graduates
   - Year 2 (B2B SaaS): Valuable feature for "IntimeOS" clients
   - Year 3+ (Expansion): Works for any industry

4. **Resource Allocation**:
   - Opportunity cost: Not building advanced job matching algorithm
   - ROI: 30% faster placements × $15k avg placement fee = $450k/year potential
   - Time to value: 6 weeks development, 2 weeks adoption

5. **Risks**:
   - Execution: Moderate (AI integration, template design)
   - Market: Low (proven demand from graduates)
   - Technical debt: Low (self-contained feature)

#### CFO Advisor calculates:
- Development cost: $30k (240 hours @ $125/hour)
- Expected revenue impact: $450k/year (30% faster placements)
- ROI: 1400% first year
- Break-even: 3 weeks

#### CEO Recommendation:
**APPROVE** with conditions:
1. Phase 1: Basic templates + AI suggestions (4 weeks)
2. Phase 2: Advanced personalization + job tailoring (deferred to Q2)
3. Success metric: 30% reduction in time-to-first-job for graduates

### Example Output
```markdown
## CEO Strategic Recommendation

**Feature**: AI-Powered Resume Builder
**Decision**: APPROVE (Phased Approach)

**Key Rationale**:
- High cross-pollination score (8/10): Benefits Academy + Recruiting
- Strong vision alignment (9/10): Core differentiator for B2B SaaS
- Exceptional ROI: 1400% first year

**Cross-Pollination Score**: 8/10
**Vision Alignment**: 9/10

**Next Steps**:
1. PM Agent to gather detailed requirements
2. Target launch: 6 weeks
3. Success metric: 30% faster job placements

**Full analysis**: `.claude/state/artifacts/ceo-recommendation.md`
```

---

## Scenario 2: "Build candidate pipeline management feature"

### Context
Need complete candidate lifecycle tracking: sourcing → screening → interview → placement → bench

### Workflow Command
```bash
/candidate-pipeline
```

### What Happens

#### 1. PM Agent gathers requirements
**Input**: "Build candidate pipeline management"

**PM Output** (`.claude/state/artifacts/requirements.md`):
```markdown
# Requirements: Candidate Pipeline Management

## Problem Statement
Recruiters manually track candidates across spreadsheets, leading to:
- Lost candidates (no follow-up)
- Duplicate efforts (multiple recruiters contact same candidate)
- No visibility into pipeline health (how many at each stage?)
- Missing cross-pollination (candidate on bench could be perfect for training)

## Business Impact
- **Pillars Affected**: Recruiting (primary), Bench Sales (secondary), Training Academy (tertiary)
- **Cross-Pollination**: Auto-detect when bench candidate needs training, when client needs training academy graduate
- **Pod Impact**: Visibility into pod pipeline health, leaderboard for placements

## User Stories

### Story 1: Add Candidate to Pipeline
**As a** recruiter
**I want** to add a candidate to the pipeline with one click
**So that** I can start tracking them immediately without switching tools

**Acceptance Criteria**:
- [ ] Given I'm on candidate profile, when I click "Add to Pipeline", then candidate is added to "Sourced" stage
- [ ] Given candidate has no resume, when I add to pipeline, then system prompts me to upload resume
- [ ] Given candidate is already in pipeline, when I try to add, then system shows existing pipeline status

**Priority**: Must-have

### Story 2: Move Candidate Through Stages
**As a** recruiter
**I want** to drag-and-drop candidates between pipeline stages
**So that** I can quickly update status without forms

**Acceptance Criteria**:
- [ ] Given I'm viewing pipeline board, when I drag candidate from "Screen" to "Interview", then stage updates and timestamp logged
- [ ] Given candidate moves to "Placed", when stage changes, then system prompts for client and rate information
- [ ] Given candidate moves to "Rejected", when stage changes, then system prompts for rejection reason

**Priority**: Must-have

### Story 3: Cross-Pollination Auto-Detection
**As a** recruiter
**I want** the system to suggest cross-pillar opportunities for each candidate
**So that** I don't miss revenue opportunities

**Acceptance Criteria**:
- [ ] Given candidate on bench for 30+ days, when viewing profile, then system suggests "Enroll in training" with relevant courses
- [ ] Given candidate has rare skill, when viewing profile, then system shows "Market to clients" suggestion
- [ ] Given client needs specific skill, when candidate has that skill, then system alerts recruiter

**Priority**: Should-have

## Success Metrics
1. 80% of recruiters use pipeline daily within 4 weeks
2. 50% reduction in lost candidates (missed follow-ups)
3. 25% increase in cross-pillar leads (training/bench referrals)
4. 100% visibility into pod pipeline health

## Out of Scope (Phase 1)
1. Email integration (auto-send interview invites)
2. Calendar integration (auto-schedule interviews)
3. AI-powered candidate matching
```

#### 2. Database Architect designs schema
**Input**: PM requirements

**Database Output** (`.claude/state/artifacts/architecture-db.md`):
- `candidates` table (with RLS, audit trails, soft deletes, org_id)
- `pipeline_stages` table (configurable stages per org)
- `pipeline_history` table (track all stage transitions)
- `cross_pollination_opportunities` table (auto-detected opportunities)
- `pod_metrics` table (aggregate pipeline performance per pod)

Key features:
- Multi-tenancy isolation via RLS
- Audit trail on all candidate operations
- Soft deletes (GDPR-compliant)
- Indexes for fast search (skills, status, pod_id)

#### 3. API Developer builds server actions
**Input**: Database schema + PM requirements

**API Output**:
- `createCandidate(data)` - Create new candidate
- `updateCandidateStage(id, stage)` - Move through pipeline
- `getCandidatesByStage(stage, podId?)` - Filter by stage
- `detectCrossPollinationOpportunities(candidateId)` - AI-powered detection
- `getPodPipelineMetrics(podId, sprintId)` - Pod performance

All with Zod validation, RLS enforcement, error handling.

#### 4. Frontend Developer builds UI
**Input**: API architecture + PM requirements

**Frontend Output**:
- Kanban board (drag-and-drop between stages)
- Candidate profile page (with timeline of all interactions)
- Cross-pollination opportunities panel
- Pod pipeline dashboard (metrics, leaderboards)

All with:
- Server Components for performance
- Accessibility (keyboard navigation, screen readers)
- Loading/error states
- Optimistic updates (instant UI feedback)

#### 5. Integration Specialist connects pillars
**Input**: All implementation outputs

**Integration Output**:
- Event bus integration (candidate stage changes trigger events)
- Cross-pillar workflows:
  - `training_academy.graduated` → Auto-create candidate in recruiting pipeline
  - `candidate.bench_30_days` → Notify training academy (potential student)
  - `candidate.placed` → Update bench sales availability

#### 6. QA Engineer tests everything
**Input**: Implementation log + requirements

**QA Output** (`.claude/state/artifacts/test-report.md`):
- ✅ Unit tests: 85% coverage
- ✅ Integration tests: All pipeline transitions tested
- ✅ E2E tests: Complete user flow (add → screen → interview → place)
- ✅ Multi-tenancy: Org A cannot see Org B candidates
- ✅ Cross-pollination: Auto-detects opportunities correctly
- ✅ Performance: Pipeline load < 1.5s with 1000 candidates

**Status**: Ready for deployment

#### 7. Deployment Specialist deploys safely
**Input**: Test report + implementation

**Deployment Output**:
- Database migrations run (with RLS policies)
- Feature flag enabled (gradual rollout)
- Monitoring dashboards set up
- Rollback plan documented

**Status**: Deployed to production, monitoring for 24 hours

---

## Scenario 3: "Track cross-pollination opportunities"

### Context
Every client call, candidate interview, or training interaction should reveal 5+ business opportunities across pillars.

### Workflow Command
```bash
/cross-pollination
```

### What Happens

#### CEO Advisor validates strategic importance
**Analysis**: Cross-pollination is InTime's competitive moat. This is the most important feature. **APPROVED**

#### PM Agent defines opportunity tracking
**Requirements**:
- Capture interaction summaries (client calls, candidate interviews, etc.)
- AI analyzes summaries for cross-pillar keywords
- Auto-create tasks for relevant pillar teams
- Track opportunity conversion (did it lead to revenue?)
- Dashboard showing cross-pollination ROI per pod

#### Database Architect designs opportunity tracking
**Schema**:
- `interactions` table (all client/candidate/student interactions)
- `cross_pollination_opportunities` table (AI-detected opportunities)
- `opportunity_tasks` table (actionable tasks for team members)
- `opportunity_conversions` table (track revenue attribution)

#### API Developer builds AI opportunity detector
**Functionality**:
- `logInteraction(summary, pillar)` - Capture interaction
- `detectOpportunities(interactionId)` - AI analysis
- `createOpportunityTask(opportunityId, assignee)` - Create task
- `markOpportunityConverted(opportunityId, revenue)` - Track conversion

Uses Claude API to analyze interaction summaries for patterns.

#### Frontend Developer builds opportunity dashboard
**UI**:
- Real-time opportunity feed (like Twitter feed)
- One-click task creation from opportunity
- Opportunity leaderboard (gamification)
- Cross-pollination heatmap (which pillars connect most?)
- Revenue attribution graph

#### Integration Specialist connects to all 5 pillars
**Event subscriptions**:
- `recruiting.client_call` → Detect training/bench/cross-border opportunities
- `training.enrollment` → Detect recruiting/referral opportunities
- `bench_sales.consultant_check_in` → Detect job/training opportunities

#### QA Engineer validates AI accuracy
**Tests**:
- AI detects 5+ opportunities per interaction (on average)
- Opportunity confidence scores are accurate (>70% precision)
- Tasks are created within 1 hour of interaction
- Revenue attribution tracks correctly

---

## Scenario 4: "New developer joins team - onboarding"

### Context
New developer needs to understand InTime's agent system and contribute quickly.

### Manual Steps (No Workflow Command Yet)

#### Step 1: Read Documentation
```bash
# Start with project context
cat CLAUDE.md

# Understand agent system
cat .claude/AGENT-USAGE-EXAMPLES.md

# Review staffing-specific patterns
cat .claude/MCP-STAFFING-INTEGRATIONS.md
```

#### Step 2: Explore Agents
```bash
# See all available agents
ls .claude/agents/

# Read CEO Advisor (strategic tier)
cat .claude/agents/strategic/ceo-advisor.md

# Read PM Agent (planning tier)
cat .claude/agents/planning/pm-agent.md

# Read Database Architect (implementation tier)
cat .claude/agents/implementation/database-architect.md
```

#### Step 3: Try Workflow Commands
```bash
# See available workflows
ls .claude/commands/workflows/

# Try feature development workflow
/feature "Add candidate notes feature"
```

#### Step 4: Run Quality Gates
```bash
# Make a test commit to see quality gates in action
touch test-file.ts
git add test-file.ts
git commit -m "Test commit"

# Quality gates will run:
# - Database schema validation
# - Staffing business logic checks
# - Cross-pollination reminders
# - Performance validation
# - Test coverage checks
```

---

## Common Questions

### Q: When should I use agents vs. coding myself?

**Use agents for**:
- Strategic decisions (CEO/CFO Advisors)
- New feature planning (PM Agent)
- Database schema design (Database Architect)
- Complex features with multiple components (full pipeline workflows)

**Code yourself for**:
- Small bug fixes
- Simple UI tweaks
- Configuration changes
- Documentation updates

### Q: How do I customize agent behavior for my needs?

Edit the agent definition files:
```bash
# Example: Customize PM Agent
vim .claude/agents/planning/pm-agent.md

# Add your specific requirements format, success metrics, etc.
```

### Q: Can agents work together?

Yes! Use workflow commands like `/feature` or `/candidate-pipeline` to trigger multi-agent orchestration.

### Q: How do I add a new workflow?

Create a new markdown file in `.claude/commands/workflows/`:
```bash
# Example: Pod performance tracking workflow
touch .claude/commands/workflows/pod-metrics.md
```

Then define the workflow steps (which agents, in what order, what they output).

---

## Best Practices

### 1. Always Start with Requirements (PM Agent)
Don't jump straight to coding. Use PM Agent to gather requirements first.

### 2. Validate Strategic Decisions (CEO Advisor)
For any major feature, run it by CEO Advisor to ensure alignment with 5-year vision.

### 3. Design Database First (Database Architect)
Bad schema = technical debt forever. Get it right before building features.

### 4. Test Everything (QA Engineer)
80%+ coverage is mandatory. Multi-tenancy tests are critical.

### 5. Use Quality Gates
Let `.claude/hooks/scripts/pre-commit-staffing.sh` catch issues before they reach production.

---

## Troubleshooting

### Agent returns generic output
**Problem**: Agent doesn't understand InTime-specific context
**Solution**: Agent definition may need more business context. Update agent markdown file.

### Workflow gets stuck
**Problem**: Agent waiting for input or unclear instructions
**Solution**: Check `.claude/state/artifacts/` for agent outputs. See what's blocking.

### Quality gates fail
**Problem**: Code doesn't meet InTime standards (missing RLS, no audit trails, etc.)
**Solution**: Fix errors according to quality gate messages. Standards are non-negotiable.

---

**Last Updated**: 2025-11-17
**Owner**: InTime Engineering Team
**Feedback**: Add more examples? Update this doc!
