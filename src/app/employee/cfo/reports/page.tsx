/**
 * CFO Financial Reports Page
 *
 * Uses metadata-driven ScreenRenderer for financial reports UI.
 * @see src/screens/operations/financial-reports.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { financialReportsScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded" />
      <div className="h-64 bg-stone-200 rounded" />
    </div>
  );
}

export default function CFOReportsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <ScreenRenderer definition={financialReportsScreen} />
      </Suspense>
    </AppLayout>
  );
}
