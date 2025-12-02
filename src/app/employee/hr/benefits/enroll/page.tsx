'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { benefitsEnrollmentScreen } from '@/screens/hr';
import { Skeleton } from '@/components/ui/skeleton';

function BenefitsEnrollmentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function BenefitsEnrollmentPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<BenefitsEnrollmentSkeleton />}>
          <ScreenRenderer definition={benefitsEnrollmentScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
