/**
 * Admin Audit Logs Page
 *
 * Shows audit trail of all system actions.
 * @see src/screens/admin/audit-logs.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { auditLogsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function AuditLogsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-32" />
      <div className="flex gap-4">
        <div className="h-10 bg-stone-200 rounded w-64" />
        <div className="h-10 bg-stone-200 rounded w-32" />
        <div className="h-10 bg-stone-200 rounded w-32" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-14 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminAuditPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<AuditLogsSkeleton />}>
          <ScreenRenderer definition={auditLogsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
