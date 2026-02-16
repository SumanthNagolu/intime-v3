export const dynamic = "force-dynamic";
import { StudentWelcome } from '@/components/StudentWelcome';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <StudentWelcome />
    </AppLayout>
  );
}
