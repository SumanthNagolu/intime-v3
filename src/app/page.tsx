export const dynamic = "force-dynamic";
import { Home } from '@/components/Home';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <Home />
    </AppLayout>
  );
}
