export const dynamic = "force-dynamic";
import { DealWorkspace } from '@/components/recruiting/DealWorkspace';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <DealWorkspace />
      </RecruitingLayout>
    </AppLayout>
  );
}
