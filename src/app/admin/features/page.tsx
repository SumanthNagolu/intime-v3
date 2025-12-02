/**
 * Feature Flags Page
 *
 * Feature flag management with rollout percentage and user targeting.
 * @see src/screens/admin/feature-flags.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { featureFlagsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function FeatureFlagsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function FeatureFlagsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<FeatureFlagsSkeleton />}>
          <ScreenRenderer definition={featureFlagsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
