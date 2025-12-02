/**
 * RACI Watchlist Page
 *
 * Uses metadata-driven ScreenRenderer for the RACI watchlist UI.
 * @see src/screens/operations/raci-watchlist.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { raciWatchlistScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function RACISkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function RACIWatchlistPage() {
  return (
    <AppLayout>
      <Suspense fallback={<RACISkeleton />}>
        <ScreenRenderer definition={raciWatchlistScreen} />
      </Suspense>
    </AppLayout>
  );
}
