/**
 * Bench Job Orders List Page
 *
 * Uses metadata-driven ListRenderer for the job orders list UI.
 * @see src/screens/bench-sales/job-order-list.screen.ts
 */

import { Suspense } from 'react';
import { ListRenderer } from '@/lib/metadata/renderers';
import { jobOrderListScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function JobOrdersListPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<ListSkeleton />}>
          <ListRenderer definition={jobOrderListScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
