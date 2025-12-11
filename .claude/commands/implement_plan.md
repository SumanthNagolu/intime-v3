---
description: Implement technical plans from thoughts/shared/plans with verification
---

# Implement Plan

You are tasked with implementing an approved technical plan from `thoughts/shared/plans/`. These plans contain phases with specific changes and success criteria.

## Pre-flight Validation

Before implementing, verify the plan is still valid:

1. **Check plan freshness**:
   ```bash
   # Get files mentioned in the plan and check if they changed
   git log --since="[plan creation date]" -- [files mentioned in plan]
   ```
   - If significant changes found, warn: "⚠️ Plan may be stale - these files have changed since the plan was created: [list]"
   - Ask user if they want to proceed or update the plan first

2. **Verify branch state**:
   - Check current branch: `git branch --show-current`
   - Check for uncommitted changes: `git status`
   - Warn if on wrong branch or have uncommitted changes

3. **Check dependencies**:
   - Verify any dependencies mentioned in plan are available
   - Run `pnpm install` if package changes are expected

## Getting Started

When given a plan path:
- **Run pre-flight validation first**
- Read the plan completely and check for any existing checkmarks (- [x])
- Read the original ticket and all files mentioned in the plan
- **Read files fully** - never use limit/offset parameters, you need complete context
- Think deeply about how the pieces fit together
- Create a todo list to track your progress
- Start implementing if you understand what needs to be done

If no plan path provided, ask for one.

## Implementation Philosophy

Plans are carefully designed, but reality can be messy. Your job is to:
- Follow the plan's intent while adapting to what you find
- Implement each phase fully before moving to the next
- Verify your work makes sense in the broader codebase context
- Update checkboxes in the plan as you complete sections

When things don't match the plan exactly, think about why and communicate clearly. The plan is your guide, but your judgment matters too.

## Quality Standards - NO SHORTCUTS

**CRITICAL**: When encountering complexity or edge cases, you MUST implement robust, clean solutions. Never take shortcuts or workarounds.

### Mandatory Quality Rules

1. **No Shortcuts or Workarounds**
   - When complexity increases, invest the time to do it right
   - Never use hacks, temporary fixes, or "we'll fix this later" solutions
   - If a proper solution requires more effort, take that effort
   - Do not simplify requirements to avoid implementation complexity

2. **100% Robust Solutions**
   - Handle all edge cases properly
   - Include proper error handling and validation
   - Follow existing codebase patterns consistently
   - Maintain type safety throughout
   - Write code that is maintainable and self-documenting

3. **Fix All Errors Encountered**
   - If you discover errors during implementation (even unrelated to current changes), document them
   - At the end of each phase, fix any errors you encountered
   - Run full type checking and linting before marking a phase complete
   - Do not leave broken code behind, even if "it wasn't your change"

4. **No Technical Debt**
   - Do not introduce TODO comments as a substitute for implementation
   - Do not skip tests or validation steps
   - Do not leave console.logs, debugging code, or commented-out code
   - Ensure all imports are used and properly organized

### When Complexity Arises

If you encounter unexpected complexity:
```
❌ WRONG: "This is getting complex, let me simplify by..."
❌ WRONG: "As a workaround, I'll just..."
❌ WRONG: "For now, we can skip this edge case..."

✅ RIGHT: "This is complex. Let me think through the proper architecture..."
✅ RIGHT: "The robust solution requires X additional steps..."
✅ RIGHT: "To handle all edge cases correctly, I need to..."
```

### Error Discovery Protocol

When you discover errors during implementation:

1. **Log the error** in your progress report:
   ```markdown
   **Errors Discovered** (will fix at phase end):
   - TypeScript error in `src/foo/bar.ts:42` - missing type
   - Unused import in `src/components/X.tsx`
   - [etc.]
   ```

2. **Fix before phase completion**:
   - Run `pnpm build` or `pnpm tsc` to catch all type errors
   - Run `pnpm lint` to catch linting issues
   - Fix ALL errors, not just ones from your changes

3. **Report fixes**:
   ```markdown
   **Errors Fixed** (unrelated to current phase):
   - Fixed type error in `src/foo/bar.ts:42`
   - Removed unused import in `src/components/X.tsx`
   ```

If you encounter a mismatch:
- STOP and think deeply about why the plan can't be followed
- Present the issue clearly:
  ```
  Issue in Phase [N]:
  Expected: [what the plan says]
  Found: [actual situation]
  Why this matters: [explanation]

  How should I proceed?
  ```

