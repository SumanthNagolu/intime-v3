export const dynamic = "force-dynamic";
import { SubmissionsListPage } from '@/components/recruiting/SubmissionsListPage';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <SubmissionsListPage />
      </RecruitingLayout>
    </AppLayout>
  );
}
