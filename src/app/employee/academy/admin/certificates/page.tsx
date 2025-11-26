export const dynamic = "force-dynamic";
import { CertificateManager } from '@/components/academy/CertificateManager';
import { AppLayout } from '@/components/AppLayout';
import { AcademyLayout } from '@/components/layouts/AcademyLayout';

export default function Page() {
  return (
    <AppLayout>
      <AcademyLayout>
        <CertificateManager />
      </AcademyLayout>
    </AppLayout>
  );
}
