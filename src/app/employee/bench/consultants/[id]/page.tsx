/**
 * Bench Consultant Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the consultant detail UI.
 * @see src/screens/bench-sales/consultant-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { consultantDetailScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-stone-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-stone-200 rounded" />
          <div className="h-4 w-32 bg-stone-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded-xl" />
    </div>
  );
}

export default function ConsultantDetailPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ScreenRenderer definition={consultantDetailScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
