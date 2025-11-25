import { PlacementWorkflow } from '@/components/recruiting/PlacementWorkflow';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <RecruitingLayout>
      <PlacementWorkflow />
      </RecruitingLayout>
    </AppLayout>
  );
}
