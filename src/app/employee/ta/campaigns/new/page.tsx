export const dynamic = "force-dynamic";
import { CampaignBuilder } from '@/components/sales/CampaignBuilder';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
        <CampaignBuilder />
      </TALayout>
    </AppLayout>
  );
}
