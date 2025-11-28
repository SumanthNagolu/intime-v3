export const dynamic = "force-dynamic";
import { LeadWorkspace } from '@/components/recruiting/LeadWorkspace';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <LeadWorkspace />
      </RecruitingLayout>
    </AppLayout>
  );
}
