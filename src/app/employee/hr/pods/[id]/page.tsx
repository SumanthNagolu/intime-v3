/**
 * Pod Detail Page
 *
 * Uses metadata-driven ScreenRenderer for individual pod/team UI.
 * Note: Pod detail screen needs to be created, currently redirects to list.
 * @see src/screens/hr/pod-list.screen.ts
 */

export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PodDetailPage({ params }: PageProps) {
  // Pod detail screen not yet implemented - redirect to pods list
  // TODO: Create pod-detail.screen.ts and update this page
  await params; // Consume the promise
  redirect('/employee/hr/pods');
}
