# File Organization Analysis & Recommendations

**Date:** 2025-11-20
**Focus:** Temp file handling and sprint work organization

---

## 🔍 CURRENT STATE ANALYSIS

### 1. Temp File Handling

#### What I Found:

**Timeline Session Files** (`.claude/state/timeline/`)
```
session-2025-11-17-D6A31A7C-2025-11-19T11-47-43-455Z.json
session-2025-11-17-D6A31A7C-2025-11-19T00-43-49-852Z.json
session-2025-11-17-D6A31A7C-2025-11-19T10-35-06-785Z.json
... (35+ files)
```
- **Status:** Accumulating indefinitely
- **Size:** Small JSON files (~1-5KB each)
- **Purpose:** Track session work for timeline generation
- **Problem:** Growing unbounded, no cleanup

**Workflow State Files** (`.claude/state/`)
```
workflow-35201fc2-07b6-479d-a21b-e4a6b0d14710.json
current-session.txt
```
- **Status:** Old workflow files remain
- **Problem:** Not cleaned up after completion

**Not Tracked in .gitignore:**
```gitignore
# Current .gitignore does NOT exclude:
.claude/state/timeline/*.json  # ❌ Should exclude old sessions
.claude/state/*.json           # ❌ Should exclude completed workflows
*.log                          # ❌ No log file exclusion
tmp/                           # ❌ No tmp directory exclusion
```

#### Issues Identified:

❌ **No temp file cleanup strategy**
- Session files accumulate forever
- Old workflow files never deleted
- No age-based cleanup

