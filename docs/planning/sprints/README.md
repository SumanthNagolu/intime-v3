# Sprint Management System

This folder contains the self-evolving sprint management structure for InTime v3.

---

## 📁 Folder Structure

```
sprints/
├── README.md                          # This file - Sprint lifecycle guide
├── SPRINT-PLAN-TEMPLATE.md           # Template for new sprint plans
├── SPRINT-REVIEW-TEMPLATE.md         # Template for sprint reviews
├── sprint-01/                        # Sprint 1 (Week 1-2, Epic 1)
│   ├── PLAN.md                       # Sprint planning document
│   ├── REVIEW.md                     # Sprint review/retrospective
│   ├── stories/                      # Story links for this sprint
│   │   └── README.md                 # Story list with links
│   └── deliverables/                 # Artifacts delivered
│       ├── migrations/               # Database migrations
│       ├── code/                     # Code snapshots (if needed)
│       └── docs/                     # Generated documentation
├── sprint-02/                        # Sprint 2 (Week 3-4, Epic 1)
│   ├── PLAN.md
│   ├── REVIEW.md
│   ├── stories/
│   └── deliverables/
├── sprint-03/                        # Sprint 3 (Week 5-6, Epic 1)
│   ├── PLAN.md
│   ├── REVIEW.md
│   ├── stories/
│   └── deliverables/
├── sprint-04/                        # Sprint 4 (Week 7-8, Epic 2.5)
│   ├── PLAN.md
│   ├── REVIEW.md
│   ├── stories/
│   └── deliverables/
├── sprint-05/                        # Sprint 5 (Week 9-10, Epic 2.5)
│   ├── PLAN.md
│   ├── REVIEW.md
│   ├── stories/
│   └── deliverables/
├── sprint-06/                        # Sprint 6 (Week 11-12, Epic 2.5)
│   ├── PLAN.md
│   ├── REVIEW.md
│   ├── stories/
│   └── deliverables/
└── sprint-07/                        # Sprint 7 (Week 13-14, Epic 2.5)
    ├── PLAN.md
    ├── REVIEW.md
    ├── stories/
    └── deliverables/
```

---

## 🔄 Sprint Lifecycle Workflow

### Phase 1: Story Creation (PM Agent)

**Trigger:** New epic needs implementation

**Process:**
1. PM Agent creates user stories for all epics
2. Stories saved in `/docs/planning/stories/epic-XX-name/`
3. Each story includes:
   - User story format (As a... I want... So that...)
   - Acceptance criteria (8-10 testable criteria)
   - Technical implementation details
   - Database migrations
   - Testing checklist

**Output:** Complete story library for epic

**Example:**
```bash
# PM Agent creates stories
/workflows:start-planning Epic 2.5 AI Infrastructure

# Stories created in:
docs/planning/stories/epic-02.5-ai-infrastructure/
├── AI-INF-001-model-router.md
├── AI-INF-002-rag-infrastructure.md
└── ... (15 total stories)
```

---

### Phase 2: Sprint Organization (PM Agent)

**Trigger:** Stories for epic are complete

**Process:**
1. PM Agent analyzes story dependencies
2. Groups stories into logical sprints (2-week iterations)
3. Allocates story points (target: 20-30 pts per sprint)
4. Creates sprint folder structure
5. Populates `stories/README.md` with story links

**Output:** Sprint folders with story assignments

**Example:**
```bash
# PM organizes stories into sprints
# Input: 15 stories, 87 points
# Output: 4 sprints

sprint-04/stories/README.md  # AI-INF-001, 002, 003 (21 pts)
sprint-05/stories/README.md  # AI-INF-004, 005, 006, 007 (19 pts)
sprint-06/stories/README.md  # AI-GURU-001, 002, 003, 004 (26 pts)
sprint-07/stories/README.md  # AI-PROD-001, 002, 003, AI-TWIN-001 (21 pts)
```

---

### Phase 3: Sprint Planning (PM + Architect)

**Trigger:** Sprint about to start

**Process:**
1. PM creates `PLAN.md` from template
2. Fills in:
   - Sprint goal
   - Story list with points
   - Team allocation
   - Success criteria
   - Risks and mitigation
   - Definition of done
3. Architect reviews and adds:
   - Technical approach
   - Architecture decisions
   - Integration points
4. Plan approved by stakeholders

**Output:** `sprint-XX/PLAN.md` ready for execution

**Example:**
```bash
# Create sprint plan
cp SPRINT-PLAN-TEMPLATE.md sprint-04/PLAN.md

# PM fills in details
# Architect adds technical approach
# Plan committed to git
```

---

### Phase 4: Sprint Execution (Developer + QA)

**Trigger:** Sprint plan approved

**Process:**
1. Developer Agent implements stories (TDD approach)
2. Daily standups track progress
3. Update `PLAN.md` with progress
4. QA Agent tests as features complete
5. Code reviews and merge to main
6. Integration testing on Friday of each week

**Output:** Working features, tests, documentation

**Example:**
```bash
# Execute sprint
/workflows:feature Sprint 4 - Epic 2.5 AI Infrastructure Foundation

# Agents work through:
# - PM: Requirements validation
# - Architect: Design review
# - Developer: Implementation
# - QA: Testing and quality gates

# Code delivered to:
sprint-04/deliverables/
├── migrations/004_add_ai_infrastructure.sql
├── code/
│   ├── src/lib/ai/router.ts
│   ├── src/lib/ai/rag.ts
│   └── src/lib/ai/memory.ts
└── docs/
    └── ai-infrastructure-architecture.md
```

