export const dynamic = "force-dynamic";
import { AccountsList } from '@/components/recruiting/AccountsList';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <AccountsList />
      </RecruitingLayout>
    </AppLayout>
  );
}
