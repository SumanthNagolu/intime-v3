---
description: Master orchestrator - chains all commands from issue to commit for simple fixes
---

# Oneshot Fix - Full Pipeline Orchestrator

You are a **master orchestrator** that chains together the entire command workflow to handle simple fixes end-to-end. You will explicitly invoke each command in sequence, passing artifacts between steps.

## When to Use

Simple, obvious fixes that can be completed in one session:
- Fix a broken button/link
- Add a missing field to a form
- Fix a page not loading
- Simple UI tweaks
- Typo fixes
- Small bug fixes

## Pipeline Overview

```
/oneshot_fix "description"
      │
      ├─→ Step 1: /create_issue (streamlined)
      ├─→ Step 2: /research_codebase (lightweight)
      ├─→ Step 3: /create_plan (S-size)
      ├─→ Step 4: /implement_plan
      ├─→ Step 5: /run_ui_tests
      ├─→ Step 6: /validate_plan
      └─→ Step 7: /commit
```

---

## Orchestration Protocol

### Initial Response

When invoked, show the pipeline:

```
🚀 Oneshot Fix Pipeline Started

Issue: "[user's description]"

Pipeline Steps:
┌────┬─────────────────────┬──────────┐
│ #  │ Command             │ Status   │
├────┼─────────────────────┼──────────┤
│ 1  │ /create_issue       │ ⏳ Next  │
│ 2  │ /research_codebase  │ ○        │
│ 3  │ /create_plan        │ ○        │
│ 4  │ /implement_plan     │ ○        │
│ 5  │ /run_ui_tests       │ ○        │
│ 6  │ /validate_plan      │ ○        │
│ 7  │ /commit             │ ○        │
└────┴─────────────────────┴──────────┘

Starting Step 1...
```

---

## Step 1: Create Issue

**Command**: `/create_issue`
**Mode**: Streamlined (fewer questions)

```
═══════════════════════════════════════════════════════════
  STEP 1/7: Creating Issue
═══════════════════════════════════════════════════════════
```

**Execute the /create_issue workflow but streamlined:**

1. Skip extensive evidence gathering for obvious issues
2. Ask only 1-2 critical clarifying questions:
   - Where does this happen? (URL/screen)
   - What's the expected vs actual behavior?

3. Create issue file at `thoughts/shared/issues/{module}-{number}`

4. **Capture output**:
   ```
   issue_path = "thoughts/shared/issues/campaigns-05"
   issue_id = "campaigns-05"
   ```

5. **Check complexity** - If answers reveal this is NOT simple:
   ```
   ⚠️ PIPELINE ABORT - Complexity Detected
   
   This issue appears more complex than expected:
   - [reason]
   
   Recommendation: Run the full workflow manually:
   1. /create_issue - Already created at {issue_path}
   2. /research_codebase {issue_path}
   3. /create_plan {issue_path}
   
   Pipeline stopped at Step 1.
   ```

6. **On success**, show progress and continue:
   ```
   ✓ Step 1 Complete: Issue created
     → {issue_path}
   
   Proceeding to Step 2...
   ```

---

## Step 2: Research Codebase

**Command**: `/research_codebase`
**Mode**: Lightweight (find files only)
**Input**: `{issue_path}`

```
═══════════════════════════════════════════════════════════
  STEP 2/7: Researching Codebase
═══════════════════════════════════════════════════════════
```

**Execute /research_codebase but focused:**

1. Pass the issue as context: "Research for {issue_path}"
2. Focus only on finding the specific files related to the issue
3. Skip deep pattern analysis
4. Skip historical context from thoughts/
5. Create minimal research doc at `thoughts/shared/research/YYYY-MM-DD-{issue_id}.md`

6. **Capture output**:
   ```
   research_path = "thoughts/shared/research/2025-12-08-campaigns-05.md"
   relevant_files = [
     "src/components/crm/CampaignList.tsx",
     "src/server/routers/crm.ts"
   ]
   ```

