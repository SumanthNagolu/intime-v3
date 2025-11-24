# Cleanup Phase 2 - Decision Document

**Date:** 2025-11-17
**Purpose:** Decide fate of remaining "blueprint" documents

---

## Analysis of Remaining Docs

### Current State (After Phase 1)

**Remaining in `/docs/*.md`:** 11 files

### Classification

#### ✅ KEEP - Living Documentation

1. **CLAUDE.md** (106 lines)
   - Folder context file
   - **Status:** KEEP

2. **README-VISION-DOCS.md** (488 lines)
   - Navigation/index for vision docs
   - **Status:** KEEP

3. **BOARD-EXECUTIVE-SUMMARY.md** (774 lines)
   - High-level business overview
   - **Status:** KEEP

4. **PROJECT-TIMELINE-SYSTEM.md** (499 lines)
   - Active system documentation
   - **Status:** KEEP

5. **CLEANUP-PLAN.md** (new, this session)
   - Active cleanup documentation
   - **Status:** KEEP

#### 📚 KEEP - Reference Documentation

6. **AGENT-LIBRARY.md** (4337 lines)
   - Comprehensive agent prompt reference
   - Actual agents are in .claude/agents/ subdirs
   - This is valuable reference/documentation
   - **Status:** KEEP (not duplicate, it's reference)

7. **ORCHESTRATION-CODE.md** (2368 lines)
   - TypeScript code templates/examples
   - Actual code is in .claude/orchestration/
   - This is valuable reference/templates
   - **Status:** KEEP (not duplicate, it's reference)

8. **VISION-AND-STRATEGY.md** (2529 lines)
   - v2.0 - Board-ready synthesis
   - Consolidates docs/vision/ folder into single doc
   - **Status:** KEEP (it's a valuable synthesis, not duplicate)

#### ⚠️ REVIEW - Potentially Superseded "Blueprint" Files

9. **MASTER-PROJECT-BLUEPRINT.md** (742 lines)
   - Created: Nov 17, 2025
   - High-level business + technical overview
   - **Question:** Is this superseded by structured docs?
   - **Content:** Executive summary, vision, business model, architecture, financials, roadmap
   - **Verdict:** Potentially superseded by:
     - docs/vision/ (business vision)
     - docs/implementation/ (roadmap)
     - docs/financials/ (financial model)

10. **ULTIMATE-IMPLEMENTATION-BLUEPRINT.md** (1792 lines)
    - Created: Nov 16, 2025
    - "DEFINITIVE" implementation guide
    - **Question:** Is this superseded by SEQUENTIAL-IMPLEMENTATION-ROADMAP.md?
    - **Content:** Step-by-step implementation, agent prompts, orchestration code
    - **Verdict:** Potentially superseded by:
      - docs/implementation/SEQUENTIAL-IMPLEMENTATION-ROADMAP.md
      - AGENT-LIBRARY.md (for agent prompts)
      - ORCHESTRATION-CODE.md (for code examples)

11. **FINAL-SETUP-PLAN.md** (601 lines)
    - Created: Nov 16, 2025
    - "FINAL" multi-agent system rationale
    - **Question:** Is this superseded by current docs?
    - **Content:** Justification for specialized agents, setup plan
    - **Verdict:** Potentially superseded by:
      - docs/adrs/ADR-003-multi-agent-workflow.md (rationale)
      - docs/implementation/ (setup plan)

---

## Decision Framework

### Question 1: Does it contain unique information?

**MASTER-PROJECT-BLUEPRINT.md:**
- ✅ Contains financial projections ($250K seed, $3.84M Year 1 revenue)
- ✅ Contains risk mitigation strategies
- ✅ Contains marketing strategy
- ⚠️ Some overlap with docs/vision/ and docs/financials/

**ULTIMATE-IMPLEMENTATION-BLUEPRINT.md:**
- ⚠️ Much overlap with docs/implementation/SEQUENTIAL-IMPLEMENTATION-ROADMAP.md
- ⚠️ Agent prompts duplicated in AGENT-LIBRARY.md
- ⚠️ Code examples duplicated in ORCHESTRATION-CODE.md
- ℹ️ Might have different organization/perspective

**FINAL-SETUP-PLAN.md:**
- ✅ Contains production system examples (LangGraph, CrewAI, AutoGen)
- ✅ Contains rationale for specialized agents
- ⚠️ Some overlap with docs/adrs/ADR-003-multi-agent-workflow.md

### Question 2: Is it a "one-time" document or "living" documentation?

All three appear to be **planning documents** created during initial setup, not living documentation.

### Question 3: What's the risk of archiving?

**Low Risk** - All content is in git history, can be recovered if needed.

---

## Recommendation

### Option A: Archive All Three (Aggressive Cleanup)

**Rationale:**
- Follow lesson: "Delete dead code aggressively"
- These are historical planning documents
- Information is captured in organized folders
- Reduces confusion about "which doc is current?"

**Action:**
```bash
mv docs/MASTER-PROJECT-BLUEPRINT.md .archive/2025-11-17-planning-docs/
mv docs/ULTIMATE-IMPLEMENTATION-BLUEPRINT.md .archive/2025-11-17-planning-docs/
mv docs/FINAL-SETUP-PLAN.md .archive/2025-11-17-planning-docs/
```

**Result:** 8 files remaining in docs/ (27% reduction from original 11)

---

### Option B: Keep with Deprecation Notice (Conservative)

**Rationale:**
- They might contain unique insights
- Can add deprecation notice at top
- Let natural evolution determine if they're used

**Action:**
Add to top of each file:
```markdown
> ⚠️ **DEPRECATION NOTICE**
>
> This document was created during initial planning (Nov 2025).
> For current authoritative information, see:
> - Business vision: `docs/vision/`
> - Implementation: `docs/implementation/`
> - Agent reference: `AGENT-LIBRARY.md`
> - Architecture decisions: `docs/adrs/`
>
> This document is kept for historical reference only.
```

**Result:** 11 files remaining (no reduction)

---

### Option C: Hybrid - Archive Blueprints, Keep Setup Plan (Balanced)

**Rationale:**
- MASTER and ULTIMATE blueprints are clearly superseded
- FINAL-SETUP-PLAN has unique production system examples

**Action:**
```bash
# Archive blueprints
mv docs/MASTER-PROJECT-BLUEPRINT.md .archive/2025-11-17-planning-docs/
mv docs/ULTIMATE-IMPLEMENTATION-BLUEPRINT.md .archive/2025-11-17-planning-docs/

# Keep FINAL-SETUP-PLAN with deprecation notice
# (has unique LangGraph/CrewAI/AutoGen examples)
```

**Result:** 9 files remaining (18% reduction from original 11)

---

## My Recommendation: **Option A (Aggressive Cleanup)**

### Reasoning

1. **Following Our Own Lesson**
   - "Delete dead code immediately"
   - These are historical planning docs
   - Not "living documentation"

2. **Information is Preserved**
   - Git history keeps everything
   - Key insights already extracted to organized folders
   - Can reference archive if needed

3. **Reduces Confusion**
   - Clear single source of truth
   - No "which blueprint is current?" questions
   - Cleaner project structure

4. **Can Always Unarchive**
   - If unique valuable content discovered later
   - Easy to restore from .archive/

---

## Final Decision

**Execute Option A:**

```bash
# Create planning docs archive
mkdir -p .archive/2025-11-17-planning-docs

# Archive historical blueprints
mv docs/MASTER-PROJECT-BLUEPRINT.md .archive/2025-11-17-planning-docs/
mv docs/ULTIMATE-IMPLEMENTATION-BLUEPRINT.md .archive/2025-11-17-planning-docs/
mv docs/FINAL-SETUP-PLAN.md .archive/2025-11-17-planning-docs/

# Verify
ls docs/*.md | wc -l  # Should be 8
ls .archive/2025-11-17-planning-docs/  # Should show 3 files
```

**Result:**
- **Before:** 16 files in docs/
- **After Phase 1:** 11 files (6 archived)
- **After Phase 2:** 8 files (3 more archived)
- **Total Reduction:** 50% (16 → 8 files)

---

## Remaining Files (Final State)

1. `AGENT-LIBRARY.md` - Agent reference
2. `BOARD-EXECUTIVE-SUMMARY.md` - Business overview
3. `CLAUDE.md` - Folder context
4. `CLEANUP-PLAN.md` - Cleanup documentation
5. `ORCHESTRATION-CODE.md` - Code templates
6. `PROJECT-TIMELINE-SYSTEM.md` - System documentation
7. `README-VISION-DOCS.md` - Navigation
8. `VISION-AND-STRATEGY.md` - Consolidated vision

**All 8 are active, living, or reference documentation. No more historical status reports or planning docs.**

---

**Status:** Ready to Execute Option A
**Next:** Execute cleanup, verify, commit
