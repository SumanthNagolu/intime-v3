export const dynamic = "force-dynamic";
import { TalentList } from '@/components/recruiting/TalentList';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <TalentList />
      </RecruitingLayout>
    </AppLayout>
  );
}