❌ **Not in .gitignore**
- Timeline sessions tracked in git (shouldn't be)
- State files committed (should be temporary)

❌ **No size limits**
- Could grow to hundreds/thousands of files
- No disk space management

---

### 2. Sprint Work Organization

#### Current Structure: **INCONSISTENT** ⚠️

**Two conflicting patterns exist:**

**Pattern A: Sprint Folders** (Organized)
```
docs/planning/sprints/
├── sprint-01/
│   ├── PLAN.md
│   ├── deliverables/
│   │   └── docs/
│   └── stories/
├── sprint-02/
├── sprint-03/
├── sprint-04/
├── sprint-05/
├── sprint-06/
└── sprint-07/
```

**Pattern B: Root-Level Sprint Files** (Scattered)
```
docs/planning/
├── SPRINT-1-IMPLEMENTATION-COMPLETE.md
├── SPRINT-2-API-ARCHITECTURE.md
├── SPRINT-2-DATABASE-DESIGN.md
├── SPRINT-2-IMPLEMENTATION-GUIDE.md
├── SPRINT-2-PM-REQUIREMENTS.md
├── SPRINT-3-API-ARCHITECTURE.md
├── SPRINT-3-DATABASE-DESIGN.md
├── SPRINT-4-ARCHITECTURE.md
├── SPRINT-5-ARCHITECTURE.md
├── PM-HANDOFF-SPRINT-4-EPIC-2.5.md
├── PM-HANDOFF-SPRINT-5-EPIC-2.5.md
├── ARCHITECT-HANDOFF-SPRINT-2.md
├── ARCHITECT-HANDOFF-SPRINT-3.md
└── ARCHITECT-HANDOFF-SPRINT-5.md
```

#### Problems:

❌ **Duplication** - Same sprint has files in two places
❌ **Confusion** - Where do new sprint files go?
❌ **Inconsistency** - No clear pattern
❌ **Hard to find** - Sprint 2 files scattered across root and folder
❌ **Poor navigation** - Can't see "everything for Sprint 2" in one place

#### Why This Happened:

Looking at the history:
1. Started with sprint folders (sprint-01/ through sprint-07/)
2. During execution, created files in root planning dir
3. Naming convention matched but location didn't
4. Result: Duplicated/split organization

---

## 🎯 RECOMMENDATIONS

### 1. Temp File Management: **IMPLEMENT CLEANUP SYSTEM**

#### Option A: Automatic Cleanup (Recommended) ⭐

**Add to .gitignore:**
```gitignore
# Temporary files
.claude/state/timeline/*.json
.claude/state/workflow-*.json
.claude/state/last-*.json
.claude/state/*.tmp
tmp/
*.log

# Keep these (don't ignore):
!.claude/state/current-session.txt
!.claude/state/CLAUDE.md
```

**Create cleanup script:** `.claude/hooks/scripts/cleanup-old-sessions.sh`
```bash
#!/bin/bash
# Clean up timeline sessions older than 30 days

TIMELINE_DIR=".claude/state/timeline"
DAYS_TO_KEEP=30

find "$TIMELINE_DIR" -name "session-*.json" -mtime +$DAYS_TO_KEEP -delete

echo "✅ Cleaned up timeline sessions older than $DAYS_TO_KEEP days"
```

**Add to SessionEnd hook:**
```json
// .claude/settings.json
{
  "hooks": {
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/scripts/session-end.sh",
            "timeout": 30
          },
          {
            "type": "command",
            "command": "bash .claude/hooks/scripts/cleanup-old-sessions.sh",
            "timeout": 30,
            "description": "Clean up old timeline sessions"
          }
        ]
      }
    ]
  }
}
```

**Benefits:**
- ✅ Automatic - runs after every session
- ✅ Keeps last 30 days (configurable)
- ✅ Prevents unbounded growth
- ✅ No manual intervention

---

#### Option B: Manual Cleanup Script

**Create:** `scripts/cleanup-temp-files.sh`
```bash
#!/bin/bash
# Manual cleanup of temp files

echo "🗑️  Cleaning up temporary files..."

# Clean timeline sessions older than 30 days
find .claude/state/timeline -name "session-*.json" -mtime +30 -delete
echo "  ✓ Cleaned timeline sessions"

# Clean old workflow files
find .claude/state -name "workflow-*.json" -mtime +7 -delete
echo "  ✓ Cleaned workflow files"

# Clean any .log files
find . -name "*.log" -not -path "./node_modules/*" -delete
echo "  ✓ Cleaned log files"

echo "✅ Cleanup complete"
```

**Usage:** Run manually when needed
```bash
bash scripts/cleanup-temp-files.sh
```

**Benefits:**
- ✅ Simple
- ✅ Full control

**Drawbacks:**
- ❌ Have to remember to run it
- ❌ Files can accumulate

---

### 2. Sprint Work Organization: **CONSOLIDATE TO SPRINT FOLDERS**

#### Recommended Structure: ⭐

```
docs/planning/sprints/
├── sprint-01/
│   ├── PLAN.md                         # Sprint plan
│   ├── IMPLEMENTATION-COMPLETE.md      # Summary at end
│   ├── PM-REQUIREMENTS.md              # PM handoff
│   ├── ARCHITECTURE.md                 # Architect handoff
│   ├── deliverables/
│   │   ├── code/                       # Code artifacts
│   │   ├── docs/                       # Sprint documentation
│   │   └── tests/                      # Test artifacts
│   └── stories/
│       ├── AI-INF-001.md              # Story files
│       └── AI-INF-002.md
│
├── sprint-02/
│   ├── PLAN.md
│   ├── PM-REQUIREMENTS.md
│   ├── PM-SUMMARY.md
│   ├── ARCHITECTURE.md
│   ├── API-ARCHITECTURE.md
│   ├── DATABASE-DESIGN.md
│   ├── EVENT-BUS-ARCHITECTURE.md
│   ├── INTEGRATION-DESIGN.md
│   ├── IMPLEMENTATION-GUIDE.md
│   ├── QUICK-REFERENCE.md
│   ├── REFINEMENT-LOG.md
│   ├── IMPLEMENTATION-COMPLETE.md
│   ├── deliverables/
│   └── stories/
│
├── sprint-03/
│   ├── PLAN.md
│   ├── PM-REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── API-ARCHITECTURE.md
│   ├── DATABASE-DESIGN.md
│   ├── INTEGRATION-DESIGN.md
│   ├── IMPLEMENTATION-GUIDE.md
│   ├── IMPLEMENTATION-COMPLETE.md
│   ├── deliverables/
│   └── stories/
│
├── sprint-04/
│   ├── PLAN.md
│   ├── PM-HANDOFF-EPIC-2.5.md         # Epic-specific handoff
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION-COMPLETE.md
│   ├── REFACTORING-COMPLETE.md
│   ├── deliverables/
│   └── stories/
│
├── sprint-05/
│   ├── PLAN.md
│   ├── PM-HANDOFF-EPIC-2.5.md
│   ├── PM-SUMMARY.md
│   ├── ARCHITECT-HANDOFF.md
│   ├── ARCHITECTURE.md
│   ├── deliverables/
│   └── stories/
│
└── TEMPLATES/                          # Templates for new sprints
    ├── PLAN-TEMPLATE.md
    └── REVIEW-TEMPLATE.md
```

#### Benefits of Consolidated Structure:

✅ **Single source of truth** - All Sprint 2 files in `sprint-02/`
✅ **Easy navigation** - `cd docs/planning/sprints/sprint-02` shows everything
✅ **Clear context** - All related documents together
✅ **Scalable** - Can add sprint-06, sprint-07, etc. cleanly
✅ **IDE friendly** - Folder structure visible in sidebar
✅ **Git friendly** - Clear history per sprint
✅ **Search friendly** - Filter by sprint folder

---

### 3. Migration Plan

#### Step 1: Move Existing Files (15 minutes)

```bash
#!/bin/bash
# Move scattered sprint files into sprint folders

# Sprint 2 files
mv docs/planning/SPRINT-2-API-ARCHITECTURE.md \
   docs/planning/sprints/sprint-02/API-ARCHITECTURE.md

mv docs/planning/SPRINT-2-DATABASE-DESIGN.md \
   docs/planning/sprints/sprint-02/DATABASE-DESIGN.md

mv docs/planning/SPRINT-2-IMPLEMENTATION-GUIDE.md \
   docs/planning/sprints/sprint-02/IMPLEMENTATION-GUIDE.md

# ... (repeat for all sprint files)

# Sprint 3 files
mv docs/planning/SPRINT-3-API-ARCHITECTURE.md \
   docs/planning/sprints/sprint-03/API-ARCHITECTURE.md

# ... etc
```

#### Step 2: Update Cross-References (10 minutes)

Update any links in other documents:
```markdown
# Old links:
[Sprint 2 Architecture](../SPRINT-2-API-ARCHITECTURE.md)

# New links:
[Sprint 2 Architecture](../sprints/sprint-02/API-ARCHITECTURE.md)
```

#### Step 3: Update Workflow Commands (5 minutes)

Update workflow commands to use sprint folders:
```typescript
// In workflow scripts, use:
const sprintDir = `docs/planning/sprints/sprint-${sprintNumber}`;
const planFile = `${sprintDir}/PLAN.md`;
```

#### Step 4: Create README (5 minutes)

**Create:** `docs/planning/sprints/README.md`
```markdown
# Sprint Organization

Each sprint has its own folder with all related documentation.

## Structure

sprint-XX/
├── PLAN.md                    # Sprint planning
├── PM-REQUIREMENTS.md         # Product requirements
├── ARCHITECTURE.md            # Technical architecture
├── IMPLEMENTATION-COMPLETE.md # Sprint summary
├── deliverables/              # Sprint outputs
│   ├── code/                  # Code artifacts
│   ├── docs/                  # Documentation
│   └── tests/                 # Test artifacts
└── stories/                   # Story files

## Current Sprints

- Sprint 1-5: Completed (Foundation + Epic 2.5)
- Sprint 6: In planning (Epic 2: Training Academy)
- Sprint 7: Planned

## Naming Convention

- Sprint folders: `sprint-01`, `sprint-02`, etc. (zero-padded)
- Files inside: No sprint prefix (e.g., `PLAN.md` not `SPRINT-2-PLAN.md`)
```

#### Total Time: ~35 minutes

---

## 📋 COMPLETE IMPLEMENTATION CHECKLIST

### Temp File Management

**Automatic Cleanup (Recommended):**
- [ ] Add temp file patterns to `.gitignore`
- [ ] Create `.claude/hooks/scripts/cleanup-old-sessions.sh`
- [ ] Add cleanup hook to SessionEnd in `.claude/settings.json`
- [ ] Test cleanup runs after session
- [ ] Verify old files are deleted

**Manual Cleanup (Alternative):**
- [ ] Create `scripts/cleanup-temp-files.sh`
- [ ] Document usage in README
- [ ] Add reminder to run monthly

### Sprint Organization

**File Migration:**
- [ ] Create migration script
- [ ] Run script to move all sprint files
- [ ] Verify all files moved correctly
- [ ] Update cross-references in documents
- [ ] Update workflow commands to use new paths

**Structure Setup:**
- [ ] Create `docs/planning/sprints/README.md`
- [ ] Document naming conventions
- [ ] Create template folder with standard files
- [ ] Update planning system docs

**Validation:**
- [ ] All sprint files in correct folders
- [ ] No orphaned files in root planning dir
- [ ] Cross-references work
- [ ] Workflow commands work
- [ ] Git history preserved

---

## 🎯 QUICK WINS (30 minutes total)

If you want to fix this quickly, do these in order:

### 1. Add to .gitignore (2 minutes)

```gitignore
# Add to existing .gitignore:

# Temporary state files
.claude/state/timeline/*.json
.claude/state/workflow-*.json
tmp/
*.log
```

### 2. Clean up existing temp files (5 minutes)

```bash
# Manual cleanup (one-time)
find .claude/state/timeline -name "session-*.json" -mtime +30 -delete
find .claude/state -name "workflow-*.json" -mtime +7 -delete
```

### 3. Move sprint files (20 minutes)

```bash
# Create a migration script and run it
bash scripts/migrate-sprint-files.sh
```

### 4. Document the change (3 minutes)

Create `docs/planning/sprints/README.md` explaining structure.

**Total: 30 minutes** to clean up and establish good practices.

---

## 💡 BEST PRACTICES GOING FORWARD

### For Temp Files:

✅ **DO:**
- Use `.claude/state/` for ephemeral data
- Add age-based cleanup (30 days recommended)
- Exclude from git with `.gitignore`
- Keep only essential state files

❌ **DON'T:**
- Commit session files to git
- Let files accumulate indefinitely
- Store large files in state directory

### For Sprint Organization:

✅ **DO:**
- Put ALL sprint-related files in `sprints/sprint-XX/`
- Use clear, consistent naming (no sprint prefix inside folder)
- Keep deliverables in `deliverables/` subfolder
- Update README when adding new sprints

❌ **DON'T:**
- Put sprint files in root planning directory
- Use inconsistent naming (sometimes SPRINT-2-, sometimes not)
- Scatter related files across multiple directories
- Skip documentation updates

---

## 🚀 RECOMMENDED ACTION

**Do this NOW (30 minutes):**

1. **Fix .gitignore** - Exclude temp files
2. **Clean existing temp files** - One-time cleanup
3. **Migrate sprint files** - Move to proper folders
4. **Document structure** - Create README

**Then going forward:**

- New sprint work → Always in `sprints/sprint-XX/` folder
- Old sessions → Auto-cleaned every 30 days
- Consistent organization → Easy to navigate and maintain

---

## ❓ QUESTIONS FOR YOU

1. **Temp file cleanup:**
   - Prefer automatic (SessionEnd hook) or manual script?
   - Keep last 30 days or different timeframe?

2. **Sprint migration:**
   - Should I create the migration script and run it now?
   - Or do you want to review the plan first?

3. **Priority:**
   - Fix both issues now (30 min total)?
   - Or prioritize one over the other?

Let me know and I'll implement your choice!

---

**Analysis Complete**
**Date:** 2025-11-20
**Estimated Fix Time:** 30 minutes
**Impact:** Cleaner repo, better organization, easier navigation
