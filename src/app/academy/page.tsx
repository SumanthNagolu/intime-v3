export const dynamic = "force-dynamic";
import { PublicAcademy } from '@/components/PublicAcademy';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <PublicAcademy />
    </AppLayout>
  );
}
