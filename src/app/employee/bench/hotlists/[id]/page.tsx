/**
 * Bench Hotlist Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the hotlist detail UI.
 * @see src/screens/bench-sales/hotlist-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { hotlistDetailScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 bg-stone-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded-xl" />
    </div>
  );
}

export default function HotlistDetailPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ScreenRenderer definition={hotlistDetailScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
