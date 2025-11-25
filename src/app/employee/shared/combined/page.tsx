import { CombinedView } from '@/components/shared/CombinedView';
import { AppLayout } from '@/components/AppLayout';
import { SharedLayout } from '@/components/layouts/SharedLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <SharedLayout>
      <CombinedView />
          </SharedLayout>
    </AppLayout>
  );
}