7. **Check complexity** - If research reveals complexity:
   ```
   ⚠️ PIPELINE ABORT - Complex Issue Detected
   
   Research found this touches multiple areas:
   - [list of concerns]
   
   Recommendation: Continue with full workflow
   - Issue: {issue_path}
   - Research: {research_path}
   - Next: /create_plan {issue_path}
   
   Pipeline stopped at Step 2.
   ```

8. **On success**:
   ```
   ✓ Step 2 Complete: Research done
     → {research_path}
     → Found {n} relevant files
   
   Proceeding to Step 3...
   ```

---

## Step 3: Create Plan

**Command**: `/create_plan`
**Mode**: S-size, single phase
**Input**: `{issue_path}`, `{research_path}`

```
═══════════════════════════════════════════════════════════
  STEP 3/7: Creating Implementation Plan
═══════════════════════════════════════════════════════════
```

**Execute /create_plan but constrained:**

1. Reference the issue and research: "/create_plan {issue_path}"
2. Force T-shirt size to **S** (if it seems larger, abort)
3. Create **single phase** plan only
4. Skip extensive risk assessment
5. Create plan at `thoughts/shared/plans/YYYY-MM-DD-{issue_id}.md`

6. **Capture output**:
   ```
   plan_path = "thoughts/shared/plans/2025-12-08-campaigns-05.md"
   t_shirt_size = "S"
   phases = 1
   ```

7. **Check size** - If plan requires M/L/XL:
   ```
   ⚠️ PIPELINE ABORT - Plan Too Large
   
   This fix requires a {size} plan with {n} phases.
   Not suitable for oneshot.
   
   Artifacts created:
   - Issue: {issue_path}
   - Research: {research_path}
   - Plan: {plan_path}
   
   Continue manually: /implement_plan {plan_path}
   
   Pipeline stopped at Step 3.
   ```

8. **On success**:
   ```
   ✓ Step 3 Complete: Plan created
     → {plan_path}
     → Size: S, Phases: 1
   
   Proceeding to Step 4...
   ```

---

## Step 4: Implement Plan

**Command**: `/implement_plan`
**Input**: `{plan_path}`

```
═══════════════════════════════════════════════════════════
  STEP 4/7: Implementing Fix
═══════════════════════════════════════════════════════════
```

**Execute /implement_plan:**

1. Run: "/implement_plan {plan_path}"
2. Execute the single phase
3. Make the code changes
4. Update checkboxes in plan

5. **Capture output**:
   ```
   files_changed = [
     "src/components/crm/CampaignList.tsx"
   ]
   implementation_status = "complete"
   ```

6. **On success**:
   ```
   ✓ Step 4 Complete: Implementation done
     → Modified {n} files
   
   Proceeding to Step 5...
   ```

---

## Step 5: Run Tests

**Command**: `/run_ui_tests`
**Mode**: Quick (typecheck + lint + related tests)

```
═══════════════════════════════════════════════════════════
  STEP 5/7: Running Tests
═══════════════════════════════════════════════════════════
```

**Execute /run_ui_tests in quick mode:**

1. Run typecheck: `pnpm typecheck`
2. Run lint with fix: `pnpm lint --fix`
3. Run related tests only (based on files_changed)
4. Auto-fix what can be fixed

5. **Capture output**:
   ```
   typecheck_status = "pass"
   lint_status = "pass" 
   test_status = "pass"
   auto_fixed = ["1 lint warning"]
   ```

6. **On failure** - Try to fix:
   - If lint fails → auto-fix and retry
   - If typecheck fails → attempt fix, if can't → abort
   - If tests fail → investigate briefly, if complex → abort

7. **On success**:
   ```
   ✓ Step 5 Complete: Tests passed
     → TypeScript: ✓
     → Lint: ✓ (auto-fixed 1 warning)
     → Tests: ✓
   
   Proceeding to Step 6...
   ```

---

## Step 6: Validate Plan

**Command**: `/validate_plan`
**Input**: `{plan_path}`

```
═══════════════════════════════════════════════════════════
  STEP 6/7: Validating Implementation
═══════════════════════════════════════════════════════════
```

**Execute /validate_plan:**

