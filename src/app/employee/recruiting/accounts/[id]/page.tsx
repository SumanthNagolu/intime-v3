export const dynamic = "force-dynamic";
import { AccountDetail } from '@/components/recruiting/AccountDetail';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <AccountDetail />
      </RecruitingLayout>
    </AppLayout>
  );
}
