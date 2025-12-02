/**
 * Employee Onboarding Form Page
 *
 * Uses metadata-driven ScreenRenderer for the employee onboarding form UI.
 * @see src/screens/hr/employee-onboard-form.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { employeeOnboardFormScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function OnboardFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-96 bg-stone-200 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-96 bg-stone-200 rounded-xl" />
        </div>
      </div>
      <div className="h-64 bg-stone-200 rounded-xl" />
      <div className="flex justify-end gap-4">
        <div className="h-10 w-24 bg-stone-200 rounded-lg" />
        <div className="h-10 w-32 bg-stone-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function EmployeeOnboardPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<OnboardFormSkeleton />}>
          <ScreenRenderer definition={employeeOnboardFormScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
