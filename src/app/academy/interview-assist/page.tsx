export const dynamic = "force-dynamic";
import { GuidewireInterviewAssistant } from '@/components/GuidewareInterviewAssistant';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <GuidewireInterviewAssistant />
    </AppLayout>
  );
}
