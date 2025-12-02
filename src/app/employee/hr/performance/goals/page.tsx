/**
 * Performance Goals Page
 *
 * Uses metadata-driven ScreenRenderer for the goals list UI.
 * @see src/screens/hr/goals-list.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { goalsListScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { Skeleton } from '@/components/ui/skeleton';

function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-12" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<GoalsSkeleton />}>
          <ScreenRenderer definition={goalsListScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
