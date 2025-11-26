export const dynamic = "force-dynamic";
import { JobDetail } from '@/components/recruiting/JobDetail';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <JobDetail />
      </RecruitingLayout>
    </AppLayout>
  );
}
