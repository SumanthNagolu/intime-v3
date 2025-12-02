/**
 * COO Pod Detail Page
 *
 * Uses metadata-driven ScreenRenderer for pod detail UI.
 * @see src/screens/operations/coo-pod-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { cooPodDetailScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ podId: string }>;
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="h-32 bg-stone-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      <div className="h-64 bg-stone-200 rounded" />
    </div>
  );
}

export default async function COOPodDetailPage({ params }: PageProps) {
  const { podId } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<DetailSkeleton />}>
        <ScreenRenderer
          definition={cooPodDetailScreen}
          context={{ params: { podId } }}
        />
      </Suspense>
    </AppLayout>
  );
}
