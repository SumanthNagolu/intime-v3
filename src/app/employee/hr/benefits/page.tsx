/**
 * Benefits Management Page
 *
 * Uses metadata-driven ScreenRenderer for the benefits list UI.
 * @see src/screens/hr/benefits-list.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { benefitsListScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function BenefitsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function BenefitsPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<BenefitsSkeleton />}>
          <ScreenRenderer definition={benefitsListScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
