/**
 * Talent Portal Job Detail Page
 *
 * Job details with requirements match and apply action.
 * @see src/screens/portals/talent/talent-job-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentJobDetailScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function JobDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="h-4 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="h-48 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
        </div>
        <div className="col-span-1 space-y-4">
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-24 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TalentJobDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<JobDetailSkeleton />}>
        <ScreenRenderer
          definition={talentJobDetailScreen}
          context={{ params: { jobId: id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
