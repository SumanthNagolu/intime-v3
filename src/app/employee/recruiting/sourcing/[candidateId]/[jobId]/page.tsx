export const dynamic = "force-dynamic";
import { SourcingRoom } from '@/components/recruiting/SourcingRoom';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <SourcingRoom />
      </RecruitingLayout>
    </AppLayout>
  );
}
