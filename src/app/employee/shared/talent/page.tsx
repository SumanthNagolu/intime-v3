import { SharedTalentPool } from '@/components/shared/SharedTalentPool';
import { AppLayout } from '@/components/AppLayout';
import { SharedLayout } from '@/components/layouts/SharedLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <SharedLayout>
      <SharedTalentPool />
          </SharedLayout>
    </AppLayout>
  );
}
