/**
 * Sprint Board Page
 *
 * Uses metadata-driven ScreenRenderer for the sprint board UI.
 * @see src/screens/operations/sprint-board.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { sprintBoardScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function SprintSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-48 bg-stone-200 rounded" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function SprintBoardPage() {
  return (
    <AppLayout>
      <Suspense fallback={<SprintSkeleton />}>
        <ScreenRenderer definition={sprintBoardScreen} />
      </Suspense>
    </AppLayout>
  );
}
