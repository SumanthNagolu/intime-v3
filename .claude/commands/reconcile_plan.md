---
description: Audit implementation against plan, identify gaps/workarounds, and progressively fix issues
model: opus
---

# Reconcile Plan

You are tasked with auditing an implementation against its plan, identifying gaps, workarounds, and deviations, then progressively fixing issues through repeated runs. This command handles the messy reality of interrupted work where context rolled over without proper handoffs.

**Core Question**: "What was supposed to happen vs what actually happened?"

## Design Principles

- **Idempotent**: Safe to run multiple times - each run refines understanding
- **Two-Mode**: Discovery mode (first run) vs Resolution mode (subsequent runs)
- **Inline annotations**: Findings are WRITTEN to the plan file, not just displayed
- **Git-aware**: Uses git history to understand implementation timeline

---

## STEP 0: Mode Detection (ALWAYS RUN FIRST)

**Before doing ANYTHING else, determine which mode to enter.**

When this command is invoked with a plan path:

1. **Check for existing annotations in the plan file**:
   ```bash
   grep -E "⚠️ MISSING|↪️ PARTIAL|↪️ DEVIATED|↪️ WORKAROUND|↪️ REGRESSION" [plan_file]
   ```

2. **Branch based on results**:
   
   | Result | Mode | Action |
   |--------|------|--------|
   | No markers found | **DISCOVERY MODE** | Proceed to Discovery Mode section |
   | Markers found | **RESOLUTION MODE** | Skip to Resolution Mode section |

3. **Announce the mode**:
   ```
   📋 Plan: [plan path]
   
   [If Discovery Mode]
   🔍 MODE: DISCOVERY
   No existing annotations found. Running full analysis...
   
   [If Resolution Mode]
   🔧 MODE: RESOLUTION  
   Found X pending issues from previous analysis.
   Ready to address them interactively.
   ```

**If no plan path provided**:
```
I'll help you reconcile an implementation against its plan.

Please provide the path to the plan file, e.g.:
/reconcile_plan thoughts/shared/plans/2025-12-08-feature.md

Tip: List recent plans with `ls -lt thoughts/shared/plans/ | head`
```

---

# DISCOVERY MODE

Run this mode when NO annotation markers exist in the plan file.

## Step D1: Read and Parse Plan

1. **Read the plan file completely** - no limit/offset parameters
2. **Extract structured data**:
   - Plan creation date (from filename: `YYYY-MM-DD-...`)
   - All phases with their tasks (look for `## Phase N:` headers)
   - Checkbox items (`- [ ]` and `- [x]`)
   - File references mentioned (`src/...`, `components/...`, etc.)
   - Success criteria sections

3. **Build a task inventory**:
   ```
   Phase 1: [Phase Name]
   - Task 1.1: [description] [checkbox status]
   - Task 1.2: [description] [checkbox status]
   
   Phase 2: [Phase Name]
   - Task 2.1: ...
   ```

## Step D2: Gather Implementation Evidence

Run these commands to understand what was actually done:

```bash
# 1. Get plan creation date from filename
PLAN_DATE=$(basename "[plan_path]" | grep -oE '^[0-9]{4}-[0-9]{2}-[0-9]{2}')

# 2. Find all commits since plan creation
git log --oneline --since="$PLAN_DATE" --all

# 3. Get files changed since plan creation  
git diff --name-only $(git rev-list -n1 --before="$PLAN_DATE" HEAD 2>/dev/null || echo HEAD~50)..HEAD

# 4. Check current branch and uncommitted changes
git status --short
```

## Step D3: File-by-File Verification

For each file mentioned in the plan:

1. **Check existence**: Does the file exist?
2. **Check modification**: Was it modified since plan date?
   ```bash
   git log --oneline --since="$PLAN_DATE" -- [filepath]
   ```
3. **Read and verify**: Does content match plan expectations?
4. **Scan for workarounds**: Search for TODO/FIXME patterns

## Step D4: Workaround Detection

Search for indicators of incomplete or temporary work:

