/**
 * Employee Profile/Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the employee detail UI.
 * @see src/screens/hr/employee-detail.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { employeeDetailScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-6">
        <div className="w-80 space-y-4">
          <div className="h-48 bg-stone-200 rounded-xl" />
          <div className="h-32 bg-stone-200 rounded-xl" />
          <div className="h-24 bg-stone-200 rounded-xl" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-12 bg-stone-200 rounded-lg" />
          <div className="h-64 bg-stone-200 rounded-xl" />
          <div className="h-48 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default async function EmployeeProfilePage({ params }: PageProps) {
  // params consumed by ScreenRenderer via useParams hook
  await params;

  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<ProfileSkeleton />}>
          <ScreenRenderer definition={employeeDetailScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
