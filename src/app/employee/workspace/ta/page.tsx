/**
 * TA Workspace Root
 *
 * Redirects to the TA Dashboard.
 */

import { redirect } from 'next/navigation';

export default function TAWorkspaceRoot() {
  redirect('/employee/workspace/ta/dashboard');
}
