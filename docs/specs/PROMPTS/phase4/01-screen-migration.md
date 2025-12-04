# PROMPT: SCREEN-MIGRATION (Window 1-3)

Copy everything below the line and paste into Claude Code CLI:

---

Use the frontend skill and metadata skill.

Migrate ALL remaining pages to use the metadata-driven ScreenRenderer pattern. This is the PRIMARY focus of Phase 4 - converting legacy component-based pages to the standardized screen system.

## Read First:
- src/lib/metadata/renderers/ScreenRenderer.tsx (Understand the renderer)
- src/screens/index.ts (Screen registry pattern)
- src/screens/recruiting/recruiter-dashboard.screen.ts (Example dashboard)
- src/screens/recruiting/job-detail.screen.ts (Example detail screen)
- src/screens/recruiting/list-screens.ts (Example list screens)
- src/app/employee/recruiting/dashboard/page.tsx (Example converted page)

## Current State:
- **127 screen definitions exist** in src/screens/
- **~100 pages use ScreenRenderer** (~25%)
- **~300 pages still use old patterns** (~75%)

## Goal:
Convert ALL pages to use ScreenRenderer with their corresponding screen definitions. Delete old component-based patterns.

---

## WINDOW 1: Employee Module Pages (Recruiting, Bench, HR)

### Priority 1: Recruiting Pages (src/app/employee/recruiting/)

Most recruiting pages are converted. Verify and fix any gaps:

```
/employee/recruiting/dashboard ✓ (uses ScreenRenderer)
/employee/recruiting/jobs ✓
/employee/recruiting/jobs/[id] ✓
/employee/recruiting/jobs/new ✓
/employee/recruiting/candidates ✓
/employee/recruiting/candidates/[id] ✓
/employee/recruiting/submissions ✓
/employee/recruiting/submissions/[id] ✓
/employee/recruiting/interviews ✓
/employee/recruiting/interviews/[id] ✓
/employee/recruiting/placements ✓
/employee/recruiting/placements/[id] ✓
/employee/recruiting/activities ✓
/employee/recruiting/accounts → Check if using ScreenRenderer
/employee/recruiting/accounts/[id] → Check
/employee/recruiting/contacts → Check
/employee/recruiting/leads → Check
/employee/recruiting/deals → Check
```

### Priority 2: Bench Sales Pages (src/app/employee/bench/)

Screen definitions exist in src/screens/bench-sales/. Convert pages:

```
/employee/bench/dashboard ✓
/employee/bench/consultants → Convert to consultant-list.screen.ts
/employee/bench/consultants/[id] → Convert to consultant-detail.screen.ts
/employee/bench/consultants/onboard → Convert to consultant-onboard.screen.ts
/employee/bench/hotlists → Convert to hotlist-list.screen.ts
/employee/bench/hotlists/[id] → Convert to hotlist-detail.screen.ts
/employee/bench/job-orders → Convert to job-order-list.screen.ts
/employee/bench/job-orders/[id] → Convert to job-order-detail.screen.ts
/employee/bench/vendors → Convert to vendor-list.screen.ts
/employee/bench/vendors/[id] → Convert to vendor-detail.screen.ts
/employee/bench/marketing → Convert to marketing-profiles.screen.ts
/employee/bench/immigration → Convert to immigration-dashboard.screen.ts
/employee/bench/placements → Convert to bench-placements-list.screen.ts
/employee/bench/commission → Convert to commission-dashboard.screen.ts
/employee/bench/activities → Convert to bench-activities.screen.ts
```

### Priority 3: HR Pages (src/app/employee/hr/)

Screen definitions exist in src/screens/hr/. Convert pages:

