import { redirect } from 'next/navigation'

/**
 * Unsaved Work Page - DEPRECATED
 * 
 * This page has been replaced by the Drafts tab in My Workspace Desktop.
 * Redirecting to maintain backwards compatibility with any existing links.
 */
export default function UnsavedWorkPage() {
  redirect('/employee/workspace/desktop?tab=drafts')
}
