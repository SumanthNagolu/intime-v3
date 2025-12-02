/**
 * Account Detail Page (Recruiting Module)
 *
 * Uses AccountDetailRenderer for improved layout and RACI-based data loading.
 */

import { Suspense } from 'react';
import { AccountDetailRenderer } from '@/components/crm/AccountDetailRenderer';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="h-4 bg-stone-200 rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-stone-200 rounded-xl" />
          <div className="h-48 bg-stone-200 rounded-xl" />
          <div className="h-48 bg-stone-200 rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-stone-200 rounded-xl" />
          <div className="h-48 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function AccountDetailPage() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <AccountDetailRenderer />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
