export const dynamic = "force-dynamic";
import { AIAssistantPage } from '@/components/AIAssistantPage';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <AIAssistantPage />
    </AcademyLayout>
  );
}
