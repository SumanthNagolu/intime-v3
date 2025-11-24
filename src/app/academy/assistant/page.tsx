export const dynamic = "force-dynamic";
import { AIAssistantPage } from '@/components/AIAssistantPage';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <AIAssistantPage />
    </AppLayout>
  );
}
