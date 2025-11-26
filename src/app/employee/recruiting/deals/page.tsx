export const dynamic = "force-dynamic";
import { DealsPipeline } from '@/components/recruiting/DealsPipeline';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <DealsPipeline />
      </RecruitingLayout>
    </AppLayout>
  );
}
