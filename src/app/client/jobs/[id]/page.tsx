/**
 * Client Portal Job Detail Page
 *
 * Job details with submissions, interviews, and placements tabs.
 * @see src/screens/portals/client/client-job-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientJobDetailScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function JobDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="h-4 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 border-b pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="h-96 bg-stone-200 rounded" />
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientJobDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<JobDetailSkeleton />}>
        <ScreenRenderer
          definition={clientJobDetailScreen}
          context={{ params: { jobId: id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
