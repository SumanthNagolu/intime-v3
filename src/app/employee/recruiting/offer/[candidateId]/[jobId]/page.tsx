export const dynamic = "force-dynamic";
import { OfferBuilder } from '@/components/recruiting/OfferBuilder';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <OfferBuilder />
      </RecruitingLayout>
    </AppLayout>
  );
}
