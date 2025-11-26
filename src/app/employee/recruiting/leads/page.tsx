export const dynamic = "force-dynamic";
import { LeadsList } from '@/components/recruiting/LeadsList';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <LeadsList />
      </RecruitingLayout>
    </AppLayout>
  );
}
