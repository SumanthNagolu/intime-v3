import { TalentJobDetail } from '@/components/talent/TalentJobDetail';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={false}>
      <TalentJobDetail />
    </AppLayout>
  );
}
