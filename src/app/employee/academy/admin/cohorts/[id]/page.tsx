export const dynamic = "force-dynamic";
import { CohortDetail } from '@/components/academy/CohortDetail';
import { AppLayout } from '@/components/AppLayout';
import { AcademyLayout } from '@/components/layouts/AcademyLayout';

export default function Page() {
  return (
    <AppLayout>
      <AcademyLayout>
        <CohortDetail />
      </AcademyLayout>
    </AppLayout>
  );
}
