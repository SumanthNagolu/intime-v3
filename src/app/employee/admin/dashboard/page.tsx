/**
 * Employee Admin Dashboard Page
 *
 * Main admin entry point for employees with system health and quick actions.
 * @see src/screens/admin/admin-dashboard.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { adminDashboardScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function AdminDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded-lg" />
        <div className="h-64 bg-stone-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function EmployeeAdminDashboardPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<AdminDashboardSkeleton />}>
          <ScreenRenderer definition={adminDashboardScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
