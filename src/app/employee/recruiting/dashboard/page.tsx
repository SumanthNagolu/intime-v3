import { RecruiterDashboard } from '@/components/recruiting/RecruiterDashboard';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';
import { prefetchRecruitingDashboard, HydrationBoundary } from '@/lib/trpc/prefetch';

export const dynamic = "force-dynamic";

export default async function Page() {
  // Prefetch dashboard data on the server
  const dehydratedState = await prefetchRecruitingDashboard();

  return (
    <HydrationBoundary state={dehydratedState}>
      <AppLayout>
        <RecruitingLayout>
          <RecruiterDashboard />
        </RecruitingLayout>
      </AppLayout>
    </HydrationBoundary>
  );
}
