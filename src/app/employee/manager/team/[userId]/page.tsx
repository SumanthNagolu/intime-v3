/**
 * IC Performance Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the IC performance detail UI.
 * @see src/screens/operations/ic-performance-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { icPerformanceDetailScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ userId: string }>;
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

export default async function ICPerformanceDetailPage({ params }: PageProps) {
  const { userId } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<DetailSkeleton />}>
        <ScreenRenderer
          definition={icPerformanceDetailScreen}
          context={{ params: { userId } }}
        />
      </Suspense>
    </AppLayout>
  );
}
