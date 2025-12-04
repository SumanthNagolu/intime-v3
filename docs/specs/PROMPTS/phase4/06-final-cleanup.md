# PROMPT: FINAL-CLEANUP (Window 9)

Copy everything below the line and paste into Claude Code CLI:

---

Use the frontend skill and testing skill.

Final cleanup, validation, and launch preparation for InTime v3.

## Read First:
- src/app/ (All pages)
- src/screens/ (All screen definitions)
- src/components/ (All components)
- package.json (Dependencies and scripts)

---

## Task 1: Remove Old Components

Delete legacy components that are no longer needed:

```bash
# Check for unused components
# These should be removed if no longer imported:

# Old workspace components (replaced by ScreenRenderer)
rm -rf src/components/workspaces/old-*
rm -rf src/components/legacy/

# Old admin components (replaced by metadata-driven screens)
# Only remove if AdminDashboard is now using screen definition
rm src/components/admin/AdminDashboard.tsx  # After migration

# Check for any remaining old patterns
grep -r "components/workspaces" src/app/ --include="*.tsx"
grep -r "OldComponent" src/app/ --include="*.tsx"
```

Run these checks and remove files that are truly unused.

---

## Task 2: Update Screen Registry

Ensure all screens are properly registered:

```typescript
// src/screens/index.ts - Verify complete

// Check all modules are exported
export { recruitingScreens } from './recruiting';
export { benchSalesScreens } from './bench-sales';
export { crmScreens } from './crm';
export { taScreens } from './ta';
export { operationsScreens } from './operations';
export { hrScreens } from './hr';
export { adminScreens } from './admin';
export { portalScreens } from './portals';

// Verify registry is complete
import { recruitingScreens } from './recruiting';
import { benchSalesScreens } from './bench-sales';
import { crmScreens } from './crm';
import { taScreens } from './ta';
import { operationsScreens } from './operations';
import { hrScreens } from './hr';
import { adminScreens } from './admin';
import { clientPortalScreens, talentPortalScreens, academyScreens } from './portals';

export const screenRegistry = {
  ...recruitingScreens,
  ...benchSalesScreens,
  ...crmScreens,
  ...taScreens,
  ...operationsScreens,
  ...hrScreens,
  ...adminScreens,
  ...clientPortalScreens,
  ...talentPortalScreens,
  ...academyScreens,
} as const;

export type ScreenId = keyof typeof screenRegistry;
```

---

## Task 3: Fix TypeScript Errors

Run full type check and fix any errors:

```bash
# Run type check
pnpm tsc --noEmit 2>&1 | tee typescript-errors.txt

# Common fixes needed:

# 1. Drizzle numeric fields (strings, not numbers)
# Wrong: job.rateMin (as number)
# Right: parseFloat(job.rateMin)

# 2. Drizzle date fields (already strings)
# Wrong: job.createdAt.toISOString()
# Right: job.createdAt

# 3. Null handling
# Wrong: value || ''
# Right: value ?? ''

# 4. Screen definition field types
# Wrong: fieldType: 'text'
# Right: type: 'text'

# 5. DataSource structure
# Wrong: { procedure: 'x' }
# Right: { query: { procedure: 'x' } }
```

Fix all reported errors before proceeding.

---

## Task 4: Verify All Routes

Create route verification script:

```typescript
// scripts/verify-routes.ts

import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

async function verifyRoutes() {
  const pages = await glob('src/app/**/page.tsx');
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const page of pages) {
    const content = fs.readFileSync(page, 'utf-8');

    // Check for ScreenRenderer usage
    if (!content.includes('ScreenRenderer') && !content.includes('redirect')) {
      warnings.push(`${page}: Not using ScreenRenderer`);
    }

    // Check for proper layout wrapping
    if (!content.includes('AppLayout') && !content.includes('Layout')) {
      warnings.push(`${page}: Missing layout wrapper`);
    }

    // Check for Suspense boundaries
    if (content.includes('ScreenRenderer') && !content.includes('Suspense')) {
      warnings.push(`${page}: Missing Suspense boundary`);
    }

    // Check for proper async params handling (Next.js 15)
    if (content.includes('params:') && !content.includes('Promise<')) {
      if (content.includes('[id]') || content.includes('[')) {
        errors.push(`${page}: Params should be Promise<> in Next.js 15`);
      }
    }
  }

  console.log('\n=== Route Verification Results ===\n');

  if (errors.length > 0) {
    console.log('ERRORS (must fix):');
    errors.forEach((e) => console.log(`  ❌ ${e}`));
  }

  if (warnings.length > 0) {
    console.log('\nWARNINGS (review):');
    warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All routes verified successfully!');
  }

  return { errors, warnings };
}

verifyRoutes();
```

Run: `npx tsx scripts/verify-routes.ts`

---

## Task 5: Run Full Build

