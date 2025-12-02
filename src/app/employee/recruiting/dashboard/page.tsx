/**
 * Recruiter Dashboard Page
 *
 * Uses metadata-driven DashboardRenderer for the dashboard UI with
 * real-time data fetching from tRPC.
 * @see src/screens/recruiting/recruiter-dashboard.screen.ts
 */

import { Suspense } from 'react';
import { recruiterDashboardScreen } from '@/screens/recruiting';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';
import { DashboardRenderer } from '@/components/recruiting/DashboardRenderer';

export const dynamic = "force-dynamic";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-stone-200 rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-stone-200 rounded-xl" />
          <div className="h-48 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function RecruiterDashboardPage() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardRenderer definition={recruiterDashboardScreen} />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