---

### Phase 5: Sprint Review (QA + PM)

**Trigger:** Sprint end (Day 10)

**Process:**
1. QA Agent validates all acceptance criteria met
2. PM creates `REVIEW.md` from template
3. Fills in:
   - Stories completed vs. planned
   - Metrics (velocity, coverage, performance)
   - What went well
   - What could be improved
   - Lessons learned
   - Action items for next sprint
4. Team retrospective meeting
5. Demo to stakeholders

**Output:** `sprint-XX/REVIEW.md` documenting sprint results

**Example:**
```bash
# Create sprint review
cp SPRINT-REVIEW-TEMPLATE.md sprint-04/REVIEW.md

# QA + PM fill in actual results
# Completed: 21/21 points (100%)
# Velocity: 2.1 pts/day
# Coverage: 85%

# Review committed to git
```

---

### Phase 6: Deployment (DevOps)

**Trigger:** Sprint review approved

**Process:**
1. Merge to main branch
2. CI/CD pipeline runs
3. Deploy to staging
4. Smoke tests pass
5. Deploy to production (if ready)
6. Monitor for 24 hours
7. Update `REVIEW.md` with deployment status

**Output:** Features live in production

**Example:**
```bash
# Deployment process
git checkout main
git merge sprint-04
git push origin main

# Vercel auto-deploys
# Sentry monitors errors
# Update REVIEW.md with production URL
```

---

### Phase 7: Sprint Closure

**Trigger:** Deployment successful and stable

**Process:**
1. Mark sprint as ✅ COMPLETE in `REVIEW.md`
2. Archive deliverables
3. Create handoff document for next sprint
4. Update epic progress (e.g., "Epic 2.5: 25% complete - 1/4 sprints done")
5. Close sprint branch
6. Begin next sprint planning

**Output:** Sprint closed, next sprint ready

**Example:**
```bash
# Update REVIEW.md
Status: ✅ COMPLETE
Deployment: Production deployed 2025-11-25
Epic Progress: Epic 2.5 - 25% complete (1/4 sprints)

# Ready for Sprint 05
```

---

## 🎯 Quick Reference: Who Does What

| Phase | Primary Agent | Supporting Agents | Output |
|-------|---------------|-------------------|--------|
| **Story Creation** | PM | - | Story files in `stories/epic-XX/` |
| **Sprint Organization** | PM | - | `sprint-XX/stories/README.md` |
| **Sprint Planning** | PM | Architect | `sprint-XX/PLAN.md` |
| **Execution** | Developer | QA | Code in `sprint-XX/deliverables/` |
| **Review** | QA, PM | - | `sprint-XX/REVIEW.md` |
| **Deployment** | DevOps | - | Production deployment |
| **Closure** | PM | - | Sprint marked complete |

---

## 📋 Sprint Status Legend

- 🔵 **Planning** - Sprint plan being created
- 🟡 **In Progress** - Sprint execution underway
- ✅ **Complete** - Sprint finished, reviewed, and deployed
- 🔴 **Blocked** - Sprint blocked by external dependency
- 🟠 **At Risk** - Sprint behind schedule or quality issues

---

## 🔗 Related Documentation

- [Epic Definitions](/docs/planning/epics/)
- [User Stories](/docs/planning/stories/)
- [Sprint Plan Template](./SPRINT-PLAN-TEMPLATE.md)
- [Sprint Review Template](./SPRINT-REVIEW-TEMPLATE.md)

---

## 📊 Current Sprint Status

| Sprint | Epic | Week | Status | Stories | Points | Completion |
|--------|------|------|--------|---------|--------|------------|
| Sprint 01 | Epic 1 | 1-2 | ✅ Complete | 6 | 34 | 100% |
| Sprint 02 | Epic 1 | 3-4 | ✅ Complete | 6 | 26 | 100% |
| Sprint 03 | Epic 1 | 5-6 | ✅ Complete | 6 | 7 | 100% |
| Sprint 04 | Epic 2.5 | 7-8 | 🔵 Planning | 3 | 21 | 0% |
| Sprint 05 | Epic 2.5 | 9-10 | 🔵 Planning | 4 | 19 | 0% |
| Sprint 06 | Epic 2.5 | 11-12 | 🔵 Planning | 4 | 26 | 0% |
| Sprint 07 | Epic 2.5 | 13-14 | 🔵 Planning | 4 | 21 | 0% |

---

## 🚀 Getting Started

### For PM Agent (Story Creation)
```bash
# Create stories for new epic
/workflows:start-planning Epic X - [Epic Name]

# Stories will be created in:
docs/planning/stories/epic-XX-name/
```

### For PM Agent (Sprint Organization)
```bash
# After stories are created, organize into sprints
# Manually create sprint-XX/stories/README.md
# List stories with links to story files
```

### For PM + Architect (Sprint Planning)
```bash
# Copy template
cp SPRINT-PLAN-TEMPLATE.md sprint-XX/PLAN.md

# Fill in details
# Commit to git
```

### For Developer + QA (Sprint Execution)
```bash
# Execute sprint with workflow
/workflows:feature Sprint XX - [Sprint Name]

# Follow PLAN.md for daily guidance
```

### For QA + PM (Sprint Review)
```bash
# Copy template
cp SPRINT-REVIEW-TEMPLATE.md sprint-XX/REVIEW.md

# Fill in results
# Commit to git
```

---

**Last Updated:** 2025-11-19
**Version:** 1.0 - Self-evolving sprint system
**Status:** ✅ Ready for use
