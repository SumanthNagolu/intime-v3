import { CampaignBuilder } from '@/components/sales/CampaignBuilder';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <CampaignBuilder />
    </AppLayout>
  );
}
