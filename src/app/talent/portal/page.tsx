/**
 * Talent Portal Page
 *
 * Redirects to the talent dashboard for a unified entry point.
 * @see /talent/dashboard
 */

import { redirect } from 'next/navigation';

export default function TalentPortalPage() {
  redirect('/talent/dashboard');
}
