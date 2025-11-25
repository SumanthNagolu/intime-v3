import { TimeAttendance } from '@/components/hr/TimeAttendance';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <HRLayout>
      <TimeAttendance />
          </HRLayout>
    </AppLayout>
  );
}
