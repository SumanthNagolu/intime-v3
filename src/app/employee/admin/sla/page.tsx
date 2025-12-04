/**
 * Admin SLA Configuration Page
 *
 * Configure SLA rules and thresholds.
 * @see src/screens/admin/sla-config.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { slaConfigScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function SlaConfigSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminSlaPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<SlaConfigSkeleton />}>
          <ScreenRenderer definition={slaConfigScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
