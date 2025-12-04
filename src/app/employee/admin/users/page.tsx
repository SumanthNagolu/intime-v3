/**
 * Admin Users List Page
 *
 * Lists all users with filtering and management actions.
 * @see src/screens/admin/users-list.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { usersListScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { AdminUsersListRenderer } from '@/components/admin';

function UsersListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="h-8 bg-stone-200 rounded w-32" />
        <div className="h-10 bg-stone-200 rounded w-28" />
      </div>
      <div className="h-10 bg-stone-200 rounded w-64" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<UsersListSkeleton />}>
          <AdminUsersListRenderer definition={usersListScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
