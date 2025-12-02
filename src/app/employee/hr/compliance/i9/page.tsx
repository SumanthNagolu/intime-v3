/**
 * I-9 Verification Page
 *
 * Uses metadata-driven ScreenRenderer for the I-9 list UI.
 * @see src/screens/hr/i9-list.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { i9ListScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { Skeleton } from '@/components/ui/skeleton';

function I9Skeleton() {
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

export default function I9Page() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<I9Skeleton />}>
          <ScreenRenderer definition={i9ListScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