```
/employee/hr/dashboard → Convert to hr-dashboard.screen.ts
/employee/hr/employees → Convert to employee-list.screen.ts
/employee/hr/employees/[id] → Convert to employee-detail.screen.ts
/employee/hr/pods → Convert to pod-list.screen.ts
/employee/hr/pods/[id] → Convert to pod-detail.screen.ts
/employee/hr/onboarding → Convert to onboarding-list.screen.ts
/employee/hr/onboarding/[id] → Convert to onboarding-detail.screen.ts
/employee/hr/performance → Convert to performance-list.screen.ts
/employee/hr/performance/[id] → Convert to performance-detail.screen.ts
/employee/hr/payroll → Convert to payroll-dashboard.screen.ts
/employee/hr/benefits → Convert to benefits-list.screen.ts
/employee/hr/compliance → Convert to compliance-dashboard.screen.ts
/employee/hr/compliance/i9 → Convert to i9-list.screen.ts
/employee/hr/compliance/immigration → Convert to immigration-list.screen.ts
/employee/hr/timeoff → Convert to timeoff-list.screen.ts
/employee/hr/attendance → Convert to attendance-list.screen.ts
/employee/hr/goals → Convert to goals-list.screen.ts
/employee/hr/reports → Convert to reports.screen.ts
/employee/hr/activities → Convert to hr-activities.screen.ts
```

### Page Conversion Pattern:

```typescript
// OLD PATTERN (DELETE THIS):
import { OldComponent } from '@/components/workspaces/OldComponent';
export default function SomePage() {
  return <OldComponent />;
}

// NEW PATTERN (USE THIS):
import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { someScreen } from '@/screens/module/some.screen';
import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleLayout } from '@/components/layout/ModuleLayout';
import { ListSkeleton } from '@/components/ui/skeletons';

export default function SomePage() {
  return (
    <AppLayout>
      <ModuleLayout>
        <Suspense fallback={<ListSkeleton />}>
          <ScreenRenderer definition={someScreen} />
        </Suspense>
      </ModuleLayout>
    </AppLayout>
  );
}
```

### For Detail Pages with Dynamic Routes:

```typescript
// src/app/employee/module/entity/[id]/page.tsx
import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { entityDetailScreen } from '@/screens/module/entity-detail.screen';
import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleLayout } from '@/components/layout/ModuleLayout';
import { DetailSkeleton } from '@/components/ui/skeletons';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EntityDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <ModuleLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ScreenRenderer
            definition={entityDetailScreen}
            params={{ id }}
          />
        </Suspense>
      </ModuleLayout>
    </AppLayout>
  );
}
```

---

## WINDOW 2: Executive & Manager Pages

### Priority 1: Manager Pages (src/app/employee/manager/)

Screen definitions exist in src/screens/operations/. Convert:

```
/employee/manager/dashboard → Convert to pod-dashboard.screen.ts
/employee/manager/pod → Convert to pod-overview.screen.ts
/employee/manager/team → Convert to team-management.screen.ts
/employee/manager/approvals → Convert to approvals-queue.screen.ts
/employee/manager/approvals/[id] → Convert to approval-detail.screen.ts
/employee/manager/escalations → Convert to escalations.screen.ts
/employee/manager/escalations/[id] → Convert to escalation-detail.screen.ts
/employee/manager/activities → Convert to manager-activities.screen.ts
/employee/manager/sla → Convert to sla-dashboard.screen.ts
/employee/manager/metrics → Convert to pod-metrics.screen.ts
/employee/manager/1-on-1s → Convert to one-on-ones.screen.ts
/employee/manager/1-on-1s/[id] → Convert to one-on-one-detail.screen.ts
/employee/manager/pipeline → Convert to pod-overview.screen.ts
/employee/manager/reports → Convert to financial-reports.screen.ts
```

### Priority 2: CEO Pages (src/app/employee/ceo/)

```
/employee/ceo/dashboard → Convert to ceo-dashboard.screen.ts
/employee/ceo/strategic → Convert to strategic-initiatives.screen.ts
/employee/ceo/portfolio → Convert to portfolio-overview.screen.ts
/employee/ceo/benchmarking → Convert to benchmarking.screen.ts
/employee/ceo/reports → Convert to executive-reports.screen.ts
```

