---
date: 2025-12-12T09:11:38-05:00
researcher: Claude
git_commit: 2dee128
branch: main
repository: intime-v3
topic: "Test Cleanup - Obsolete Test Cases Analysis"
tags: [research, tests, cleanup, playwright, vitest]
status: complete
last_updated: 2025-12-12
last_updated_by: Claude
---

# Research: Test Cleanup - Obsolete Test Cases Analysis

**Date**: 2025-12-12T09:11:38-05:00
**Researcher**: Claude
**Git Commit**: 2dee128
**Branch**: main
**Repository**: intime-v3

## Research Question

Identify and clean up old/obsolete test cases that agents keep running, syncing in all applicable places.

## Summary

The codebase has a comprehensive test infrastructure with Playwright (E2E) and Vitest (unit/integration) tests. One obsolete unit test file was identified and removed (`screenings.test.ts`), and test output directories were properly added to `.gitignore`.

## Detailed Findings

### Test Infrastructure Overview

| Test Type | Framework | Location | File Count |
|-----------|-----------|----------|------------|
| E2E Tests | Playwright | `tests/e2e/` | 24 spec files |
| Unit Tests | Vitest | `tests/unit/` | 6 test files (now 5) |
| Integration Tests | Vitest | `tests/integration/` | 1 test file |

### Test Configuration Files

- `vitest.config.ts` - Vitest configuration for unit/integration tests
- `playwright.config.ts` - Playwright configuration for E2E tests
- `src/lib/testing/setup.ts` - Global test setup

### Obsolete Test Identified

**File**: `tests/unit/trpc/screenings.test.ts`

**Issue**: This file tested `screenings.*` tRPC procedures that do not exist:
- `screenings.startScreening`
- `screenings.saveKnockoutAnswers`
- `screenings.saveTechnicalAssessment`
- `screenings.saveSoftSkillsAssessment`
- `screenings.completeScreening`

**Verification**: Checked `src/server/trpc/root.ts` - no `screeningsRouter` is mounted. The root router includes:
- `ats` (with `jobs`, `submissions`, `interviews`, `offers`, `placements`, `commissions`, `candidates`)
- `compliance` (with `requirements`, `items`, `entityRequirements`)
- `contracts` (with `versions`, `parties`, `templates`, `clauses`)
- `rates` (with `rateCards`, `items`, `entityRates`, `approvals`)

But NO standalone `screenings` router.

### Valid Unit Tests

| Test File | Tests | Router Status |
|-----------|-------|---------------|
| `candidates.test.ts` | Schema validation, mock setups | `ats.candidates` exists |
| `compliance.test.ts` | Compliance procedures | `complianceRouter` exists |
| `contracts.test.ts` | Contract procedures | `contractsRouter` exists |
| `rates.test.ts` | Rate procedures | `ratesRouter` exists |
| `entity-navigation.test.ts` | Navigation logic | N/A (UI logic) |

### E2E Tests Status

All 24 E2E test files test real routes that exist in `src/app/employee/admin/`:
- Admin dashboard, users, pods, roles, permissions
- Feature flags, integrations, workflows
- SLA, emergency, data management
- Email templates, activity patterns, notifications
- Recruiting workspace, candidates, accounts
- CRM deals, campaigns

### Git Tracking Issues Found

1. `test-results/.last-run.json` - Was tracked but deleted
2. `playwright-report/index.html` - Was tracked (519KB generated file)

### .gitignore Gaps

Original `.gitignore` only had:
```
coverage/
.nyc_output/
```

Missing:
```
test-results/
playwright-report/
```

## Cleanup Actions Performed

### Phase 1: Initial Cleanup (Obsolete Test)
1. **Deleted**: `tests/unit/trpc/screenings.test.ts`
   - Tested non-existent `screenings.*` procedures

### Phase 2: Full Test Removal (User Request)
All tests were removed as they had already been run and were no longer needed.

**Removed Directories:**
- `tests/e2e/` - 24 E2E spec files + helpers + utils
- `tests/unit/` - 6 unit test files
- `tests/integration/` - 1 integration test file
- `src/lib/testing/` - Test setup file

**Removed Configuration Files:**
- `vitest.config.ts`
- `playwright.config.ts`

**Removed package.json Scripts:**
- `test` (vitest)
- `test:watch` (vitest watch)
- `test:e2e` (playwright test)
- `test:e2e:ui` (playwright test --ui)
- `test:e2e:headed` (playwright test --headed)

**Kept Scripts** (utility scripts, not framework tests):
- `test:auth` (tsx scripts/test-auth.ts)
- `test:signup` (tsx scripts/quick-signup-test.ts)

**Removed devDependencies:**
- `@playwright/test`
- `@testing-library/jest-dom`
- `@testing-library/react`
- `@testing-library/user-event`
- `@vitejs/plugin-react`
- `@vitest/coverage-v8`
- `jsdom`
- `vitest`
- `vitest-mock-extended`

### Git Cleanup
- Untracked `test-results/.last-run.json`
- Untracked `playwright-report/`
- Updated `.gitignore` to include `test-results/` and `playwright-report/`

## Code References

- `src/server/trpc/root.ts:66-130` - Root router configuration showing all mounted routers
- `vitest.config.ts` - Test patterns: `src/**/*.{test,spec}.*`, `tests/unit/**/*`, `tests/integration/**/*`
- `playwright.config.ts:9` - E2E test directory: `./tests/e2e`

## Architecture Documentation

### Test Organization Pattern

```
tests/
├── e2e/                    # Playwright E2E tests (*.spec.ts)
│   ├── helpers/            # Auth helpers
│   ├── utils/              # Performance utilities
│   └── performance/        # Performance tests
├── unit/                   # Vitest unit tests (*.test.ts)
│   ├── trpc/               # tRPC procedure tests
│   └── navigation/         # Navigation logic tests
└── integration/            # Vitest integration tests
    └── trpc/               # End-to-end tRPC workflow tests
```

### Test Scripts

```json
{
  "test": "vitest",
  "test:watch": "vitest watch",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed"
}
```

## Related Research

N/A - First test cleanup research document.

## Open Questions

1. Should the remaining unit tests be updated to test actual tRPC procedure calls via `createCaller`?
2. Should integration tests be added for the `ats.candidates` procedures that `candidates.test.ts` mocks?
