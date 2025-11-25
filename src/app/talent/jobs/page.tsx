import { TalentJobsList } from '@/components/talent/TalentJobsList';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={false}>
      <TalentJobsList />
    </AppLayout>
  );
}
