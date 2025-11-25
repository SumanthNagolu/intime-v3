import { BenchTalentList } from '@/components/bench/BenchTalentList';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <BenchLayout>
        <BenchTalentList />
      </BenchLayout>
    </AppLayout>
  );
}