```bash
# TODO/FIXME in files touched by this plan
grep -rn "TODO\|FIXME\|HACK\|XXX" [files_from_plan]

# Disabled tests
grep -rn "\.skip(\|xdescribe(\|xit(\|test\.skip" [test_files]

# Debug statements
grep -rn "console\.log\|debugger" [source_files]
```

## Step D5: Classify Findings

Categorize each finding:

| Type | Marker | Criteria |
|------|--------|----------|
| **MISSING** | `⚠️ MISSING` | Planned item not implemented at all |
| **PARTIAL** | `↪️ PARTIAL` | Started but incomplete |
| **DEVIATED** | `↪️ DEVIATED` | Implemented differently than planned |
| **WORKAROUND** | `↪️ WORKAROUND` | Temporary fix, TODO, hack in code |
| **REGRESSION** | `↪️ REGRESSION` | Was working, now broken |

## Step D6: WRITE ANNOTATIONS TO PLAN FILE (MANDATORY)

**⚠️ THIS STEP IS REQUIRED - DO NOT SKIP**

You MUST write the annotations directly into the plan file using the Edit tool before showing any summary.

### Annotation Placement Rules

1. **For checkbox items with findings**, add marker on same line or indented below:

   **MISSING** - Add after the checkbox on same line:
   ```markdown
   - [ ] Add rate limiting ← ⚠️ MISSING: No implementation found
   ```

   **PARTIAL** - Add indented below the task:
   ```markdown
   - [ ] Implement validation
     - ↪️ PARTIAL: Only `/users` endpoint validated, `/orders` and `/products` missing
   ```

   **DEVIATED** - Add indented below with explanation:
   ```markdown
   - [x] Implement authentication middleware
     - ↪️ DEVIATED: Used JWT instead of planned session tokens (see src/lib/auth/jwt.ts)
   ```

   **WORKAROUND** - Add indented with file:line reference:
   ```markdown
   - [ ] Add request validation
     - ↪️ WORKAROUND: Found `// TODO: add proper validation` at src/api/orders.ts:45
   ```

2. **Be specific** - Include file paths, line numbers, exact details
3. **Preserve existing content** - Only ADD markers, don't modify existing text
4. **One annotation per finding** - Don't combine multiple issues

### Example Edit Operations

```
Edit 1: Add MISSING marker
File: thoughts/shared/plans/2025-12-08-feature.md
Find: "- [ ] Add rate limiting"
Replace: "- [ ] Add rate limiting ← ⚠️ MISSING: No implementation found in src/middleware/"

Edit 2: Add PARTIAL marker  
File: thoughts/shared/plans/2025-12-08-feature.md
Find: "- [ ] Implement validation"
Replace: "- [ ] Implement validation\n  - ↪️ PARTIAL: Only `/users` validated, others missing"

Edit 3: Add WORKAROUND marker
File: thoughts/shared/plans/2025-12-08-feature.md  
Find: "- [x] Create API endpoints"
Replace: "- [x] Create API endpoints\n  - ↪️ WORKAROUND: Found `// TODO: error handling` at src/api/handler.ts:89"
```

**Verify annotations were written**:
```bash
grep -E "⚠️|↪️" [plan_file]
```

## Step D7: Show Summary Report

**Only show this AFTER annotations are written to the plan file.**

```markdown
## Reconciliation Report: [Plan Name]

**Plan**: `[path/to/plan.md]`
**Created**: [plan date]  
**Analyzed**: [current date]
**Mode**: DISCOVERY (first run)

### Summary

| Category | Count | Severity |
|----------|-------|----------|
| Missing | X | 🔴 High |
| Partial | X | 🟡 Medium |
| Deviated | X | 🟡 Review |
| Workarounds | X | 🟠 Tech Debt |

### Annotations Written to Plan

✅ Added X annotations to the plan file

### Detailed Findings

[List each finding with context]

---

**Next Step**: Run `/reconcile_plan [path]` again to address these issues interactively.

