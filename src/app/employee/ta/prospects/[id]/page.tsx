import { AccountProspects } from '@/components/sales/AccountProspects';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <AccountProspects />
    </AppLayout>
  );
}
