export const dynamic = "force-dynamic";
import { Analytics } from '@/components/hr/Analytics';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <Analytics />
      </HRLayout>
    </AppLayout>
  );
}