The plan file now contains annotations. On the next run, I will:
1. Detect the annotations (enter Resolution Mode)
2. Walk through each issue
3. Propose and apply fixes with your approval
4. Update markers to RESOLVED or DEFERRED
```

---

# RESOLUTION MODE

Run this mode when annotation markers ARE FOUND in the plan file.

## Step R1: Parse Pending Issues

1. **Read the plan file** and extract all annotation markers
2. **Build issue list**:
   ```
   Pending Issues:
   1. [MISSING] Add rate limiting - Line 45
   2. [PARTIAL] Implement validation - Line 67  
   3. [WORKAROUND] TODO at src/api/orders.ts:45 - Line 89
   
   Already Resolved:
   - [RESOLVED] Error handling - Line 23
   
   Deferred:
   - [DEFERRED] Performance optimization - Line 102
   ```

3. **Count status**:
   ```
   📊 Issue Status:
   - Pending: X issues
   - Resolved: Y issues  
   - Deferred: Z issues
   ```

## Step R2: Present Options

```
🔧 MODE: RESOLUTION

Found X pending issues from previous analysis.

**Options**:
1. **Address issues** - Walk through each pending issue interactively
2. **Re-run discovery** - Fresh analysis (will preserve existing RESOLVED/DEFERRED markers)
3. **Clear all annotations** - Remove all markers and start over
4. **Show issue details** - List all issues before deciding

Choose an option (1/2/3/4):
```

## Step R3: Interactive Fix Flow (Option 1)

For each pending issue:

```
═══════════════════════════════════════════════════════
ISSUE [N] of [Total]: [CATEGORY]
═══════════════════════════════════════════════════════

**Task**: [task description from plan]
**Finding**: [what was found/missing]
**Location**: `[file:line]` (if applicable)

**Proposed Fix**:
[Specific implementation or change needed]

───────────────────────────────────────────────────────
Commands:
  y - Implement this fix now
  n - Skip, mark as DEFERRED  
  m - Modify the approach (tell me what you want instead)
  d - Show me the relevant code first
  q - Stop resolution, keep remaining issues as pending
───────────────────────────────────────────────────────

Your choice:
```

### After User Chooses:

**If `y` (implement)**:
1. Implement the fix
2. Update the plan annotation:
   ```markdown
   # Before
   - [ ] Add rate limiting ← ⚠️ MISSING: No implementation found
   
   # After  
   - [x] Add rate limiting
     - ✓ RESOLVED (2025-12-09): Implemented in src/middleware/rateLimit.ts
   ```
3. Proceed to next issue

**If `n` (defer)**:
1. Update the plan annotation:
   ```markdown
   # Before
   - [ ] Add rate limiting ← ⚠️ MISSING: No implementation found
   
   # After
   - [ ] Add rate limiting
     - ⏸️ DEFERRED: Skipped during reconciliation - [optional reason from user]
   ```
2. Proceed to next issue

**If `m` (modify)**:
1. Ask user for their preferred approach
2. Implement as specified
3. Mark as RESOLVED with note about modified approach

**If `d` (show code)**:
1. Read and display the relevant file/section
2. Re-present the issue with context
3. Wait for new choice

**If `q` (quit)**:
1. Commit any completed fixes (if any)
2. Show progress summary
3. End session

## Step R4: Update Markers (MANDATORY)

**After each fix or deferral, you MUST update the plan file.**

### Marker Lifecycle

```
Initial Finding          After Resolution
─────────────────────    ─────────────────────
⚠️ MISSING: [desc]   →   ✓ RESOLVED (date): [how fixed]
↪️ PARTIAL: [desc]   →   ✓ RESOLVED (date): [completed]
↪️ DEVIATED: [desc]  →   ✓ RESOLVED (date): [aligned/accepted]
↪️ WORKAROUND: [desc]→   ✓ RESOLVED (date): [properly implemented]

Or if deferred:
⚠️ MISSING: [desc]   →   ⏸️ DEFERRED: [reason]
```

## Step R5: Resolution Complete

When all issues addressed:

```markdown
## Resolution Complete

**Session Summary**:
- Issues fixed: X
- Issues deferred: Y
- Issues remaining: Z (if quit early)

**Changes Made**:
- `[file1]`: [what changed]
- `[file2]`: [what changed]

**Plan Updated**:
- X markers changed to ✓ RESOLVED
- Y markers changed to ⏸️ DEFERRED

