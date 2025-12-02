/**
 * System Logs Page
 *
 * System logs with error logs, API requests, background jobs, and performance tabs.
 * @see src/screens/admin/system-logs.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { systemLogsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function SystemLogsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="h-64 bg-stone-200 rounded-lg" />
    </div>
  );
}

export default function SystemLogsPage() {
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
