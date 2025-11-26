export const dynamic = "force-dynamic";
import { Documents } from '@/components/hr/Documents';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <Documents />
      </HRLayout>
    </AppLayout>
  );
}
