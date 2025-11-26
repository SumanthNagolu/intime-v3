export const dynamic = "force-dynamic";
import { DealsPipeline } from '@/components/recruiting/DealsPipeline';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
        <DealsPipeline />
      </TALayout>
    </AppLayout>
  );
}
