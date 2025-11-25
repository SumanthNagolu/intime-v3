import { LeadsList } from '@/components/recruiting/LeadsList';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <BenchLayout>
      <LeadsList />
      </BenchLayout>
    </AppLayout>
  );
}
