import { LeadsList } from '@/components/recruiting/LeadsList';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <TALayout>
      <LeadsList />
          </TALayout>
    </AppLayout>
  );
}
