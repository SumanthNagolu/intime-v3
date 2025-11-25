export const dynamic = "force-dynamic";
import { RecruiterDashboard } from '@/components/recruiting/RecruiterDashboard';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
      <RecruiterDashboard />
            </RecruitingLayout>
    </AppLayout>
  );
}
