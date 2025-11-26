export const dynamic = "force-dynamic";
import { SourcedCandidates } from '@/components/sales/SourcedCandidates';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
        <SourcedCandidates />
      </TALayout>
    </AppLayout>
  );
}
