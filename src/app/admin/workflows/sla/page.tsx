/**
 * SLA Configuration Page
 *
 * Configure service level agreements and response times.
 * @see src/screens/admin/sla-config.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { slaConfigScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function SlaConfigSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded-lg" />
    </div>
  );
}

export default function SlaConfigPage() {
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