```bash
# Clean previous build
rm -rf .next

# Run full build
pnpm build

# Check for build errors
# If errors, fix and rebuild

# Verify build output
ls -la .next/
```

---

## Task 6: Test All User Flows

Manual testing checklist for each role:

### Recruiter Flow
- [ ] Login as rec1@intime.com
- [ ] Dashboard loads with metrics
- [ ] Jobs list displays and filters
- [ ] Can view job detail
- [ ] Candidates list displays
- [ ] Can view candidate detail
- [ ] Submissions list displays
- [ ] Interviews calendar works
- [ ] Activities queue shows tasks
- [ ] Can complete an activity
- [ ] Navigation works correctly
- [ ] Breadcrumbs display correctly

### Bench Sales Flow
- [ ] Login as bs1@intime.com
- [ ] Dashboard loads
- [ ] Consultants list displays
- [ ] Can view consultant detail
- [ ] Hotlists display
- [ ] Job orders list displays
- [ ] Marketing profiles work
- [ ] Immigration section accessible
- [ ] Activities queue works

### HR Flow
- [ ] Login as hr@intime.com
- [ ] Dashboard loads
- [ ] Employees list displays
- [ ] Pods list displays
- [ ] Onboarding section works
- [ ] Performance section works
- [ ] Benefits section accessible
- [ ] Compliance section accessible

### Manager Flow
- [ ] Login as rec_mgr1@intime.com
- [ ] Dashboard loads with team metrics
- [ ] Pod overview displays
- [ ] Approvals queue works
- [ ] Escalations visible
- [ ] Can view team activities

### Admin Flow
- [ ] Login as admin@intime.com
- [ ] Dashboard loads
- [ ] Users list displays
- [ ] Roles configuration works
- [ ] Pods management works
- [ ] Settings accessible
- [ ] Audit logs display

### Client Portal
- [ ] Can login to client portal
- [ ] Dashboard displays
- [ ] Jobs list shows
- [ ] Submissions reviewable
- [ ] Can schedule interviews

### Talent Portal
- [ ] Can login to talent portal
- [ ] Profile displays
- [ ] Job search works
- [ ] Can apply to jobs
- [ ] Applications list shows

---

## Task 7: Performance Check

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000/employee/recruiting/dashboard --output html --output-path ./lighthouse-report.html

# Check bundle size
pnpm build
du -sh .next/static/chunks/*.js | sort -h | tail -20

# Check for large dependencies
npx depcheck
npx bundlephobia
```

---

## Task 8: Clean Up Package.json

```bash
# Check for unused dependencies
npx depcheck

# Remove unused dependencies
# pnpm remove <package-name>

# Update outdated packages (carefully)
pnpm outdated

# Fix any security vulnerabilities
pnpm audit
pnpm audit fix
```

---

## Task 9: Update Environment Variables

Verify all required environment variables are documented:

```bash
# .env.example should include:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=

# Optional but recommended:
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```

---

## Task 10: Create Launch Checklist

Create `docs/LAUNCH-CHECKLIST.md`:

```markdown
# InTime v3 Launch Checklist

## Pre-Launch

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No ESLint warnings
- [ ] All tests passing
- [ ] Test coverage > 80%

### Functionality
- [ ] All screens use ScreenRenderer
- [ ] All navigation works
- [ ] All forms submit correctly
- [ ] Activity system working
- [ ] Event system working
- [ ] Notifications working

### Security
- [ ] Auth working correctly
- [ ] Role-based access enforced
- [ ] No exposed secrets
- [ ] CSRF protection enabled

### Performance
- [ ] Build succeeds
- [ ] Lighthouse score > 80
- [ ] No memory leaks
- [ ] Database queries optimized

### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Deployment guide written

## Deployment

- [ ] Database migrations run
- [ ] Environment variables set
- [ ] CDN configured
- [ ] SSL certificates valid
- [ ] Monitoring enabled
- [ ] Error tracking enabled
- [ ] Backup system configured

## Post-Launch

- [ ] Smoke tests pass in production
- [ ] User acceptance testing complete
- [ ] Performance monitoring active
- [ ] Error rates acceptable
```

---

## Final Validation Commands

```bash
# 1. Type check
pnpm tsc --noEmit

# 2. Lint
pnpm lint

# 3. Unit tests
pnpm test

# 4. Build
pnpm build

# 5. E2E tests (if CI)
pnpm test:e2e

# 6. Start production build locally
pnpm start

# All commands should pass without errors
```

---

## Success Criteria

Before declaring Phase 4 complete:

1. **Zero TypeScript Errors** - `pnpm tsc --noEmit` passes
2. **Zero Build Errors** - `pnpm build` succeeds
3. **All Tests Pass** - `pnpm test` and `pnpm test:e2e` pass
4. **All Screens Migrated** - No old component patterns remain
5. **All Flows Working** - Manual testing checklist complete
6. **Clean Codebase** - No unused code, no warnings

When all criteria are met, InTime v3 is ready for deployment!
