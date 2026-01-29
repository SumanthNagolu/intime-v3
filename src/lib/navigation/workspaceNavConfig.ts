import {
  LayoutDashboard,
  Users,
  Briefcase,
  Send,
  Calendar,
  Building2,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  FileBarChart,
  Inbox,
  AlertTriangle,
} from 'lucide-react'
import type { SidebarSection } from '@/components/navigation/Sidebar'

// =============================================================================
// WORKSPACE NAV SECTIONS
// Used by both "My Space" and "Team" views
// IMPORTANT: Both views share the SAME sections structure
// The only difference is:
// - Labels: "My X" vs "Team X" or just "X"
// - Query params: owner=me for personal, no filter for team
// - Team view adds "Assigned To" column in tables
// =============================================================================

/**
 * Creates workspace navigation sections
 * @param scope - 'my-space' for personal view, 'team' for team-wide view
 */
export function createWorkspaceNavSections(scope: 'my-space' | 'team'): SidebarSection[] {
  const isTeam = scope === 'team'
  const basePath = isTeam ? '/employee/team' : '/employee/workspace'

  // Query param for filtering - empty for team (shows all), ?owner=me for personal
  const ownerFilter = isTeam ? '' : '?owner=me'
  const assignedFilter = isTeam ? '' : '?assigned=me'

  return [
    {
      title: 'Workspace',
      items: [
        {
          label: 'Dashboard',
          href: isTeam ? '/employee/team' : '/employee/workspace',
          icon: LayoutDashboard,
        },
        {
          label: 'Today',
          href: `${basePath}/today`,
          icon: Clock,
        },
        {
          label: isTeam ? 'Activities' : 'My Activities',
          href: `${basePath}/activities`,
          icon: Activity,
        },
      ],
    },
    {
      title: 'Pipeline',
      items: [
        {
          label: isTeam ? 'Accounts' : 'My Accounts',
          href: `${basePath}/accounts`,
          icon: Building2,
        },
        {
          label: isTeam ? 'Jobs' : 'My Jobs',
          href: `${basePath}/jobs`,
          icon: Briefcase,
        },
        {
          label: isTeam ? 'Submissions' : 'My Submissions',
          href: `${basePath}/submissions`,
          icon: Send,
        },
      ],
    },
    {
      title: 'Reports',
      items: [
        {
          label: 'Reports',
          href: `${basePath}/reports`,
          icon: FileBarChart,
        },
      ],
    },
  ]
}

// Pre-built configurations for convenience
export const mySpaceNavSections = createWorkspaceNavSections('my-space')
export const teamNavSections = createWorkspaceNavSections('team')
