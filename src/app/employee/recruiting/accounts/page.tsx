import { AccountsList } from '@/components/recruiting/AccountsList';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <RecruitingLayout>
      <AccountsList />
      </RecruitingLayout>
    </AppLayout>
  );
}
