export const dynamic = "force-dynamic";
import { BlueprintView } from '@/components/BlueprintView';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <BlueprintView />
    </AppLayout>
  );
}
