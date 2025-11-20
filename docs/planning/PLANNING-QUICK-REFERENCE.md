# Planning System - Quick Reference Card

**Print this and keep it handy!**

---

## 🎯 The 5-Stage Process

```
FEATURE → EPIC → STORY → SPRINT → EXECUTE
```

---

## 📋 Commands Cheat Sheet

```bash
# Stage 1: What are we building?
/workflows:define-feature [Feature-Name]
→ Output: docs/planning/features/[feature-name].md

# Stage 2: What are the major pieces?
/workflows:create-epics [Feature-Name]
→ Output: docs/planning/epics/epic-[id]-[name].md (multiple)

# Stage 3: What are the specific tasks?
/workflows:create-stories [epic-id]
→ Output: docs/planning/stories/[epic-id]/[story-id].md (multiple)

# Stage 4: When do we build?
/workflows:plan-sprint [sprint-number] [epic-id]
→ Output: docs/planning/sprints/sprint-[N]/sprint-plan.md

# Stage 5: Build it!
/workflows:feature [story-id]
→ Output: Working code in production
```

---

## 📊 Hierarchy Example

```
FEATURE: Recruiting Automation (3-12 months)
  │
  ├─ EPIC 4.1: Resume Parsing (1-3 months, 28 story points)
  │   ├─ STORY: PARSE-001 Upload (5 pts, 2 days)
  │   ├─ STORY: PARSE-002 AI Extract (8 pts, 3 days)
  │   ├─ STORY: PARSE-003 LinkedIn (5 pts, 2 days)
  │   ├─ STORY: PARSE-004 Profile (5 pts, 2 days)
  │   └─ STORY: PARSE-005 Dedupe (5 pts, 2 days)
  │
  ├─ EPIC 4.2: Auto-Qualification (2 months)
  ├─ EPIC 4.3: Interview Scheduling (1 month)
  └─ EPIC 4.4: Communication (1 month)

SPRINT 7 (2 weeks): PARSE-001, 002, 003, 004 (23 points)
SPRINT 8 (2 weeks): PARSE-005 + Epic 4.2 stories (24 points)
```

---

## 🎯 Story Points = Time

| Points | Complexity | Time | Example |
|--------|-----------|------|---------|
| 1 | Trivial | 4 hours | Config change |
| 2 | Simple | 8 hours | Basic CRUD |
| 3 | Easy | 12 hours | Form + validation |
| 5 | Medium | 20 hours | API integration |
| 8 | Complex | 32 hours | AI feature |
| 13 | Very Complex | 52 hours | Multi-agent system |

**Split stories >13 points into smaller ones!**

---

## 📐 Sprint Capacity Rules

- **Duration:** 2 weeks (10 working days)
- **Team Size:** 2 developers
- **Points per Developer:** 10-12 points/sprint
- **Total Capacity:** 20-24 points/sprint
- **Buffer:** 20% for unknowns (meetings, bugs, etc.)

**Example Sprint:**
- Dev 1: 12 points (3 stories)
- Dev 2: 12 points (3 stories)
- Total: 24 points ✅

---

## ✅ Story Status Badges

- ⚪ **Not Started** - In backlog
- 🔵 **Planned** - In sprint plan
- 🟡 **In Progress** - Currently building
- 🟢 **Complete** - Deployed to production
- 🔴 **Blocked** - Waiting on dependencies
- ⏸️ **Paused** - Deprioritized

---

## 🚦 Definition of Done (Story)

Every story must check all these boxes:

- [ ] Code implemented
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests passing
- [ ] E2E tests for critical paths
- [ ] Code reviewed (by Architect Agent)
- [ ] Documentation updated
- [ ] Deployed to production
- [ ] Verified in production (smoke test)
- [ ] Acceptance criteria validated (by QA Agent)

**If any box is unchecked, story is NOT done!**

---

## 🔗 Dependencies

Stories can depend on other stories:

```
PARSE-001 (Upload)
  └─ PARSE-002 (Extract) ← depends on upload
      └─ PARSE-004 (Profile) ← depends on extraction
          └─ PARSE-003 (Enrich) ← depends on profile
```

**Rule:** Can't start a story until dependencies are 🟢 Complete

---

## 📁 File Organization

```
docs/planning/
├── features/               # Business capabilities
│   └── [feature-name].md
│
├── epics/                  # Major components
│   └── epic-[id]-[name].md
│
├── stories/                # Implementable units
│   └── [epic-id]/
│       ├── README.md       # Epic summary
│       └── [STORY-ID]-[name].md
│
└── sprints/                # Time-boxed execution
    └── sprint-[N]/
        ├── sprint-plan.md  # What we're building
        ├── deliverables/   # What we built
        └── retrospective.md # What we learned
```

---

## 🎯 Story ID Conventions

| Epic | Prefix | Example |
|------|--------|---------|
| Foundation | FOUND | FOUND-001-database-schema |
| Training Academy | ACAD | ACAD-001-course-tables |
| AI Infrastructure | AI-INF | AI-INF-001-model-router |
| Guidewire Guru | AI-GURU | AI-GURU-001-coordinator |
| Resume Matching | AI-MATCH | AI-MATCH-001-semantic-search |
| Recruiting Services | RECR | RECR-001-job-requisitions |
| Bench Sales | BENCH | BENCH-001-consultant-matching |

---

## ⚡ Quick Start (Your First Feature)

```bash
# 1. Define feature (5 min)
/workflows:define-feature My-First-Feature

# 2. Create epics (10 min)
/workflows:create-epics My-First-Feature

# 3. Create stories for first epic (15 min)
/workflows:create-stories epic-5.1-my-component

# 4. Plan first sprint (10 min)
/workflows:plan-sprint 8 epic-5.1-my-component

# 5. Execute first story (1-4 hours)
/workflows:feature MYFT-001-my-first-story

# Done! 🎉 Your first story is in production
```

---

## 🚨 Common Mistakes

❌ **Starting to code without a story**
✅ Always create story first (`/workflows:create-stories`)

❌ **Skipping sprint planning**
✅ Plan sprint before execution (`/workflows:plan-sprint`)

❌ **Working on >3 stories at once**
✅ Focus: Complete current story before starting next

❌ **Stories >13 points**
✅ Split large stories into smaller ones (5-8 points ideal)

❌ **Ignoring dependencies**
✅ Complete dependencies first (can't build roof before foundation)

---

## 📞 Need Help?

1. Read full guide: `docs/planning/HOW-TO-USE-PLANNING-SYSTEM.md`
2. Read hierarchy doc: `docs/planning/FEATURE-EPIC-STORY-SPRINT-HIERARCHY.md`
3. See examples: `docs/planning/stories/epic-*/` (existing stories)
4. Ask Claude: "How do I [planning task]?"

---

**Happy Planning! 🚀**
