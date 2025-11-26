export const dynamic = "force-dynamic";
import { PipelineView } from '@/components/recruiting/PipelineView';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <PipelineView />
      </RecruitingLayout>
    </AppLayout>
  );
}
