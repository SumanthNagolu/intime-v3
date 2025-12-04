/**
 * Deals Page (Recruiting Module)
 *
 * Uses DealPipelineRenderer for the deal pipeline UI with real tRPC data.
 * @see src/screens/crm/deal-pipeline.screen.ts
 */

import { Suspense } from 'react';
import { DealPipelineRenderer } from '@/components/crm/DealPipelineRenderer';
import { dealPipelineScreen } from '@/screens/crm';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

function PipelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-4 overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 h-96 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function DealsPage() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<PipelineSkeleton />}>
          <DealPipelineRenderer definition={dealPipelineScreen} />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
