---
description: Validate implementation, auto-fix issues, and close out the plan/issue
model: opus
---

# Validate Plan - Closure Protocol

You are tasked with validating that an implementation plan was correctly executed, auto-fixing what can be fixed, and formally closing out the work. This is the final quality gate before committing.

## GOAL: Get to "All Green" Status

Your job is to:
1. Run ALL automated checks
2. Auto-fix what can be fixed (lint, format, simple type errors)
3. Verify all success criteria are met
4. Mark the issue as RESOLVED
5. Update the plan status to COMPLETE
6. Generate a final validation report

## Initial Setup

When invoked:
1. **Determine context** - Are you in an existing conversation or starting fresh?
   - If existing: Review what was implemented in this session
   - If fresh: Need to discover what was done through git and codebase analysis

2. **Locate the plan**:
   - If plan path provided, use it
   - Otherwise, search recent commits for plan references or ask user

3. **Gather implementation evidence**:
   ```bash
   # Check recent commits
   git log --oneline -n 20
   git diff HEAD~N..HEAD  # Where N covers implementation commits

   # Run comprehensive checks
   cd $(git rev-parse --show-toplevel) && make check test
   ```

## Validation Process

### Step 1: Context Discovery

If starting fresh or need more context:

1. **Read the implementation plan** completely
2. **Identify what should have changed**:
   - List all files that should be modified
   - Note all success criteria (automated and manual)
   - Identify key functionality to verify

3. **Spawn parallel research tasks** to discover implementation:
   ```
   Task 1 - Verify database changes:
   Research if migration [N] was added and schema changes match plan.
   Check: migration files, schema version, table structure
   Return: What was implemented vs what plan specified

   Task 2 - Verify code changes:
   Find all modified files related to [feature].
   Compare actual changes to plan specifications.
   Return: File-by-file comparison of planned vs actual

   Task 3 - Verify test coverage:
   Check if tests were added/modified as specified.
   Run test commands and capture results.
   Return: Test status and any missing coverage
   ```

### Step 2: Run All Automated Checks

Run comprehensive verification:

```bash
# Run all checks in order
pnpm typecheck        # Type errors
pnpm lint             # Lint issues
pnpm test             # All tests
```

Document results:
```
## Automated Check Results

| Check | Status | Issues |
|-------|--------|--------|
| TypeScript | ✓/✗ | [count] errors |
| Lint | ✓/✗ | [count] warnings |
| Tests | ✓/✗ | [pass]/[fail] |
```

### Step 3: Auto-Fix What Can Be Fixed

For issues that can be auto-fixed, apply fixes WITHOUT asking:

1. **Lint/Format issues**:
   ```bash
   pnpm lint --fix
   pnpm format
   ```

2. **Simple type errors** (missing imports, unused vars):
   - Add missing imports
   - Remove unused imports
   - Fix obvious type mismatches

3. **After auto-fix, re-run checks** to verify fixes worked

For issues that CANNOT be auto-fixed:
- Complex type errors
- Test failures
- Logic errors

Flag these for user attention with specific details.

### Step 4: Verify Success Criteria

For each phase in the plan:

1. **Check completion status**:
   - Look for checkmarks in the plan (- [x])
   - Verify the actual code matches claimed completion

2. **Run automated verification**:
   - Execute each command from "Automated Verification"
   - Document pass/fail status
   - If failures after auto-fix, flag for user

3. **Assess manual criteria**:
   - List what needs manual testing
   - Provide clear steps for user verification

4. **Think deeply about edge cases**:
   - Were error conditions handled?
   - Are there missing validations?
   - Could the implementation break existing functionality?

### Step 3: Generate Validation Report

Create comprehensive validation summary:

