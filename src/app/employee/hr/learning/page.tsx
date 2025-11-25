import { LearningAdmin } from '@/components/hr/LearningAdmin';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <HRLayout>
      <LearningAdmin />
          </HRLayout>
    </AppLayout>
  );
}
