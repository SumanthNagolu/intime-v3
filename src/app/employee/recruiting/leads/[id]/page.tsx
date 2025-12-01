/**
 * Lead Detail Page (Recruiting Module)
 * 
 * Uses metadata-driven ScreenRenderer for the lead detail UI.
 * @see src/screens/crm/lead-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { leadDetailScreen } from '@/screens/crm';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-64 bg-stone-200 rounded" />
        </div>
        <div className="h-96 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ScreenRenderer definition={leadDetailScreen} />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
