/**
 * Bench Marketing Profiles Page
 *
 * Uses MarketingProfilesRenderer for real database-driven marketing profiles UI.
 * @see src/screens/bench-sales/marketing-profiles.screen.ts
 */

import { Suspense } from 'react';
import { MarketingProfilesRenderer } from '@/components/bench';
import { marketingProfilesScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-stone-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function MarketingProfilesPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<ListSkeleton />}>
          <MarketingProfilesRenderer definition={marketingProfilesScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
