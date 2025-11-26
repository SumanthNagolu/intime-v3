export const dynamic = "force-dynamic";
import { LearningAdmin } from '@/components/hr/LearningAdmin';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <LearningAdmin />
      </HRLayout>
    </AppLayout>
  );
}
