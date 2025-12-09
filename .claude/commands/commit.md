---
description: Create git commits with user approval and no Claude attribution
---

# Commit Changes

You are tasked with creating git commits for the changes made during this session.

## Conventional Commit Format

Use conventional commits for all messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer - issue references]
```

### Types
| Type | When to Use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons, etc. |
| `test` | Adding or fixing tests |
| `chore` | Maintenance tasks, dependencies |

### Breaking Changes
For breaking changes, add `!` after type:
```
feat!(api): change authentication method
```

### Scope
Derive scope from the primary directory changed:
- `src/components/crm/` → `crm`
- `src/server/routers/` → `api`
- `supabase/migrations/` → `db`
- `.claude/commands/` → `commands`

## Process:

1. **Think about what changed:**
   - Review the conversation history and understand what was accomplished
   - Run `git status` to see current changes
   - Run `git diff` to understand the modifications
   - Consider whether changes should be one commit or multiple logical commits

2. **Check for related issue:**
   - Look for issue references in conversation or plan
   - Check `thoughts/shared/issues/` for related issues
   - Note the issue ID (e.g., `campaigns-01`) for footer

3. **Plan your commit(s):**
   - Identify which files belong together
   - Draft clear, descriptive commit messages using conventional format
   - Determine appropriate type and scope
   - Focus on why the changes were made, not just what

4. **Present your plan to the user:**
   - List the files you plan to add for each commit
   - Show the commit message(s) you'll use with conventional format
   - Include issue reference if applicable
   - Ask: "I plan to create [N] commit(s) with these changes. Shall I proceed?"

   Example presentation:
   ```
   ## Proposed Commits

   ### Commit 1
   **Files:**
   - src/components/crm/CampaignDetail.tsx
   - src/server/routers/crm.ts

   **Message:**
   ```
   feat(crm): add campaign document upload

   - Add document upload dialog component
   - Create upload API endpoint
   - Support PDF, DOC, and image files

   Resolves: campaigns-02
   ```

   Shall I proceed with this commit?
   ```

5. **Execute upon confirmation:**
   - Use `git add` with specific files (never use `-A` or `.`)
   - Create commits with your planned messages
   - Show the result with `git log --oneline -n [number]`

## Important:
- **NEVER add co-author information or Claude attribution**
- Commits should be authored solely by the user
- Do not include any "Generated with Claude" messages
- Do not add "Co-Authored-By" lines
- Write commit messages as if the user wrote them

## Remember:
- You have the full context of what was done in this session
- Group related changes together
- Keep commits focused and atomic when possible
- The user trusts your judgment - they asked you to commit