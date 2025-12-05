import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Workflow,
  FileText,
  Bell,
  Flag,
  AlertTriangle,
  Database,
  Network,
  Key,
} from 'lucide-react'
import type { SidebarSection } from '@/components/navigation/Sidebar'

export const adminNavSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/employee/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        label: 'Users',
        href: '/employee/admin/users',
        icon: Users,
      },
      {
        label: 'Pods',
        href: '/employee/admin/pods',
        icon: Network,
      },
      {
        label: 'Roles',
        href: '/employee/admin/roles',
        icon: Shield,
      },
      {
        label: 'Permissions',
        href: '/employee/admin/permissions',
        icon: Shield,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Settings',
        href: '/employee/admin/settings',
        icon: Settings,
      },
      {
        label: 'Integrations',
        href: '/employee/admin/integrations',
        icon: Workflow,
      },
      {
        label: 'Workflows',
        href: '/employee/admin/workflows',
        icon: Workflow,
      },
      {
        label: 'Email Templates',
        href: '/employee/admin/email-templates',
        icon: FileText,
      },
      {
        label: 'API Tokens',
        href: '/employee/admin/api-tokens',
        icon: Key,
      },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      {
        label: 'Audit Logs',
        href: '/employee/admin/audit',
        icon: FileText,
      },
      {
        label: 'Notifications',
        href: '/employee/admin/notifications',
        icon: Bell,
      },
      {
        label: 'Feature Flags',
        href: '/employee/admin/feature-flags',
        icon: Flag,
      },
      {
        label: 'Data Management',
        href: '/employee/admin/data',
        icon: Database,
      },
      {
        label: 'Emergency',
        href: '/employee/admin/emergency',
        icon: AlertTriangle,
      },
    ],
  },
]
