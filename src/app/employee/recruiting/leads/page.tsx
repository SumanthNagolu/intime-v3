/**
 * Leads List Page (Recruiting Module)
 *
 * Uses LeadsListRenderer for the leads list UI with real-time data fetching.
 * @see src/components/crm/LeadsListRenderer.tsx
 */

import { Suspense } from 'react';
import { leadListScreen } from '@/screens/crm';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';
import { LeadsListRenderer } from '@/components/crm/LeadsListRenderer';

export const dynamic = "force-dynamic";

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function LeadsListPage() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<ListSkeleton />}>
          <LeadsListRenderer definition={leadListScreen} />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
