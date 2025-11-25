import { LeadDetail } from '@/components/recruiting/LeadDetail';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <RecruitingLayout>
      <LeadDetail />
      </RecruitingLayout>
    </AppLayout>
  );
}