## Progress Reporting

After each significant action, report progress using this format:

```markdown
## Implementation Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 | ✅ Complete | All criteria passed |
| Phase 2 | 🔄 In Progress | 2/4 files updated |
| Phase 3 | ⏳ Pending | - |

**Current task**: [What you're working on now]
**Blockers**: [None / Description of blocker]
**Time spent**: ~[X] min
**Estimated remaining**: ~[X] min
```

Update this table after completing each phase or hitting a significant milestone.

## Verification Approach

After implementing a phase:
- Run the success criteria checks (usually `make check test` covers everything)
- Fix any issues before proceeding
- Update your progress in both the plan and your todos
- Check off completed items in the plan file itself using Edit
- **Report progress** using the format above
- **Pause for human verification**: After completing all automated verification for a phase, pause and inform the human that the phase is ready for manual testing. Use this format:
  ```
  Phase [N] Complete - Ready for Manual Verification

  Automated verification passed:
  - [List automated checks that passed]

  Please perform the manual verification steps listed in the plan:
  - [List manual verification items from the plan]

  Let me know when manual testing is complete so I can proceed to Phase [N+1].
  ```

If instructed to execute multiple phases consecutively, skip the pause until the last phase. Otherwise, assume you are just doing one phase.

do not check off items in the manual testing steps until confirmed by the user.


## If You Get Stuck

When something isn't working as expected:
- First, make sure you've read and understood all the relevant code
- Consider if the codebase has evolved since the plan was written
- Present the mismatch clearly and ask for guidance

Use sub-tasks sparingly - mainly for targeted debugging or exploring unfamiliar territory.

## Abort Protocol

If you hit a blocker that cannot be resolved, follow this protocol:

1. **STOP** - Do not try to work around major architectural issues
2. **Preserve work** - Commit any completed phases:
   ```bash
   git add -A
   git commit -m "WIP: [plan name] - Phase [N] complete, blocked at Phase [N+1]"
   ```
3. **Document the blocker**:
   ```markdown
   ⚠️ **Implementation Blocked**
   
   **Completed phases**: [list what's done]
   **Blocked at**: Phase [N] - [phase name]
   **Blocker**: [specific issue preventing progress]
   **Root cause**: [why this wasn't caught in planning]
   
   **Options**:
   1. [Option A - e.g., Update plan to handle this case]
   2. [Option B - e.g., Get clarification from user]
   3. [Option C - e.g., Defer this phase]
   
   **Recommendation**: [your suggestion]
   **Partial work preserved in commit**: [hash]
   ```
4. **Wait for guidance** - Do not proceed without user input

## Resuming Work

If the plan has existing checkmarks:
- Trust that completed work is done
- Pick up from the first unchecked item
- Verify previous work only if something seems off

Remember: You're implementing a solution, not just checking boxes. Keep the end goal in mind and maintain forward momentum.

---

## Session Handoff Protocol

After completing phases, offer session breaks based on plan size.

### Check Plan Size

Look for the T-Shirt Size in the plan:
- **S/M plans**: Continue automatically, offer break only if user requests
- **L/XL plans**: Offer checkpoint after each phase

### For L/XL Plans - Checkpoint After Each Phase

After completing a phase on an L or XL sized plan, present:

```
✓ Phase [N] Complete

This plan is sized [L/XL]. This is a recommended checkpoint.

**Progress**: Phase [N] of [Total] complete
**Next**: Phase [N+1] - [Name]

Options:
1. **Create handoff and end session** → I'll run `/create_handoff` to save full context
2. **Commit and continue** → Save progress, keep working on Phase [N+1]
3. **Just continue** → No commit, proceed to Phase [N+1]

What would you like to do?
```

**If user chooses option 1**:
1. Commit current work with descriptive message
2. Run `/create_handoff` to create comprehensive handoff document
3. The handoff will be saved to `thoughts/shared/handoffs/`
4. Inform user: "Resume later with `/resume_handoff [path]`"

### For S/M Plans

Continue to next phase automatically. Only offer handoff if:
- User explicitly requests a break
- Session has been running for extended time
- A blocker is encountered

### Resuming Work

There are two ways to resume:

1. **From handoff** (if `/create_handoff` was used):
   ```
   /resume_handoff thoughts/shared/handoffs/ENG-XXXX/[latest].md
   ```

2. **From plan** (if no formal handoff):
   ```
   /implement_plan thoughts/shared/plans/[plan].md
   ```
   The agent will detect completed phases from checkmarks and resume.
