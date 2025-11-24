export const dynamic = "force-dynamic";
import { AccountProspects } from '@/components/sales/AccountProspects';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <AccountProspects />
    </AppLayout>
  );
}
