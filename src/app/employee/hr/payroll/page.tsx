/**
 * Payroll Dashboard Page
 *
 * Uses metadata-driven ScreenRenderer for the payroll dashboard UI.
 * @see src/screens/hr/payroll-dashboard.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { payrollDashboardScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function PayrollSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-stone-200 rounded-xl" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function PayrollPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<PayrollSkeleton />}>
          <ScreenRenderer definition={payrollDashboardScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
