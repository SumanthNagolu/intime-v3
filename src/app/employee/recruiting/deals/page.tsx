export const dynamic = "force-dynamic";
import { DealsList } from '@/components/recruiting/DealsList';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <DealsList />
      </RecruitingLayout>
    </AppLayout>
  );
}
