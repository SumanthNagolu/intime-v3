/**
 * Time Off Request Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the time off detail UI.
 * @see src/screens/hr/timeoff-detail.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { timeoffDetailScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { Skeleton } from '@/components/ui/skeleton';

function TimeOffDetailSkeleton() {
  return (
    <div className="flex gap-6">
      <div className="w-80 space-y-4">
        <Skeleton className="h-64" />
      </div>
      <div className="flex-1 space-y-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

export default function TimeOffDetailPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<TimeOffDetailSkeleton />}>
          <ScreenRenderer definition={timeoffDetailScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
