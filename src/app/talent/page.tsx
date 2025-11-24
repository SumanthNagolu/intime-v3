export const dynamic = "force-dynamic";
import { BenchWelcome } from '@/components/BenchWelcome';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchWelcome />
    </AppLayout>
  );
}
