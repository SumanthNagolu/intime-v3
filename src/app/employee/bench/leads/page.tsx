export const dynamic = "force-dynamic";
import { LeadsList } from '@/components/recruiting/LeadsList';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
        <LeadsList />
      </BenchLayout>
    </AppLayout>
  );
}
