export const dynamic = "force-dynamic";
import { OrgChart } from '@/components/hr/OrgChart';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <OrgChart />
      </HRLayout>
    </AppLayout>
  );
}
