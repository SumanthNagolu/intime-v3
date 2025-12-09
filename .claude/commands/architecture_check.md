---
description: Verify alignment with system architecture before implementing features
---

# Architecture Check

You are tasked with verifying that a proposed feature or change aligns with the established system architecture. This is a pre-flight check to prevent architectural drift.

## When to Use

Run this command:
- Before starting a new feature implementation
- When modifying shared patterns or conventions
- Before adding new database entities
- When introducing new API patterns
- Before creating new UI component patterns

## Process

### Step 1: Identify What's Changing

Ask the user (or determine from context):
```
What are you planning to implement? I'll check it against our architecture docs.

Please describe:
1. What feature/change is being implemented
2. Which areas it touches (database, API, UI, permissions)
3. Any new patterns being introduced
```

### Step 2: Review Relevant Architecture Docs

Based on the change type, read the relevant docs:

| Change Type | Architecture Doc |
|-------------|-----------------|
| Database/entities | `thoughts/shared/architecture/data-model.md` |
| Permissions/roles | `thoughts/shared/architecture/permissions.md` |
| API endpoints | `thoughts/shared/architecture/api-conventions.md` |
| UI components | `thoughts/shared/architecture/ui-patterns.md` |

Read each relevant doc FULLY.

### Step 3: Check for Alignment

For each relevant architecture area, verify:

#### Data Model
- [ ] Follows naming conventions (snake_case tables/columns)
- [ ] Includes standard timestamp fields
- [ ] Has workspace_id for multi-tenancy
- [ ] Relationships follow documented patterns
- [ ] Indexes are appropriate

#### Permissions
- [ ] Uses existing role hierarchy
- [ ] Permission format follows `resource:action` pattern
- [ ] RLS policies follow documented patterns
- [ ] Doesn't create permission sprawl

#### API Conventions
- [ ] Procedure names are descriptive
- [ ] Uses standard CRUD patterns where appropriate
- [ ] Error handling uses TRPCError correctly
- [ ] Input validation uses Zod schemas
- [ ] Response format is consistent

#### UI Patterns
- [ ] Uses shadcn/ui base components
- [ ] Follows page layout patterns
- [ ] Component naming follows conventions
- [ ] Loading/error states implemented
- [ ] File organization matches patterns

### Step 4: Generate Report

```markdown
## Architecture Alignment Report

**Feature**: [Feature name]
**Date**: [Current date]

### Areas Reviewed
- [ ] Data Model
- [ ] Permissions
- [ ] API Conventions
- [ ] UI Patterns

### Alignment Status

#### ✅ Aligned
- [List things that follow existing patterns]

#### ⚠️ New Patterns (Need Documentation)
- [List any new patterns being introduced]
- [These should be added to architecture docs after implementation]

#### ❌ Misaligned (Needs Adjustment)
- [List things that don't follow existing patterns]
- [Explain what needs to change]

### Recommendations
1. [Action item if any]
2. [Another action item]

### Architecture Docs to Update After Implementation
- [ ] `data-model.md` - [what to add]
- [ ] `permissions.md` - [what to add]
- [ ] `api-conventions.md` - [what to add]
- [ ] `ui-patterns.md` - [what to add]
```

### Step 5: Decision Point

Present options based on findings:

**If aligned:**
```
✅ Architecture check passed. The proposed implementation aligns with existing patterns.

Ready to proceed with `/create_plan` or `/implement_plan`.
```

**If new patterns:**
```
⚠️ New patterns detected. These should be documented.

Options:
1. Proceed and update architecture docs after implementation
2. Update architecture docs first, then implement
3. Discuss the new patterns before proceeding

Which approach would you prefer?
```

**If misaligned:**
```
❌ Architecture misalignment detected.

Issues found:
- [Issue 1]
- [Issue 2]

Options:
1. Adjust the implementation to follow existing patterns
2. Discuss updating the architecture to accommodate new approach
3. Proceed anyway (not recommended)

How would you like to proceed?
```

## Quick Check Mode

For a quick check without full report, use:
```
/architecture_check quick: [brief description of change]
```

Quick mode output:
```
Quick Architecture Check: [change description]

✅ Data Model: Aligned
✅ Permissions: N/A (no changes)
⚠️ API: New pattern - document after
✅ UI: Aligned

Overall: Ready to proceed with documentation note
```

## Integration with Other Commands

This command integrates with:
- `/create_plan` - Runs automatically during pre-flight
- `/research_codebase` - Can be run after to understand patterns
- `/validate_plan` - Checks if architecture docs need updates

---

**Architecture Docs Location**: `thoughts/shared/architecture/`

