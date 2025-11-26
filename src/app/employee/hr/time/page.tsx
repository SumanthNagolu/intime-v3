export const dynamic = "force-dynamic";
import { TimeAttendance } from '@/components/hr/TimeAttendance';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <TimeAttendance />
      </HRLayout>
    </AppLayout>
  );
}
