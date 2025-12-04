/**
 * Bench Hotlists List Page
 *
 * Uses metadata-driven ListRenderer for the hotlists list UI.
 * @see src/screens/bench-sales/hotlist-list.screen.ts
 */

import { Suspense } from 'react';
import { ListRenderer } from '@/lib/metadata/renderers';
import { hotlistListScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function HotlistsListPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<ListSkeleton />}>
          <ListRenderer definition={hotlistListScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
