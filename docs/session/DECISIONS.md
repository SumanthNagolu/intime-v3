# Architecture Decisions Log

This document tracks all significant architecture decisions made during implementation.

---

## Decision Template

```markdown
### DEC-XXX: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated
**Context:** [Why is this decision needed?]
**Decision:** [What was decided?]
**Consequences:** [What are the implications?]
**Alternatives Considered:** [What else was considered?]
```

---

## Decisions

### DEC-001: Infrastructure-First Implementation Approach

**Date:** 2025-12-01
**Status:** Accepted
**Context:** Need to decide whether to build vertically (complete one role) or horizontally (infrastructure first).
**Decision:** Infrastructure-first approach - complete database, Activities/Events system, then screens.
**Consequences:** 
- More upfront work before visible UI changes
- Solid foundation prevents rework
- Activities system powers all roles
**Alternatives Considered:**
- Vertical slices per role (rejected - would cause integration issues)
- Hybrid approach (rejected - Activities are fundamental)

---

### DEC-002: Rebuild Fresh vs Preserve Existing

**Date:** 2025-12-01
**Status:** Accepted
**Context:** Many existing pages are hardcoded (not metadata-driven). Decide whether to preserve or rebuild.
**Decision:** Rebuild fresh - only implement what specs define.
**Consequences:**
- Clean implementation following specs
- May lose some existing functionality temporarily
- Ensures consistency across all screens
**Alternatives Considered:**
- Preserve working pages (rejected - would create inconsistency)
- Convert incrementally (rejected - harder to maintain two patterns)

---

### DEC-003: Activities as Central Workflow Objects

**Date:** 2025-12-01
**Status:** Accepted
**Context:** Following Guidewire-inspired architecture where Activities are central.
**Decision:** "No work is done unless an activity is created" - every mutation creates/completes activities.
**Consequences:**
- Complete audit trail
- Enables productivity metrics
- Powers auto-activity patterns
- Required for SLA tracking
**Alternatives Considered:**
- Simple event logging only (rejected - loses workflow tracking)

---

### DEC-004: Metadata-Driven UI Architecture

**Date:** 2025-12-01
**Status:** Accepted
**Context:** Need consistent, maintainable UI across 100+ screens.
**Decision:** Use ScreenDefinition → ScreenRenderer pattern inspired by Guidewire PCF.
**Consequences:**
- Screens defined as TypeScript configuration
- Reusable InputSets and Widgets
- Easier to maintain and modify
- Permission-based visibility built-in
**Alternatives Considered:**
- Traditional React components per screen (rejected - too much duplication)

---

### DEC-005: Multi-Session Context Management

**Date:** 2025-12-01
**Status:** Accepted
**Context:** 200k context limit requires multiple agent sessions to complete implementation.
**Decision:** Use `docs/session/` for state handoff between sessions.
**Consequences:**
- Clear entry/exit points for each session
- Documented decisions and patterns
- Enables parallel work streams
**Alternatives Considered:**
- Rely on git commits only (rejected - loses context)

---

### DEC-006: docs/specs as Single Source of Truth (Bible)

**Date:** 2025-12-01
**Status:** Accepted
**Context:** Need a canonical reference for all application behavior, screens, fields, and workflows.
**Decision:** `/docs/specs/` is the "Bible" for InTime - the authoritative source of truth for:
- All database schemas (10-DATABASE/)
- All user roles and workflows (20-USER-ROLES/)
- All screen specifications (30-SCREENS/)
- All form definitions (40-FORMS/)
- All component specs (50-COMPONENTS/)
- All workflow definitions (60-WORKFLOWS/)
- All navigation patterns (70-NAVIGATION/)
- All action/event logging (80-ACTION-LOGGING/)

**Consequences:**
- Every implementation MUST reference specs before building
- Every change to implementation MUST update corresponding specs
- Specs serve as training material for new team members
- Specs serve as process book for operations
- No implementation without spec approval
- Discrepancies between code and spec are BUGS

**Integration with Tasks:**
Every task MUST include:
1. **Read spec first** - Identify relevant spec documents
2. **Implement per spec** - Follow spec exactly
3. **Update spec if needed** - If implementation reveals spec gaps, update spec
4. **Verify alignment** - Compare final implementation against spec

**Alternatives Considered:**
- Code as documentation (rejected - code doesn't capture intent)
- Separate wiki (rejected - would drift from code)

---

### DEC-007: Clean Reconciliation vs Defensive Workarounds for Migrations

**Date:** 2025-12-01
**Status:** Accepted
**Context:** Database migrations had accumulated issues:
- Duplicate timestamps
- Dependencies on non-existent tables
- Schema drift between actual DB and expected state
- Initial approach was to add defensive code (IF EXISTS, exception handlers) to get migrations to pass

**Problem with Defensive Approach:**
- Hides real problems instead of fixing them
- Results in unknown database state
- Creates technical debt
- Makes future migrations unpredictable

**Decision:** When migrations are broken, use the CLEAN RECONCILIATION approach:
1. **Audit current state** - Run scripts to check what actually exists in DB
2. **Compare to specs** - Identify gaps between reality and specs
3. **Create ONE clean migration** - Single migration to align DB with spec requirements
4. **Mark problematic migrations as "applied"** - Skip over broken ones
5. **Verify alignment** - Re-run audit to confirm DB matches specs

**Implementation:**
- Created `scripts/audit-database.ts` to check table existence
- Created `scripts/audit-activities-columns.ts` to check column alignment
- Created `20251201300000_reconcile_activities_schema.sql` with all needed changes
- Used `supabase migration repair --status applied` to skip broken migrations

**Consequences:**
- Database state is known and correct
- Clean migration history going forward
- Proper audit trail
- No hidden errors or workarounds

**Alternatives Considered:**
- Defensive workarounds (rejected - hides problems)
- Delete and recreate all migrations (rejected - too destructive)
- Manual SQL fixes without migration (rejected - loses audit trail)

