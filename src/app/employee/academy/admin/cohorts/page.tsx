import { CohortsList } from '@/components/academy/CohortsList';
import { AppLayout } from '@/components/AppLayout';
import { AcademyLayout } from '@/components/layouts/AcademyLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <AcademyLayout>
      <CohortsList />
          </AcademyLayout>
    </AppLayout>
  );
}
