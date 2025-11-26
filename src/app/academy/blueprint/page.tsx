export const dynamic = "force-dynamic";
import { BlueprintView } from '@/components/BlueprintView';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <BlueprintView />
    </AcademyLayout>
  );
}
