import { DealsPipeline } from '@/components/recruiting/DealsPipeline';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <TALayout>
      <DealsPipeline />
          </TALayout>
    </AppLayout>
  );
}
