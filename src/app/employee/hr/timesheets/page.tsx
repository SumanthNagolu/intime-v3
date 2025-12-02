/**
 * Timesheet Approval Page
 *
 * Uses metadata-driven ScreenRenderer for the timesheet approval UI.
 * @see src/screens/hr/timesheet-approval.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { timesheetApprovalScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function TimesheetApprovalSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-4">
        <div className="h-10 w-32 bg-stone-200 rounded-lg" />
        <div className="h-10 w-32 bg-stone-200 rounded-lg" />
        <div className="h-10 w-48 bg-stone-200 rounded-lg ml-auto" />
      </div>
      <div className="h-96 bg-stone-200 rounded-xl" />
    </div>
  );
}

export default function TimesheetApprovalPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<TimesheetApprovalSkeleton />}>
          <ScreenRenderer definition={timesheetApprovalScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
