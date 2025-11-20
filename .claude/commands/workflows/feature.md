---
description: Stage 5 - Execute a story through the full development pipeline (PM → Architect → Developer → QA → Deploy)
---

I'll execute this story through our complete development pipeline.

**Usage:**
```
/workflows:feature [STORY-ID]
```

**Example:**
```
/workflows:feature AI-GURU-002-code-mentor
```

**What This Does:**
1. **PM Agent** - Reads story from `docs/planning/stories/[epic-id]/[story-id].md`
2. **Architect Agent** - Designs database schema, API contracts, component architecture
3. **Developer Agent** - Implements code with tests (80%+ coverage)
4. **QA Agent** - Validates acceptance criteria and runs tests
5. **Deployment Agent** - Deploys to production safely

**Pipeline Stages**:
- ✅ PM: Validates story requirements exist
- 🏗️ Architect: Creates technical design
- 💻 Developer: Implements + tests
- ✅ QA: Validates all acceptance criteria
- 🚀 Deploy: Ships to production

**Story Status Updates:**
- Before: ⚪ Not Started or 🔵 Planned
- During: 🟡 In Progress
- After: 🟢 Complete (in production)

**Prerequisites:**
- Story must exist in `docs/planning/stories/[epic-id]/[story-id].md`
- All dependency stories must be complete
- Story must be in current or past sprint plan

**Estimated Time:** 1-4 hours depending on story complexity

Let me start the pipeline...
