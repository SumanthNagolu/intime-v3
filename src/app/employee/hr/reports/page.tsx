'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { reportsScreen } from '@/screens/hr';
import { Skeleton } from '@/components/ui/skeleton';

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<ReportsSkeleton />}>
          <ScreenRenderer definition={reportsScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
