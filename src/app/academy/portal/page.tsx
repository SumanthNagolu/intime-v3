export const dynamic = "force-dynamic";

import { AcademyPortal } from '@/components/academy/AcademyPortal';
import { AcademyLayout } from '@/components/AcademyLayout';
import { requirePortalAccess } from '@/lib/auth/server';
import { getStudentEnrollmentStatus } from '@/app/actions/academy';
import { StudentDemoPage } from '@/components/academy/StudentDemoPage';

export const metadata = {
  title: 'Training Academy - Portal | InTime',
  description: 'Your training and certification hub',
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  // Require authentication and academy portal access (handles all validation + redirects)
  await requirePortalAccess('academy');

  // Check if student has active enrollment
  const enrollmentResult = await getStudentEnrollmentStatus();
  const hasActiveEnrollment = enrollmentResult.success && enrollmentResult.data?.hasActiveEnrollment;

  // If no active enrollment, show demo page with callback request form
  if (!hasActiveEnrollment) {
    return <StudentDemoPage />;
  }

  // Student has active enrollment - show full dashboard
  return (
    <AcademyLayout showMentor>
      <AcademyPortal error={params.error} />
    </AcademyLayout>
  );
}
