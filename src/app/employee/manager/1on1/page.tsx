/**
 * 1:1 Management Page
 *
 * Uses metadata-driven ScreenRenderer for the 1:1 management UI.
 * @see src/screens/operations/one-on-ones.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { oneOnOnesScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function OneOnOnesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function OneOnOnesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<OneOnOnesSkeleton />}>
        <ScreenRenderer definition={oneOnOnesScreen} />
      </Suspense>
    </AppLayout>
  );
}
