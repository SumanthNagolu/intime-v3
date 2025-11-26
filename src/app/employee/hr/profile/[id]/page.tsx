export const dynamic = "force-dynamic";
import { EmployeeProfile } from '@/components/hr/EmployeeProfile';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <EmployeeProfile />
      </HRLayout>
    </AppLayout>
  );
}
