export const dynamic = "force-dynamic";
import { LeadsList } from '@/components/recruiting/LeadsList';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
        <LeadsList />
      </TALayout>
    </AppLayout>
  );
}
