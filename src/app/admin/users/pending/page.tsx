/**
 * Pending Invitations Page
 *
 * List of pending user invitations with resend/cancel actions.
 * @see src/screens/admin/pending-invitations.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { pendingInvitationsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function PendingInvitationsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function PendingInvitationsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<PendingInvitationsSkeleton />}>
          <ScreenRenderer definition={pendingInvitationsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