```markdown
## Validation Report: [Plan Name]

### Implementation Status
✓ Phase 1: [Name] - Fully implemented
✓ Phase 2: [Name] - Fully implemented
⚠️ Phase 3: [Name] - Partially implemented (see issues)

### Automated Verification Results
✓ Build passes: `make build`
✓ Tests pass: `make test`
✗ Linting issues: `make lint` (3 warnings)

### Code Review Findings

#### Matches Plan:
- Database migration correctly adds [table]
- API endpoints implement specified methods
- Error handling follows plan

#### Deviations from Plan:
- Used different variable names in [file:line]
- Added extra validation in [file:line] (improvement)

#### Potential Issues:
- Missing index on foreign key could impact performance
- No rollback handling in migration

### Manual Testing Required:
1. UI functionality:
   - [ ] Verify [feature] appears correctly
   - [ ] Test error states with invalid input

2. Integration:
   - [ ] Confirm works with existing [component]
   - [ ] Check performance with large datasets

### Recommendations:
- Address linting warnings before merge
- Consider adding integration test for [scenario]
- Document new API endpoints
```

## Working with Existing Context

If you were part of the implementation:
- Review the conversation history
- Check your todo list for what was completed
- Focus validation on work done in this session
- Be honest about any shortcuts or incomplete items

## Important Guidelines

1. **Be thorough but practical** - Focus on what matters
2. **Run all automated checks** - Don't skip verification commands
3. **Document everything** - Both successes and issues
4. **Think critically** - Question if the implementation truly solves the problem
5. **Consider maintenance** - Will this be maintainable long-term?

## Validation Checklist

Always verify:
- [ ] All phases marked complete are actually done
- [ ] Automated tests pass
- [ ] Code follows existing patterns
- [ ] No regressions introduced
- [ ] Error handling is robust
- [ ] Documentation updated if needed
- [ ] Manual test steps are clear

## Step 5: Closure Protocol

If all automated checks pass:

### 5a. Update Plan Status

Add completion marker to the plan file:

```markdown
---

## Completion Status

**Status**: ✅ COMPLETE
**Validated**: [Current Date]
**All automated checks**: PASSED
**Manual verification**: [Pending/Complete]

### Final Metrics
- Phases completed: [X]/[X]
- Tests passing: [X]/[X]
- Type errors: 0
- Lint warnings: 0
```

### 5b. Update Issue Status (if applicable)

If the plan references an issue in `thoughts/shared/issues/`:

1. Read the issue file
2. Update the status:
   ```markdown
   **Status:** ~~Open~~ → **Resolved**
   **Resolved Date:** [Current Date]
   **Resolution:** Implemented per plan [plan-file-path]
   ```
3. Check off all acceptance criteria that are met

### 5c. Generate Closure Report

```markdown
## Validation Complete ✓

**Plan**: `thoughts/shared/plans/[filename].md`
**Issue**: `thoughts/shared/issues/[module]-[number]` (if applicable)

### All Checks Passed
✓ TypeScript - No errors
✓ Lint - No warnings  
✓ Tests - All passing

### Auto-Fixed Issues
- [List any auto-fixed items]

### Manual Verification Required
- [ ] [Item 1]
- [ ] [Item 2]

### Ready for Next Steps
1. `/commit` - Commit these changes
2. `/describe_pr` - Create PR description

**Implementation is complete and validated.**
```

## If Validation Fails

If checks fail after auto-fix:

```markdown
## Validation Failed ✗

### Issues Requiring Attention

| Issue | File | Line | Severity |
|-------|------|------|----------|
| [Error] | [file] | [line] | Blocking |

### Recommended Actions
1. [Specific fix needed]
2. [Another fix]

### Options
- Fix issues manually and re-run `/validate_plan`
- Use `/run_ui_tests` for interactive fix assistance
- Use `/iterate_plan` if plan needs updates

**Cannot close until all checks pass.**
```

## Relationship to Other Commands

**Full workflow**:
```
/create_issue → /research_codebase → /create_plan → /implement_plan 
    → /run_ui_tests → /validate_plan → /commit → /describe_pr
```

**validate_plan position**:
- Comes AFTER `/implement_plan` and `/run_ui_tests`
- Comes BEFORE `/commit` and `/describe_pr`
- This is the quality gate before committing

**If validation fails**:
- Use `/run_ui_tests` to fix test failures interactively
- Use `/iterate_plan` if the plan needs changes
- Re-run `/validate_plan` after fixes

Remember: This is the final gate. Don't close until everything is green.
