export const dynamic = "force-dynamic";
import { DealDetail } from '@/components/recruiting/DealDetail';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <DealDetail />
      </RecruitingLayout>
    </AppLayout>
  );
}
