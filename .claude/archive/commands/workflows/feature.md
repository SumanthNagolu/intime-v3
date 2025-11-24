---
description: Execute a story through the full development pipeline (PM → Architect → Developer → QA → Deploy)
---

**🚀 This workflow is now automated!**

Instead of me executing this manually, use the unified workflow system:

**NEW Automated Command:**
```bash
pnpm workflow feature [STORY-ID]
```

**Example:**
```bash
pnpm workflow feature AI-GURU-002-code-mentor
```

**Or use this slash command (triggers same system):**
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

**Estimated Time:** 1-4 hours depending on story complexity

---

## 📋 Post-Workflow Auto-Updates

After this workflow completes, the following documentation will be **automatically updated**:

✅ **Story File** (`docs/planning/stories/[epic-id]/[story-id].md`)
- Status badge: ⚪ → 🟡 → 🟢
- Completion date
- Implementation notes

✅ **Epic File** (`docs/planning/epics/[feature]/[epic-id].md`)
- Progress percentage updated (based on completed stories)
- Story completion status updated

✅ **Feature File** (`docs/planning/features/[feature-name].md`)
- Overall progress percentage recalculated
- Epic progress updated

✅ **Project Timeline** (`.claude/state/timeline/`)
- Story completion logged
- Timeline metrics updated

**How it works:**
1. Workflow creates/modifies code, tests, and docs
2. Post-workflow hook (`.claude/hooks/post-workflow.sh`) detects changes
3. Auto-update script (`scripts/update-documentation.ts`) runs
4. All related documentation syncs automatically
5. Update report generated

**Manual verification:**
Run `pnpm doc:verify` to validate all documentation is consistent.

**See:** `/docs/DOCUMENTATION-AUTO-UPDATE-SPEC.md` for complete details.

---

Let me start the pipeline...
