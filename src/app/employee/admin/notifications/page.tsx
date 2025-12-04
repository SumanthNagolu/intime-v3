/**
 * Admin Notification Rules Page
 *
 * Configure notification rules and triggers.
 * @see src/screens/admin/notification-rules.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { notificationRulesScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function NotificationRulesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<NotificationRulesSkeleton />}>
          <ScreenRenderer definition={notificationRulesScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