**Verification**:
Running automated checks...
```

Then run:
```bash
pnpm typecheck
pnpm lint
pnpm test
```

```markdown
---

**Recommendation**: 
[If all green] → Ready to commit with `/commit`
[If issues] → Address [specific issues] before committing

**To verify clean state**: Run `/reconcile_plan [path]` one more time.
It should report: "No pending issues found. Implementation matches plan."
```

---

# MARKER REFERENCE

## Marker Types and Format

| Marker | Meaning | Used In |
|--------|---------|---------|
| `⚠️ MISSING: [desc]` | Not implemented at all | Discovery |
| `↪️ PARTIAL: [desc]` | Started but incomplete | Discovery |
| `↪️ DEVIATED: [desc]` | Different from plan | Discovery |
| `↪️ WORKAROUND: [desc]` | Temporary fix in code | Discovery |
| `↪️ REGRESSION: [desc]` | Was working, now broken | Discovery |
| `✓ RESOLVED (date): [desc]` | Fixed during resolution | Resolution |
| `⏸️ DEFERRED: [reason]` | Intentionally skipped | Resolution |

## Placement Examples

```markdown
## Phase 2: API Implementation

- [x] Create REST endpoints for user management
  - ✓ RESOLVED (2025-12-09): All CRUD operations working
- [ ] Add rate limiting ← ⚠️ MISSING: No implementation found
- [x] Implement authentication middleware
  - ↪️ DEVIATED: Used JWT instead of planned session tokens
  - ✓ RESOLVED (2025-12-09): Accepted deviation, JWT approach is better
- [ ] Add request validation
  - ↪️ PARTIAL: Only `/users` endpoint validated
  - ↪️ WORKAROUND: Found `// TODO: validate` at src/api/orders.ts:45
  - ⏸️ DEFERRED: Will complete in next sprint
```

---

# EDGE CASES

## No Issues Found

If discovery finds no gaps:
```
✅ Implementation matches plan!

All tasks are either:
- Completed as specified
- Intentionally deviated (documented)

No annotations needed. Plan is clean.

Recommendation: Run `/validate_plan [path]` for final verification.
```

## Mixed State (Some Resolved, Some Pending)

When plan has both RESOLVED and pending markers:
- Count only pending markers for issue list
- Preserve RESOLVED/DEFERRED markers
- Re-run discovery may find NEW issues (add new markers)

## Stale Plan

If significant time has passed since last reconciliation:
```
⚠️ Last reconciliation was X days ago.
Consider running fresh discovery (option 2) to catch any new issues.
```

## Large Number of Issues

If > 10 pending issues:
```
Found [N] pending issues. This is a lot to address in one session.

Options:
1. Address all [N] issues
2. Address first 5, defer rest
3. Prioritize by category (MISSING first, then PARTIAL, etc.)
4. Show me the list first
```

---

# WORKFLOW POSITION

```
/create_plan → /implement_plan → /reconcile_plan → /validate_plan → /commit
                     ↑                  ↓
                     └── (iterate) ←────┘
```

**When to use `/reconcile_plan`**:
- After interrupted implementation (context rollover)
- When resuming work without a handoff document
- To audit implementation quality before final validation
- When unsure if all plan items were completed

**Relationship to other commands**:
- `/implement_plan` - Executes fresh, assumes plan is accurate
- `/reconcile_plan` - Audits what happened vs what was planned
- `/validate_plan` - Final QA gate, runs all checks
- `/iterate_plan` - Updates the plan document itself

---

# QUICK REFERENCE

```bash
# First run - discovery mode
/reconcile_plan thoughts/shared/plans/2025-12-08-feature.md
# → Analyzes plan vs implementation
# → Writes annotations to plan file
# → Shows summary report

# Second run - resolution mode  
/reconcile_plan thoughts/shared/plans/2025-12-08-feature.md
# → Detects annotations
# → Walks through each issue interactively
# → Fixes with approval, updates markers

# Third run - verify clean
/reconcile_plan thoughts/shared/plans/2025-12-08-feature.md
# → Either finds new issues (back to resolution)
# → Or reports clean state
```
