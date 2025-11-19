# FOUND-016: Set Up GitHub Actions CI Pipeline

**Story Points:** 3
**Sprint:** Sprint 3 (Week 5-6)
**Priority:** HIGH

---

## User Story

As a **DevOps Engineer**,
I want **automated CI pipeline on every PR**,
So that **we catch issues before merging**.

---

## Acceptance Criteria

- [ ] GitHub Actions workflow for PRs
- [ ] TypeScript compilation check
- [ ] ESLint check
- [ ] Unit tests run
- [ ] Integration tests run
- [ ] E2E tests run (headless)
- [ ] Coverage report uploaded
- [ ] Status checks required for merge

---

## Technical Implementation

Create file: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: TypeScript check
        run: pnpm tsc --noEmit

      - name: ESLint
        run: pnpm lint

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Dependencies

- **Requires:** FOUND-013, FOUND-014, FOUND-015

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
