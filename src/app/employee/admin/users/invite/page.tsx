/**
 * Admin User Invite Page
 *
 * Form to invite new users to the organization.
 * @see src/screens/admin/user-invite.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { userInviteScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function UserInviteSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="max-w-2xl space-y-4">
        <div className="h-12 bg-stone-200 rounded" />
        <div className="h-12 bg-stone-200 rounded" />
        <div className="h-12 bg-stone-200 rounded" />
        <div className="h-10 bg-stone-200 rounded w-32" />
      </div>
    </div>
  );
}

export default function AdminUserInvitePage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<UserInviteSkeleton />}>
          <ScreenRenderer definition={userInviteScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
