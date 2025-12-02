/**
 * Employee Benefits Page
 *
 * Uses metadata-driven ScreenRenderer for the employee benefits UI.
 * @see src/screens/hr/employee-benefits.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { employeeBenefitsScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

interface PageProps {
  params: Promise<{ id: string }>;
}

function EmployeeBenefitsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded-xl" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
      <div className="h-96 bg-stone-200 rounded-xl" />
    </div>
  );
}

export default async function EmployeeBenefitsPage({ params }: PageProps) {
  // params consumed by ScreenRenderer via useParams hook
  await params;

  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<EmployeeBenefitsSkeleton />}>
          <ScreenRenderer definition={employeeBenefitsScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
