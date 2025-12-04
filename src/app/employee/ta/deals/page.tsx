/**
 * TA Deals Page
 *
 * Uses metadata-driven ScreenRenderer for the TA deals pipeline UI.
 * @see src/screens/ta/ta-deals.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { taDealsScreen } from '@/screens/ta';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function PipelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 h-96 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TADealsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<PipelineSkeleton />}>
        <ScreenRenderer definition={taDealsScreen} />
      </Suspense>
    </AppLayout>
  );
}