1. Run: "/validate_plan {plan_path}"
2. Verify all success criteria are met
3. Mark issue as resolved
4. Update plan status to complete

5. **Capture output**:
   ```
   validation_status = "passed"
   issue_status = "resolved"
   ```

6. **On success**:
   ```
   ✓ Step 6 Complete: Validation passed
     → All criteria met
     → Issue marked resolved
   
   Proceeding to Step 7 (final)...
   ```

---

## Step 7: Commit

**Command**: `/commit`
**Mode**: Always ask first

```
═══════════════════════════════════════════════════════════
  STEP 7/7: Committing Changes
═══════════════════════════════════════════════════════════
```

**Execute /commit with confirmation:**

1. Show pipeline summary:
   ```
   🎯 Pipeline Complete - Ready to Commit
   
   ┌────┬─────────────────────┬──────────┐
   │ #  │ Command             │ Status   │
   ├────┼─────────────────────┼──────────┤
   │ 1  │ /create_issue       │ ✓        │
   │ 2  │ /research_codebase  │ ✓        │
   │ 3  │ /create_plan        │ ✓        │
   │ 4  │ /implement_plan     │ ✓        │
   │ 5  │ /run_ui_tests       │ ✓        │
   │ 6  │ /validate_plan      │ ✓        │
   │ 7  │ /commit             │ ⏳       │
   └────┴─────────────────────┴──────────┘
   
   Artifacts Created:
   - Issue: {issue_path}
   - Research: {research_path}
   - Plan: {plan_path}
   
   Files Changed:
   - {list of files}
   
   Proposed Commit:
   ```
   fix({module}): {description}
   
   Resolves: {issue_id}
   ```
   
   Proceed with commit? (yes/no)
   ```

2. **If user confirms** → Execute /commit
3. **If user declines** → Show options:
   ```
   What would you like to do?
   1. Edit commit message
   2. Review changes first (git diff)
   3. Abort commit (changes remain uncommitted)
   ```

4. **On success**:
   ```
   ═══════════════════════════════════════════════════════════
   🎉 PIPELINE COMPLETE
   ═══════════════════════════════════════════════════════════
   
   ✓ Issue: {issue_path}
   ✓ Research: {research_path}
   ✓ Plan: {plan_path}
   ✓ Commit: {commit_hash}
   
   Fix successfully delivered!
   
   Next steps:
   - Run /describe_pr to create a PR description
   - Or push directly if on feature branch
   ```

---

## Abort Protocol

At any step, if complexity is detected:

```
═══════════════════════════════════════════════════════════
  ⚠️ PIPELINE ABORTED
═══════════════════════════════════════════════════════════

Stopped at: Step {n}/7 - {command_name}
Reason: {reason}

Artifacts created so far:
- Issue: {issue_path or "not created"}
- Research: {research_path or "not created"}
- Plan: {plan_path or "not created"}

To continue manually:
{next_command_suggestion}

The oneshot pipeline is designed for simple fixes only.
For complex issues, use the full workflow.
```

---

## State Tracking

Throughout the pipeline, maintain state:

```typescript
pipeline_state = {
  started_at: ISO_timestamp,
  current_step: 1-7,
  
  // Artifacts
  issue_path: string | null,
  issue_id: string | null,
  research_path: string | null,
  plan_path: string | null,
  
  // Results
  files_changed: string[],
  test_results: { typecheck, lint, tests },
  commit_hash: string | null,
  
  // Status
  status: "running" | "completed" | "aborted",
  abort_reason: string | null
}
```

---

## Usage Examples

```bash
# Simple UI fix
/oneshot_fix "The save button on campaign edit page doesn't work"

# Missing field
/oneshot_fix "Add phone number field to the contact form"

# Display issue
/oneshot_fix "Campaign list shows wrong count - should only count active"

# Navigation fix
/oneshot_fix "Clicking on lead name doesn't navigate to detail page"
```

---

## Time Budget

If any single step takes more than 15 minutes, pause and check:
- Is this really a simple fix?
- Should we abort and use full workflow?

Total pipeline should complete in under 45 minutes for a true simple fix.
