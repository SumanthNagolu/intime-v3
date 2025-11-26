export const dynamic = "force-dynamic";
import { PersonaView } from '@/components/PersonaView';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <PersonaView />
    </AcademyLayout>
  );
}
