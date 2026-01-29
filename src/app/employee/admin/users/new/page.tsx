'use client'

import { UserWorkspacePage } from '@/components/admin/users'

/**
 * New User Wizard Page
 *
 * Uses UserWorkspacePage with mode="create"
 * Data (empty template) is provided by layout via UserWorkspaceProvider
 *
 * URL patterns:
 * - /employee/admin/users/new           → Step 1 (basics)
 * - /employee/admin/users/new?step=access → Specific step
 */
export default function NewUserPage() {
  return <UserWorkspacePage modeOverride="create" />
}
