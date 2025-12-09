---
description: Generate comprehensive PR descriptions following repository templates
---

# Generate PR Description

You are tasked with generating a comprehensive pull request description following the repository's standard template.

## Steps to follow:

1. **Read the PR description template:**
   - First, check if `thoughts/shared/pr_description.md` exists
   - If it doesn't exist, inform the user that their `humanlayer thoughts` setup is incomplete and they need to create a PR description template at `thoughts/shared/pr_description.md`
   - Read the template carefully to understand all sections and requirements


2. **Identify the PR to describe:**
   - Check if the current branch has an associated PR: `gh pr view --json url,number,title,state 2>/dev/null`
   - If no PR exists for the current branch, or if on main/master, list open PRs: `gh pr list --limit 10 --json number,title,headRefName,author`
   - Ask the user which PR they want to describe

3. **Check for existing description:**
   - Check if `thoughts/shared/prs/{number}_description.md` already exists
   - If it exists, read it and inform the user you'll be updating it
   - Consider what has changed since the last description was written

4. **Gather comprehensive PR information:**
   - Get the full PR diff: `gh pr diff {number}`
   - If you get an error about no default remote repository, instruct the user to run `gh repo set-default` and select the appropriate repository
   - Get commit history: `gh pr view {number} --json commits`
   - Review the base branch: `gh pr view {number} --json baseRefName`
   - Get PR metadata: `gh pr view {number} --json url,title,number,state`

5. **Find linked artifacts:**
   - Search commit messages for issue references (e.g., "Resolves: campaigns-01")
   - Check `thoughts/shared/issues/` for related issues
   - Check `thoughts/shared/plans/` for implementation plan
   - Check `thoughts/shared/research/` for research documents
   - Note all linked artifacts for the PR description

6. **Analyze the changes thoroughly:** (ultrathink about the code changes, their architectural implications, and potential impacts)
   - Read through the entire diff carefully
   - For context, read any files that are referenced but not shown in the diff
   - Understand the purpose and impact of each change
   - Identify user-facing changes vs internal implementation details
   - Look for breaking changes or migration requirements

7. **Run and document all tests:**
   Run comprehensive verification and capture results:
   ```bash
   pnpm typecheck
   pnpm lint  
   pnpm test
   ```
   
   Create test status summary:
   ```markdown
   ## Test Status
   
   | Check | Status | Details |
   |-------|--------|---------|
   | TypeScript | ✓ Pass | No errors |
   | Lint | ✓ Pass | No warnings |
   | Unit Tests | ✓ Pass | 42/42 passing |
   | E2E Tests | ⏭️ Skipped | Requires manual run |
   ```

8. **Handle verification requirements:**
   - Look for any checklist items in the "How to verify it" section of the template
   - For each verification step:
     - If it's a command you can run (like `make check test`, `npm test`, etc.), run it
     - If it passes, mark the checkbox as checked: `- [x]`
     - If it fails, keep it unchecked and note what failed: `- [ ]` with explanation
     - If it requires manual testing (UI interactions, external services), leave unchecked and note for user
   - Document any verification steps you couldn't complete

9. **Generate the description:**
   - Fill out each section from the template thoroughly:
     - Answer each question/section based on your analysis
     - Be specific about problems solved and changes made
     - Focus on user impact where relevant
     - Include technical details in appropriate sections
     - Write a concise changelog entry
   - Ensure all checklist items are addressed (checked or explained)
   
   **Include these additional sections:**
   
   ### Linked Artifacts
   ```markdown
   ## Related Documents
   
   - **Issue**: `thoughts/shared/issues/[module]-[number]`
   - **Research**: `thoughts/shared/research/[filename].md`
   - **Plan**: `thoughts/shared/plans/[filename].md`
   ```
   
   ### Commits in this PR
   ```markdown
   ## Commits
   
   - `abc1234` - feat(crm): add document upload
   - `def5678` - fix(crm): handle upload errors
   ```
   
   ### Review Checklist (auto-generated based on changes)
   ```markdown
   ## Review Checklist
   
   - [ ] Database migrations reviewed (if applicable)
   - [ ] API changes are backwards compatible
   - [ ] New components follow existing patterns
   - [ ] Error handling is comprehensive
   - [ ] No console.logs left in code
   ```

10. **Save and sync the description:**
   - Write the completed description to `thoughts/shared/prs/{number}_description.md`
   - Run `humanlayer thoughts sync` to sync the thoughts directory
   - Show the user the generated description

11. **Update the PR:**
    - Update the PR description directly: `gh pr edit {number} --body-file thoughts/shared/prs/{number}_description.md`
    - Confirm the update was successful
    - If any verification steps remain unchecked, remind the user to complete them before merging

## Important notes:
- This command works across different repositories - always read the local template
- Be thorough but concise - descriptions should be scannable
- Focus on the "why" as much as the "what"
- Include any breaking changes or migration notes prominently
- If the PR touches multiple components, organize the description accordingly
- Always attempt to run verification commands when possible
- Clearly communicate which verification steps need manual testing
