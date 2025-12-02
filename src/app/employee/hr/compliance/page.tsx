/**
 * Compliance Dashboard Page
 *
 * Uses metadata-driven ScreenRenderer for the compliance dashboard UI.
 * @see src/screens/hr/compliance-dashboard.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { complianceDashboardScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function ComplianceSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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

export default function CompliancePage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<ComplianceSkeleton />}>
          <ScreenRenderer definition={complianceDashboardScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
