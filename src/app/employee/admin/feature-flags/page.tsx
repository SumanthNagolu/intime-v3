/**
 * Admin Feature Flags Page
 *
 * Manage feature flags for controlled rollouts.
 * @see src/screens/admin/feature-flags.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { featureFlagsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function FeatureFlagsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminFeatureFlagsPage() {
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
