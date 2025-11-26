export const dynamic = "force-dynamic";
import { CampaignManager } from '@/components/sales/CampaignManager';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
        <CampaignManager />
      </TALayout>
    </AppLayout>
  );
}
