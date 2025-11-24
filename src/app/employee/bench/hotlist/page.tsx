export const dynamic = "force-dynamic";
import { HotlistBuilder } from '@/components/bench/HotlistBuilder';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <HotlistBuilder />
    </AppLayout>
  );
}
