# Convert Entity - Full Stack Conversion (Orchestrator)

Convert an entity through all three phases: Config, Backend, and UI with E2E tests.

## Usage
```
/convert-entity [entity-name]
```

## Examples
```
/convert-entity lead
/convert-entity job
/convert-entity submission
/convert-entity candidate
```

---

## Three-Phase Approach

This command orchestrates three focused phases for **consistent, context-efficient** entity conversion:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY CONFIGURATION                         │
│                  (Single Source of Truth)                       │
│         src/lib/entities/[domain]/[entity].entity.ts            │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│   BACKEND PHASE      │      │   FRONTEND PHASE     │
│                      │      │                      │
│ • Zod schemas        │      │ • Screen definitions │
│ • tRPC procedures    │      │ • Page wrappers      │
│ • Workplan setup     │      │ • Query/mutation     │
│ • Activity logging   │      │   hooks              │
│                      │      │ • E2E tests          │
└──────────────────────┘      └──────────────────────┘
```

---

## Phase 1: Entity Configuration

**Command:** `/convert-entity-config [entity]`

Creates the entity configuration file that serves as the single source of truth.

**Output:** `src/lib/entities/[domain]/[entity].entity.ts`

**What it includes:**
- All field definitions with types and validation
- Relations to other entities
- Database indexes
- Workplan configuration (root entities)
- UI configuration (columns, filters, tabs)

**Commit checkpoint after Phase 1:**
```bash
git commit -m "feat([domain]): add [entity] entity configuration"
```

---

## Phase 2: Backend Implementation

**Command:** `/convert-entity-backend [entity]`

Generates Zod schemas and tRPC procedures from the entity config.

**Outputs:**
- `src/lib/validations/[entity].ts`
- Updates to `src/server/routers/[domain].ts`

**What it includes:**
- Full entity schema, create/update/list input schemas
- 5 standard procedures: getById, list, create, update, delete
- Workplan integration (root entities)
- Activity logging
- Status change handling

**Commit checkpoint after Phase 2:**
```bash
git commit -m "feat([domain]): add [entity] backend procedures"
```

---

## Phase 3: Frontend + E2E Tests

**Command:** `/convert-entity-ui [entity]`

Generates frontend screens and comprehensive E2E tests from the entity config.

**Outputs:**
- `src/screens/[domain]/[entity]-list.screen.ts`
- `src/screens/[domain]/[entity]-detail.screen.ts`
- `src/app/employee/[module]/[entity]/page.tsx`
- `src/app/employee/[module]/[entity]/[id]/page.tsx`
- `src/hooks/queries/[entity].ts`
- `src/hooks/mutations/[entity].ts`
- `tests/e2e/[domain]/[entity]-complete-flow.spec.ts`

**What it includes:**
- List screen with filters, search, pagination
- Detail screen with tabs and sidebar
- Activity tab with WorkplanProgress (root entities)
- Query and mutation hooks
- Comprehensive E2E tests covering:
  - CRUD operations
  - List operations (filter, sort, search, pagination)
  - Activity tracking (root entities)
  - Error handling
  - Visual verification screenshots

**Commit checkpoint after Phase 3:**
```bash
git commit -m "feat([domain]): add [entity] frontend + E2E tests"
```

---

## Entity Categories

| Category | Entities | Workplan | Activity Tab |
|----------|----------|----------|--------------|
| **Root** | lead, job, submission, deal, placement | Yes | Yes |
| **Supporting** | account, contact, candidate, interview, offer | No | Optional |
| **Platform** | user, organization, group, role | No | No |

**Root entities** get automatic:
- Workplan creation on entity creation
- Activity logging for all operations
- Status change triggers
- Activity tab in detail screen
- WorkplanProgress in sidebar

---

## Running All Phases

### Option 1: Run Sequentially (Recommended)

Run each phase separately with commit checkpoints:

```bash
# Phase 1 - Creates entity config
/convert-entity-config lead

# Review and commit
git add src/lib/entities/
git commit -m "feat(crm): add lead entity configuration"

# Phase 2 - Creates backend
/convert-entity-backend lead

# Review and commit
git add src/lib/validations/ src/server/routers/
git commit -m "feat(crm): add lead backend procedures"

# Phase 3 - Creates frontend + runs tests
/convert-entity-ui lead

# Review, ensure tests pass, and commit
git add src/screens/ src/app/ src/hooks/ tests/e2e/ test-results/
git commit -m "feat(crm): add lead frontend + E2E tests"
```

### Option 2: Full Conversion (This Command)

Run all three phases in sequence:

```bash
/convert-entity lead
```

This will:
1. Create entity configuration
2. Generate backend (Zod + tRPC)
3. Generate frontend + run E2E tests
4. Create final commit with all changes

---

## Why Three Phases?

1. **Context Efficiency**: Each phase is focused and stays within context limits
2. **Consistency**: All phases read from the same entity config
3. **Checkpoint Safety**: Commit between phases to preserve work
4. **Easier Debugging**: If something fails, you know which phase
5. **Incremental Adoption**: Can run just Phase 1 to plan, then proceed

---

## Final Verification Checklist

After all three phases:

**Configuration:**
- [ ] Entity config has all fields from database
- [ ] Field types match database types
- [ ] Relations defined correctly
- [ ] Workplan config set (root entities)

**Backend:**
- [ ] Zod schemas generated correctly
- [ ] All 5 procedures implemented
- [ ] Workplan creates on entity creation (root)
- [ ] Activities logged on operations (root)
- [ ] Status changes trigger handlers (root)

**Frontend:**
- [ ] List screen renders with data
- [ ] Detail screen renders with all tabs
- [ ] Activity tab shows timeline (root)
- [ ] WorkplanProgress in sidebar (root)
- [ ] All CRUD operations work

**Testing:**
- [ ] All E2E tests pass
- [ ] Screenshots captured
- [ ] No console errors

**Documentation:**
- [ ] `docs/CONVERSION-PLAYBOOK.md` updated
- [ ] `docs/BACKEND-SYNC-TRACKER.md` updated

---

## See Also

- `/convert-entity-config` - Phase 1 details
- `/convert-entity-backend` - Phase 2 details
- `/convert-entity-ui` - Phase 3 details
- `/sync-entity` - Audit existing entity alignment
