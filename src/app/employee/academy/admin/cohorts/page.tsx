export const dynamic = "force-dynamic";
import { CohortsList } from '@/components/academy/CohortsList';
import { AppLayout } from '@/components/AppLayout';
import { AcademyLayout } from '@/components/layouts/AcademyLayout';

export default function Page() {
  return (
    <AppLayout>
      <AcademyLayout>
        <CohortsList />
      </AcademyLayout>
    </AppLayout>
  );
}
