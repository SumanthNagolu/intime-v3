export const dynamic = "force-dynamic";
import { SourcedCandidates } from '@/components/sales/SourcedCandidates';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <SourcedCandidates />
    </AppLayout>
  );
}
