export const dynamic = "force-dynamic";
import { SourcedCandidateDetail } from '@/components/sales/SourcedCandidateDetail';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
        <SourcedCandidateDetail />
      </TALayout>
    </AppLayout>
  );
}