### Priority 3: CFO Pages (src/app/employee/cfo/)

```
/employee/cfo/dashboard → Convert to cfo-dashboard.screen.ts
/employee/cfo/revenue → Convert to revenue-analytics.screen.ts
/employee/cfo/ar → Convert to ar-dashboard.screen.ts
/employee/cfo/margin → Convert to margin-analysis.screen.ts
/employee/cfo/forecasting → Convert to forecasting.screen.ts
/employee/cfo/placements → Convert to placements-financial.screen.ts
/employee/cfo/reports → Convert to financial-reports.screen.ts
```

### Priority 4: COO Pages (src/app/employee/coo/)

```
/employee/coo/dashboard → Convert to coo-dashboard.screen.ts
/employee/coo/pods → Convert to all-pods-overview.screen.ts
/employee/coo/pods/[id] → Convert to coo-pod-detail.screen.ts
/employee/coo/escalations → Convert to coo-escalations.screen.ts
/employee/coo/process → Convert to process-metrics.screen.ts
/employee/coo/analytics → Convert to operations-analytics.screen.ts
/employee/coo/cross-pod → Convert to cross-pod.screen.ts
```

### Priority 5: TA Pages (src/app/employee/ta/)

Screen definitions exist in src/screens/ta/. Convert:

```
/employee/ta/dashboard → Convert to ta-dashboard.screen.ts
/employee/ta/leads → Convert to ta-leads.screen.ts
/employee/ta/leads/[id] → Convert to lead-detail.screen.ts
/employee/ta/deals → Convert to ta-deals.screen.ts
/employee/ta/deals/[id] → Convert to deal-detail.screen.ts
/employee/ta/campaigns → Convert to ta-campaigns.screen.ts
/employee/ta/campaigns/[id] → Convert to campaign-detail.screen.ts
/employee/ta/campaigns/new → Convert to campaign-builder.screen.ts
/employee/ta/training → Convert to training-applications.screen.ts
/employee/ta/internal-jobs → Convert to internal-jobs.screen.ts
/employee/ta/analytics → Convert to ta-analytics.screen.ts
/employee/ta/activities → Convert to ta-activities.screen.ts
```

---

## WINDOW 3: Admin & Portal Pages

### Priority 1: Admin Pages (src/app/employee/admin/)

Screen definitions exist in src/screens/admin/. Convert ALL admin pages:

```
/employee/admin/dashboard → Convert to admin-dashboard.screen.ts (CRITICAL - currently uses old <AdminDashboard />)
/employee/admin/users → Convert to users-list.screen.ts
/employee/admin/users/[id] → Convert to user-detail.screen.ts
/employee/admin/users/invite → Convert to user-invite.screen.ts
/employee/admin/roles → Convert to roles-list.screen.ts
/employee/admin/roles/[id] → Convert to role-detail.screen.ts
/employee/admin/pods → Convert to pods-list.screen.ts
/employee/admin/pods/[id] → Convert to pod-detail.screen.ts
/employee/admin/pods/new → Convert to pod-create.screen.ts
/employee/admin/permissions → Convert to permissions-matrix.screen.ts
/employee/admin/audit → Convert to audit-logs.screen.ts
/employee/admin/settings → Convert to settings-hub.screen.ts
/employee/admin/settings/org → Convert to org-settings.screen.ts
/employee/admin/settings/security → Convert to security-settings.screen.ts
/employee/admin/settings/email → Convert to email-settings.screen.ts
/employee/admin/settings/api → Convert to api-settings.screen.ts
/employee/admin/integrations → Convert to integrations-hub.screen.ts
/employee/admin/workflows → Convert to workflows-hub.screen.ts
/employee/admin/activity-patterns → Convert to activity-patterns.screen.ts
/employee/admin/sla → Convert to sla-config.screen.ts
/employee/admin/data → Convert to data-hub.screen.ts
/employee/admin/data/import → Convert to data-import.screen.ts
/employee/admin/data/export → Convert to data-export.screen.ts
/employee/admin/notifications → Convert to notification-rules.screen.ts
/employee/admin/feature-flags → Convert to feature-flags.screen.ts
/employee/admin/system-logs → Convert to system-logs.screen.ts
```

