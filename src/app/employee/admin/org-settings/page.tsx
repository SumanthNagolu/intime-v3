import { redirect } from 'next/navigation'

/**
 * Redirect old org-settings route to the new Settings > Organization page.
 * This maintains backwards compatibility for any bookmarks or links.
 *
 * Note: The OrgSettingsPage component with rich functionality (Fiscal Year,
 * Business Hours, Defaults, Contact tabs) still exists but is not accessible
 * via the main navigation. These features should be migrated to the Settings
 * layout in a future iteration.
 */
export default function OrgSettingsRedirect() {
  redirect('/employee/admin/settings/organization')
}
