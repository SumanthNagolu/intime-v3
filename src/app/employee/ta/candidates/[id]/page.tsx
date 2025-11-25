import { SourcedCandidateDetail } from '@/components/sales/SourcedCandidateDetail';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <SourcedCandidateDetail />
    </AppLayout>
  );
}
