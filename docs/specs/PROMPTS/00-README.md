# Parallel Execution Prompts

Open 6 terminal windows. In each, run:

```bash
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3
claude
```

Then paste the prompt from the appropriate file below.

## Phase 1: Database (Run All 6 in Parallel)

| Window | Prompt File | Description |
|--------|-------------|-------------|
| 1 | `phase1/01-db-core.md` | Core tables (orgs, users, rbac, events) |
| 2 | `phase1/02-db-ats.md` | ATS (jobs, candidates, submissions, placements) |
| 3 | `phase1/03-db-crm.md` | CRM (accounts, leads, deals, campaigns) |
| 4 | `phase1/04-db-bench.md` | Bench Sales (consultants, vendors, immigration) |
| 5 | `phase1/05-db-hr-academy.md` | HR + Academy (employees, courses, gamification) |
| 6 | `phase1/06-db-workplan.md` | Workplan (patterns, activities, SLA) |

## Phase 2: Components (Run All 6 in Parallel)

| Window | Prompt File | Description |
|--------|-------------|-------------|
| 1 | `phase2/01-ui-forms.md` | Form components |
| 2 | `phase2/02-ui-tables.md` | Data table components |
| 3 | `phase2/03-ui-cards.md` | Card components |
| 4 | `phase2/04-ui-modals.md` | Modal/drawer components |
| 5 | `phase2/05-ui-layouts.md` | Layout components |
| 6 | `phase2/06-ui-activities.md` | Activity UI components |

## Phase 3: Screens (Run All 6 in Parallel)

| Window | Prompt File | Description |
|--------|-------------|-------------|
| 1 | `phase3/01-screens-recruiter.md` | Recruiter screens |
| 2 | `phase3/02-screens-bench.md` | Bench Sales screens |
| 3 | `phase3/03-screens-manager-hr.md` | Manager + HR screens |
| 4 | `phase3/04-screens-executive.md` | CFO/COO/CEO screens |
| 5 | `phase3/05-screens-portals.md` | Client + Candidate portals |
| 6 | `phase3/06-screens-admin.md` | Admin + Settings screens |

## Phase 4: Integration (Run 3-4 in Parallel)

| Window | Prompt File | Description |
|--------|-------------|-------------|
| 1 | `phase4/01-trpc-routers.md` | All tRPC routers |
| 2 | `phase4/02-activity-system.md` | Activity engine |
| 3 | `phase4/03-event-system.md` | Event bus |
| 4-6 | `phase4/04-testing.md` | Tests (can split) |

## Execution Order

```
Phase 1 ──────────────────┐
(all 6 parallel)          │
                          ▼
                    Phase 2
              (all 6 parallel)
                          │
                          ▼
                    Phase 3
              (all 6 parallel)
                          │
                          ▼
                    Phase 4
              (4 parallel)
```

Wait for each phase to complete before starting the next.

## Quick Start Commands

```bash
# Terminal setup for each window
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3
claude

# Then paste the content from the appropriate prompt file
```

## Skills to Load

Each prompt file specifies which skills to load. Common patterns:
- Database work: `Use the database skill`
- UI work: `Use the metadata skill`
- Domain work: `Use the [domain] skill` (recruiting, bench-sales, crm, hr, academy)
- Testing: `Use the testing skill`

## After Each Phase

### After Phase 1 (Database):
```bash
npx drizzle-kit generate
pnpm tsc --noEmit  # Verify no type errors
```

### After Phase 2 (Components):
```bash
pnpm tsc --noEmit  # Verify types
pnpm lint          # Check linting
```

### After Phase 3 (Screens):
```bash
pnpm build         # Verify build
```

### After Phase 4 (Integration):
```bash
pnpm test          # Run unit tests
pnpm test:e2e      # Run E2E tests
```

## Tips for Parallel Execution

1. **Start all windows simultaneously** - Don't wait for one to finish
2. **Monitor for conflicts** - If two windows edit the same file, resolve manually
3. **Check git status** - After each phase, review changes before committing
4. **Use tmux/screen** - For easier window management

## Troubleshooting

- **Type errors**: Run `pnpm tsc --noEmit` and fix before proceeding
- **Migration conflicts**: Consolidate migrations before running
- **Component conflicts**: Check exports in index.ts files
