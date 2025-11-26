export const dynamic = "force-dynamic";
import { PlacementWorkflow } from '@/components/recruiting/PlacementWorkflow';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <PlacementWorkflow />
      </RecruitingLayout>
    </AppLayout>
  );
}
