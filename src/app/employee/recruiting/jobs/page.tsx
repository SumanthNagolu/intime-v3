export const dynamic = "force-dynamic";
import { RecruitingJobsList } from '@/components/recruiting/RecruitingJobsList';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <RecruitingJobsList />
      </RecruitingLayout>
    </AppLayout>
  );
}
