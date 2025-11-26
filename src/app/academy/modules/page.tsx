export const dynamic = "force-dynamic";
import { AcademyModules } from '@/components/academy/AcademyModules';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <AcademyModules />
    </AcademyLayout>
  );
}
