/**
 * New Account Page (Recruiting Module)
 *
 * Form for creating a new client account.
 */

import { Suspense } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';
import { AccountForm } from '@/components/crm/AccountForm';

export const dynamic = "force-dynamic";

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function NewAccountPage() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<FormSkeleton />}>
          <AccountForm />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
