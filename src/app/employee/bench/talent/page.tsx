export const dynamic = "force-dynamic";
import { BenchTalentList } from '@/components/bench/BenchTalentList';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
        <BenchTalentList />
      </BenchLayout>
    </AppLayout>
  );
}
