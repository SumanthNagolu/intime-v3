export const dynamic = "force-dynamic";
import { Recruitment } from '@/components/hr/Recruitment';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <Recruitment />
      </HRLayout>
    </AppLayout>
  );
}
