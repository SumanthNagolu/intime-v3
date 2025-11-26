export const dynamic = "force-dynamic";
import { PostJobOrder } from '@/components/recruiting/PostJobOrder';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <PostJobOrder />
      </RecruitingLayout>
    </AppLayout>
  );
}
