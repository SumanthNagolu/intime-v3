export const dynamic = "force-dynamic";
import { RecruiterAnalytics } from '@/components/recruiting/RecruiterAnalytics';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <RecruiterAnalytics />
      </RecruitingLayout>
    </AppLayout>
  );
}
