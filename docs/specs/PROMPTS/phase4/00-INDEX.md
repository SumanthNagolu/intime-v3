# Phase 4: Final Integration & Testing

**Updated: December 2, 2025**

Phase 4 completes the InTime v3 implementation by migrating all screens, completing system services, wiring navigation, and comprehensive testing.

## Overview

| Window | Prompt | Focus | Est. Time |
|--------|--------|-------|-----------|
| 1-3 | 01-screen-migration.md | Convert all pages to ScreenRenderer | 2-3 days |
| 4 | 02-activity-system.md | Complete PatternService, QueueManager, jobs | 1 day |
| 5 | 03-event-system.md | Complete SubscriptionService, DeliveryService, handlers | 1 day |
| 6 | 04-navigation-flows.md | Wire up navigation, breadcrumbs, quick actions | 1 day |
| 7-8 | 05-testing.md | Unit tests, integration tests, E2E tests | 2-3 days |
| 9 | 06-final-cleanup.md | Remove old code, verify, launch prep | 1 day |

**Total Estimated Time: 8-10 days with parallel execution**

---

## Current State (Before Phase 4)

### What's Complete:
- Database schema: 100%
- Screen definitions: 127 screens defined
- tRPC routers: Consolidated routers work (ats.ts, crm.ts, hr.ts, etc.)
- Activity system core: 85%
- Event system core: 80%

### What Needs Phase 4:
- Screen Migration: ~75% of pages still use old patterns
- Activity System: Missing PatternService, QueueManager, scheduled jobs
- Event System: Missing SubscriptionService, DeliveryService, handlers
- Navigation: Needs verification and completion
- Testing: ~30% coverage, needs comprehensive E2E

---

## Execution Order

### Week 1: Screen Migration (Parallel - 3 Windows)

**Window 1: Employee Module Pages**
```bash
# Run prompt 01-screen-migration.md (Window 1 section)
# Focus: Recruiting, Bench, HR pages
```

**Window 2: Executive & Manager Pages**
```bash
# Run prompt 01-screen-migration.md (Window 2 section)
# Focus: Manager, CEO, CFO, COO, TA pages
```

**Window 3: Admin & Portal Pages**
```bash
# Run prompt 01-screen-migration.md (Window 3 section)
# Focus: Admin, Client Portal, Talent Portal, Academy
```

### Week 2: Systems & Navigation (Parallel - 3 Windows)

**Window 4: Activity System**
```bash
# Run prompt 02-activity-system.md
# Creates: PatternService, QueueManager, scheduled jobs
```

**Window 5: Event System**
```bash
# Run prompt 03-event-system.md
# Creates: SubscriptionService, DeliveryService, handlers
```

**Window 6: Navigation & Flows**
```bash
# Run prompt 04-navigation-flows.md
# Updates: navConfig, breadcrumbs, layouts, quick actions
```

### Week 3: Testing & Cleanup (Parallel - 2 Windows)

**Window 7-8: Testing**
```bash
# Run prompt 05-testing.md
# Creates: Unit tests, integration tests, E2E tests
```

**Window 9: Final Cleanup**
```bash
# Run prompt 06-final-cleanup.md
# Removes: Old components, fixes errors, validates launch readiness
```

---

## Validation Gates

### After Screen Migration:
```bash
pnpm tsc --noEmit
pnpm build
# No old component patterns should remain
grep -r "components/workspaces" src/app/ --include="*.tsx"
```

### After Systems Completion:
```bash
pnpm tsc --noEmit
pnpm test src/lib/activities/
pnpm test src/lib/events/
```

### After Navigation:
```bash
pnpm build
# Manual: Test all navigation flows work
```

### After Testing:
```bash
pnpm test
pnpm test:e2e
# Coverage should be >80%
```

### Final Validation:
```bash
pnpm tsc --noEmit  # Zero errors
pnpm lint          # Zero warnings
pnpm test          # All pass
pnpm test:e2e      # All pass
pnpm build         # Successful
```

---

## Test Users

All test users have password: `TestPass123!`

| Role | Email | Dashboard Route |
|------|-------|-----------------|
| Admin | admin@intime.com | /employee/admin/dashboard |
| HR Manager | hr@intime.com | /employee/hr/dashboard |
| Recruiting Mgr | rec_mgr1@intime.com | /employee/manager/dashboard |
| Recruiter | rec1@intime.com | /employee/recruiting/dashboard |
| Bench Sales Mgr | bs_mgr1@intime.com | /employee/manager/dashboard |
| Bench Sales | bs1@intime.com | /employee/bench/dashboard |

---

## Success Criteria

Phase 4 is complete when:

1. **All Pages Migrated**: Every page uses ScreenRenderer or redirect
2. **Activity System Complete**: PatternService, QueueManager, jobs working
3. **Event System Complete**: All handlers, subscriptions, delivery working
4. **Navigation Working**: All routes, breadcrumbs, quick actions functional
5. **Tests Passing**: Unit, integration, and E2E tests at >80% coverage
6. **Build Clean**: `pnpm build` succeeds with no errors
7. **Manual Test Pass**: All user flows verified manually

---

## Key Changes from Original Phase 4

The original Phase 4 prompts focused on:
- Creating routers from scratch
- Basic activity/event systems
- Generic testing

Updated Phase 4 now focuses on:
- **Screen Migration** (highest priority - 75% of pages need conversion)
- **System Completion** (not creation - services exist, need enhancement)
- **Navigation Verification** (flows must work end-to-end)
- **Comprehensive E2E** (role-based testing for all user types)
- **Launch Readiness** (cleanup, validation, performance)

This reflects the actual current state of the codebase where database, schemas, and core systems exist but need completion and integration.
