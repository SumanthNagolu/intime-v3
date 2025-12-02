/**
 * Training Coordination Root
 *
 * Redirects to Training Applications.
 */

import { redirect } from 'next/navigation';

export default function TrainingRoot() {
  redirect('/employee/workspace/ta/training/applications');
}
