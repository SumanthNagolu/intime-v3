/**
 * Bench Vendors List Page
 *
 * Uses metadata-driven ScreenRenderer for the vendors list UI.
 * @see src/screens/bench-sales/vendor-list.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { vendorListScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function VendorsListPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<ListSkeleton />}>
          <ScreenRenderer definition={vendorListScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
