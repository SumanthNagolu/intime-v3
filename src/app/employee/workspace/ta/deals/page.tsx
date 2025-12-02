/**
 * TA Deals Pipeline Page
 *
 * Uses metadata-driven ScreenRenderer for the Deal pipeline UI.
 * @see src/screens/ta/ta-deals.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { taDealsScreen } from '@/screens/ta';

export const dynamic = 'force-dynamic';

function DealsPipelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-72 h-96 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TADealsPage() {
  return (
    <Suspense fallback={<DealsPipelineSkeleton />}>
      <ScreenRenderer definition={taDealsScreen} />
    </Suspense>
  );
}
