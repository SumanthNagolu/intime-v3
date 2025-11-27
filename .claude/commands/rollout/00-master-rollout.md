# InTime v3 Production Rollout - Master Command

## Quick Status Check

Run this first to check overall system state:

```bash
# Check database connection & seeded data
pnpm tsx scripts/seed-test-users.ts

# Check if dev server runs
timeout 30 npm run dev
```

---

## Rollout Sequence

Execute components in this order. Each depends on the previous:

| Phase | Component | Command | Status |
|-------|-----------|---------|--------|
| 0 | **Foundation** | `/rollout/01-auth` | Ready |
| 1 | **Admin Console** | `/rollout/02-admin` | Blocked by Phase 0 |
| 2 | **HR Module** | `/rollout/03-hr` | Blocked by Phase 1 |
| 3 | **TA/Sales** | `/rollout/04-ta-sales` | Blocked by Phase 0 |
| 4 | **Recruiting** | `/rollout/05-recruiting` | Blocked by Phase 0 |
| 5 | **Bench Sales** | `/rollout/06-bench` | Blocked by Phase 4 |
| 6 | **Academy** | `/rollout/07-academy` | Blocked by Phase 0 |
| 7 | **Client Portal** | `/rollout/08-client` | Blocked by Phase 4 |

---

## Test Users (All use password: TestPass123!)

| Role | Email | Dashboard Route |
|------|-------|-----------------|
| CEO/Super Admin | ceo@intime.com | /employee/ceo/dashboard |
| Admin | admin@intime.com | /employee/admin/dashboard |
| HR Manager | hr_admin@intime.com | /employee/hr/dashboard |
| Recruiter | jr_rec@intime.com | /employee/recruiting/dashboard |
| Bench Sales | jr_bs@intime.com | /employee/bench/dashboard |
| TA/Sales | jr_ta@intime.com | /employee/ta/dashboard |
| Trainer | trainer@intime.com | /employee/portal |
| Student | student@intime.com | /academy/dashboard |

---

## Per-Component Workflow

Each rollout command follows this pattern:

### Phase 1: Audit (Research Only)
- Database schema analysis
- Server action audit
- UI component inventory
- Gap identification

### Phase 2: Fix Database
- RLS policies
- Missing indexes
- Seed data

### Phase 3: Server Actions
- CRUD operations
- Zod validation
- Audit logging

### Phase 4: UI Integration
- Wire forms to actions
- Replace mock data
- Loading/error states

### Phase 5: E2E Tests
- Playwright test file
- Run and fix until green

### Phase 6: Verification
- Complete checklist
- Sign-off

---

## How to Use

1. Start with: **"Execute /rollout/01-auth"**
2. Complete all 6 phases for that component
3. Run E2E tests: `pnpm playwright test tests/e2e/auth-workflows.spec.ts`
4. Move to next component when tests pass

---

## Critical Rules

1. **One component at a time** - Don't skip ahead
2. **Tests must pass** - No moving forward with failing tests
3. **No mock data** - Everything connects to real database
4. **RLS required** - Multi-tenancy isolation is non-negotiable
5. **Audit everything** - All mutations logged

---

## Start Command

```
Execute /rollout/01-auth

Start with Phase 1 (Audit). Read and analyze:
1. src/app/actions/auth.ts
2. src/lib/db/schema/rbac.ts
3. src/lib/db/schema/user-profiles.ts
4. src/middleware.ts
5. src/app/login/page.tsx
6. src/components/admin/UserManagement.tsx

Create gap analysis document with priorities.
```
