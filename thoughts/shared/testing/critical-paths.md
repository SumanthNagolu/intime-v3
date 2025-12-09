# Critical User Journeys

These are the essential user journeys that must pass before any release. They represent the core value paths of the InTime platform.

## Testing Pyramid

```
                    /E2E\           Playwright - critical journeys below
                   /─────\          Run before merge, catch integration issues
                  / Integ \         API contracts, database queries
                 /─────────\        Run after each phase
                /    Unit    \      Business logic, utilities
               ─────────────────    Run every implementation session
```

## Test Commands

| Test Type | Command | When to Run |
|-----------|---------|-------------|
| Unit | `pnpm test:unit` | Every implementation session |
| Integration | `pnpm test:integration` | After each phase |
| E2E Smoke | `pnpm test:e2e --grep @smoke` | Before validation |
| E2E Full | `pnpm test:e2e` | Before merge |
| All | `pnpm test` | Full verification |

---

## Critical Journeys by Module

### Authentication (Priority: CRITICAL)

| # | Journey | Smoke? | Test File |
|---|---------|--------|-----------|
| 1 | User can sign up with email | ✓ | `tests/e2e/auth/signup.spec.ts` |
| 2 | User can login with valid credentials | ✓ | `tests/e2e/auth/login.spec.ts` |
| 3 | User sees correct workspace after login | ✓ | `tests/e2e/auth/workspace.spec.ts` |
| 4 | User can reset password | | `tests/e2e/auth/password-reset.spec.ts` |
| 5 | Session expires correctly | | `tests/e2e/auth/session.spec.ts` |

### Recruiting Module (Priority: HIGH)

| # | Journey | Smoke? | Test File |
|---|---------|--------|-----------|
| 1 | Recruiter can create a job requisition | ✓ | `tests/e2e/recruiting/create-job.spec.ts` |
| 2 | Recruiter can view job list | ✓ | `tests/e2e/recruiting/job-list.spec.ts` |
| 3 | Recruiter can add candidate to job | ✓ | `tests/e2e/recruiting/add-candidate.spec.ts` |
| 4 | Recruiter can schedule interview | | `tests/e2e/recruiting/schedule-interview.spec.ts` |
| 5 | Recruiter can submit candidate to client | | `tests/e2e/recruiting/submit-to-client.spec.ts` |
| 6 | Recruiter can extend offer | | `tests/e2e/recruiting/extend-offer.spec.ts` |
| 7 | Recruiter can create placement from offer | | `tests/e2e/recruiting/create-placement.spec.ts` |
| 8 | Full placement workflow end-to-end | | `tests/e2e/recruiting/full-workflow.spec.ts` |

### CRM Module (Priority: HIGH)

| # | Journey | Smoke? | Test File |
|---|---------|--------|-----------|
| 1 | Sales rep can create a lead | ✓ | `tests/e2e/crm/create-lead.spec.ts` |
| 2 | Sales rep can view lead details | ✓ | `tests/e2e/crm/lead-details.spec.ts` |
| 3 | Sales rep can log activity on lead | | `tests/e2e/crm/log-activity.spec.ts` |
| 4 | Sales rep can create campaign | ✓ | `tests/e2e/crm/create-campaign.spec.ts` |
| 5 | Sales rep can add leads to campaign | | `tests/e2e/crm/campaign-leads.spec.ts` |
| 6 | Campaign can send emails | | `tests/e2e/crm/campaign-email.spec.ts` |
| 7 | Lead converts to client | | `tests/e2e/crm/lead-conversion.spec.ts` |

### Academy Module (Priority: MEDIUM)

| # | Journey | Smoke? | Test File |
|---|---------|--------|-----------|
| 1 | Trainee can view available courses | ✓ | `tests/e2e/academy/course-list.spec.ts` |
| 2 | Trainee can enroll in course | ✓ | `tests/e2e/academy/enroll.spec.ts` |
| 3 | Trainee can complete a lesson | | `tests/e2e/academy/complete-lesson.spec.ts` |
| 4 | Progress is tracked correctly | | `tests/e2e/academy/progress.spec.ts` |
| 5 | Trainer can create course | | `tests/e2e/academy/create-course.spec.ts` |

### Dashboard & Navigation (Priority: HIGH)

| # | Journey | Smoke? | Test File |
|---|---------|--------|-----------|
| 1 | Dashboard loads with correct widgets | ✓ | `tests/e2e/dashboard/load.spec.ts` |
| 2 | Navigation works for all main sections | ✓ | `tests/e2e/navigation/main-nav.spec.ts` |
| 3 | Breadcrumbs show correct path | | `tests/e2e/navigation/breadcrumbs.spec.ts` |
| 4 | Search works globally | | `tests/e2e/navigation/search.spec.ts` |

---

## Smoke Test Suite

The smoke tests (marked ✓ above) are the minimal set that must pass for any deployment:

```bash
# Run smoke tests only
pnpm test:e2e --grep @smoke
```

Expected: ~10-15 tests, completes in < 2 minutes

---

## Pre-Release Checklist

Before any production release:

### Automated
- [ ] All unit tests pass: `pnpm test:unit`
- [ ] All integration tests pass: `pnpm test:integration`
- [ ] Type checking passes: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] E2E smoke tests pass: `pnpm test:e2e --grep @smoke`
- [ ] Full E2E suite passes: `pnpm test:e2e`

### Manual
- [ ] Login flow works on production-like environment
- [ ] Key workflows tested with real-ish data
- [ ] Performance acceptable under load
- [ ] No console errors in browser
- [ ] Mobile responsive where applicable

---

## Adding New Critical Paths

When adding a new feature that's critical:

1. Identify the key user journey
2. Add it to the appropriate module section above
3. Mark as smoke test if it's essential for basic functionality
4. Create the E2E test file
5. Update this document

---

**Last Updated**: 2025-12-08
**Maintainer**: Development Team

