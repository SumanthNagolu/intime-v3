import { Analytics } from '@/components/hr/Analytics';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <HRLayout>
      <Analytics />
          </HRLayout>
    </AppLayout>
  );
}
