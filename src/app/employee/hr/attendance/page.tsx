'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { attendanceListScreen } from '@/screens/hr';
import { Skeleton } from '@/components/ui/skeleton';

function AttendanceSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96" />
    </div>
  );
}

export default function AttendancePage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<AttendanceSkeleton />}>
          <ScreenRenderer definition={attendanceListScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
