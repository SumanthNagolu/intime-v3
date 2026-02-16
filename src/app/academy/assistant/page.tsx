export const dynamic = "force-dynamic";
import { GuruChat } from '@/components/academy/GuruChat';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-charcoal-900 tracking-tight">
          Guidewire Guru
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Your AI-powered Guidewire expert — ask anything about PolicyCenter, ClaimCenter, BillingCenter, and more
        </p>
      </div>
      <GuruChat />
    </AppLayout>
  );
}
