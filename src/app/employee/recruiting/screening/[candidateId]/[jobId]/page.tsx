import { ScreeningRoom } from '@/components/recruiting/ScreeningRoom';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <RecruitingLayout>
      <ScreeningRoom />
      </RecruitingLayout>
    </AppLayout>
  );
}
