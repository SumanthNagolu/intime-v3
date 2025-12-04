/**
 * Admin System Logs Page
 *
 * View system logs and errors.
 * @see src/screens/admin/system-logs.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { systemLogsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function SystemLogsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-32" />
      <div className="flex gap-4">
        <div className="h-10 bg-stone-200 rounded w-64" />
        <div className="h-10 bg-stone-200 rounded w-32" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="h-10 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminSystemLogsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<SystemLogsSkeleton />}>
          <ScreenRenderer definition={systemLogsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