### Priority 2: Client Portal Pages (src/app/client/)

Screen definitions exist in src/screens/portals/client/. Convert:

```
/client/dashboard → Convert to client-dashboard.screen.ts
/client/jobs → Convert to client-jobs-list.screen.ts
/client/jobs/[id] → Convert to client-job-detail.screen.ts
/client/submissions → Convert to client-submissions.screen.ts
/client/submissions/[id] → Convert to client-submission-detail.screen.ts
/client/interviews → Convert to client-interviews.screen.ts
/client/interviews/[id] → Convert to client-interview-detail.screen.ts
/client/placements → Convert to client-placements.screen.ts
/client/placements/[id] → Convert to client-placement-detail.screen.ts
/client/reports → Convert to client-reports.screen.ts
/client/settings → Convert to client-settings.screen.ts
```

### Priority 3: Talent Portal Pages (src/app/talent/)

Screen definitions exist in src/screens/portals/talent/. Convert:

```
/talent/dashboard → Convert to talent-dashboard.screen.ts
/talent/profile → Convert to talent-profile.screen.ts
/talent/jobs → Convert to talent-job-search.screen.ts
/talent/jobs/[id] → Convert to talent-job-detail.screen.ts
/talent/applications → Convert to talent-applications.screen.ts
/talent/applications/[id] → Convert to talent-application-detail.screen.ts
/talent/interviews → Convert to talent-interviews.screen.ts
/talent/interviews/[id] → Convert to talent-interview-detail.screen.ts
/talent/offers → Convert to talent-offers.screen.ts
/talent/offers/[id] → Convert to talent-offer-detail.screen.ts
/talent/saved → Convert to talent-saved-jobs.screen.ts
```

### Priority 4: Academy/Training Pages (src/app/training/ and src/app/academy/)

Screen definitions exist in src/screens/portals/academy/. Convert:

```
/training/dashboard → Convert to academy-dashboard.screen.ts
/training/courses → Convert to academy-courses-catalog.screen.ts
/training/courses/[id] → Convert to academy-course-detail.screen.ts
/training/courses/[courseId]/lessons/[lessonId] → Convert to academy-lesson-view.screen.ts
/training/my-learning → Convert to academy-my-learning.screen.ts
/training/certificates → Convert to academy-certificates.screen.ts
/training/achievements → Convert to academy-achievements.screen.ts

/academy/* → Same as /training/* (may need consolidation)
```

---

## Cleanup Tasks

### After Migration Complete:

1. **Delete Old Components** (src/components/workspaces/):
   - Remove any component only used by old pages
   - Keep shared utilities that are still needed

2. **Delete Old Admin Components**:
   - src/components/admin/AdminDashboard.tsx (replace with admin-dashboard.screen.ts)

3. **Update Exports**:
   - Update src/screens/index.ts to include all new screens
   - Ensure screen registry covers all converted pages

4. **Verify Navigation**:
   - All links work correctly
   - Breadcrumbs render properly
   - Back navigation functions

---

## Validation Checklist

After converting all pages, verify:

```bash
# 1. TypeScript compiles
pnpm tsc --noEmit

# 2. Build succeeds
pnpm build

# 3. No old patterns remain
grep -r "OldComponent" src/app/ --include="*.tsx"
grep -r "components/workspaces" src/app/ --include="*.tsx"

# 4. All pages use ScreenRenderer
grep -r "ScreenRenderer" src/app/ --include="*.tsx" | wc -l
```

## Requirements:
- Every page must use ScreenRenderer
- Proper TypeScript types for all params
- Correct layout wrappers (AppLayout + ModuleLayout)
- Suspense boundaries with appropriate skeletons
- Screen definitions must match page routes
- No duplicate screen definitions
