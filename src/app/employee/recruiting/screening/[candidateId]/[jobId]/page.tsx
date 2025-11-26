export const dynamic = "force-dynamic";
import { ScreeningRoom } from '@/components/recruiting/ScreeningRoom';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <ScreeningRoom />
      </RecruitingLayout>
    </AppLayout>
  );
}
