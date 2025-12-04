/**
 * Client Pipeline Page
 *
 * Redirects to the client submissions page which handles the pipeline view.
 * @see /client/submissions
 */

import { redirect } from 'next/navigation';

export default function ClientPipelinePage() {
  redirect('/client/submissions');
}
