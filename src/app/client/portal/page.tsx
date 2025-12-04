/**
 * Client Portal Page
 *
 * Redirects to the client dashboard for a unified entry point.
 * @see /client/dashboard
 */

import { redirect } from 'next/navigation';

export default function ClientPortalPage() {
  redirect('/client/dashboard');
}
