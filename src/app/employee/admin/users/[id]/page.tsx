'use client'

import { UserWorkspacePage } from '@/components/admin/users'

/**
 * User Detail Page
 *
 * Uses UserWorkspacePage with mode="view"
 * Data is provided by layout via UserWorkspaceProvider
 *
 * URL patterns:
 * - /employee/admin/users/[id]           → View mode (default tab: basics)
 * - /employee/admin/users/[id]?tab=roles → View mode (specific tab)
 * - /employee/admin/users/[id]?edit=true → Edit mode
 */
export default function UserDetailPage() {
  return <UserWorkspacePage />
}
