/**
 * Employee Directory Page
 *
 * Uses metadata-driven ScreenRenderer for the employee list UI.
 * @see src/screens/hr/employee-list.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { employeeListScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function EmployeeDirectoryPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<ListSkeleton />}>
          <ScreenRenderer definition={employeeListScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
