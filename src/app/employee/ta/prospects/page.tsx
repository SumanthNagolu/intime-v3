export const dynamic = "force-dynamic";
import { AccountProspects } from '@/components/sales/AccountProspects';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
      <AccountProspects />
          </TALayout>
    </AppLayout>
  );
}
