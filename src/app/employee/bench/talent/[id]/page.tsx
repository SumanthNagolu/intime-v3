export const dynamic = "force-dynamic";
import { BenchTalentDetail } from '@/components/bench/BenchTalentDetail';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
        <BenchTalentDetail />
      </BenchLayout>
    </AppLayout>
  );
}
