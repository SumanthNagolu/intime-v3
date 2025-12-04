# Create Issue File

Create a structured, sequentially numbered issue file from the user's description for use with the research and planning workflow.

## Usage
/create_issue <description of the problem, bug, or feature request>

## Instructions

Based on the user's description in: $ARGUMENTS

### Step 1: Determine Next Issue Number
1. Check the `issues/` directory (create it if it doesn't exist)
2. Find existing issue files matching pattern `issue-XXXXX.md`
3. Determine the next sequential number (e.g., if `issue-00003.md` is the highest, create `issue-00004.md`)
4. If no issues exist, start with `issue-00001.md`

### Step 2: Create the Issue File

Create `issues/issue-XXXXX.md` with the following structure:

```markdown
# Issue #XXXXX: [Concise Title]

**Created:** [Current Date]
**Status:** Open
**Priority:** [Low/Medium/High - infer from description]

## Summary
[1-2 sentence summary of the issue]

## Problem Description
[Detailed description of the problem, bug, or feature request based on user's input]

## Expected Behavior
[What should happen]

## Current Behavior (if bug)
[What currently happens - if applicable]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Additional Context
[Any relevant context, screenshots mentioned, related files, etc.]

## Technical Notes
[Any technical details the user mentioned]

## Related Files
[List any files/components mentioned or likely relevant]
```

## Rules
1. Ask clarifying questions if the description is vague
2. Extract as much structure as possible from the user's description
3. If the user mentions specific files, components, or areas of the codebase, note them
4. Keep the language clear and actionable
5. Zero-pad the issue number to 5 digits (00001, 00002, etc.)

## After Creation
1. Confirm the file was created with its path
2. Suggest: "Run `/research_codebase issues/issue-XXXXX.md` to begin researching this issue"
