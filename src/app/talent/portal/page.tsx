import { TalentPortal } from '@/components/talent/TalentPortal';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={false}>
      <TalentPortal />
    </AppLayout>
  );
}
