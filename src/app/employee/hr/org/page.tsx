/**
 * Organization Page (Legacy Route)
 *
 * Redirects to the canonical org-chart route which uses ScreenRenderer.
 * @see src/app/employee/hr/org-chart/page.tsx
 * @see src/screens/hr/org-chart.screen.ts
 */

export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';

export default function OrgPage() {
  // Redirect to the canonical org-chart route
  redirect('/employee/hr/org-chart');
}
