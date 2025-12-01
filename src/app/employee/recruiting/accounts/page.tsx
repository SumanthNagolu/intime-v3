/**
 * Accounts List Page (Recruiting Module)
 * 
 * Uses metadata-driven ScreenRenderer for the accounts list UI.
 * @see src/screens/crm/account-list.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { accountListScreen } from '@/screens/crm';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function AccountsListPage() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<ListSkeleton />}>
          <ScreenRenderer definition={accountListScreen} />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
