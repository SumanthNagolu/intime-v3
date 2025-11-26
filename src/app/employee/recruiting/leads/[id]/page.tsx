export const dynamic = "force-dynamic";
import { LeadDetail } from '@/components/recruiting/LeadDetail';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <LeadDetail />
      </RecruitingLayout>
    </AppLayout>
  );
}
