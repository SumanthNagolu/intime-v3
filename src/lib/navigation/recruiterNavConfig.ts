import {
  LayoutDashboard,
  Users,
  Briefcase,
  Send,
  Calendar,
  Building2,
  Target,
  ClipboardList,
  FileBarChart,
  Settings,
  UserCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Megaphone,
  Warehouse,
  UserCheck,
  FileText,
  Star,
} from 'lucide-react'
import type { SidebarSection } from '@/components/navigation/Sidebar'

export const recruiterNavSections: SidebarSection[] = [
  {
    title: 'Workspace',
    items: [
      {
        label: 'My Dashboard',
        href: '/employee/workspace/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Today',
        href: '/employee/workspace/today',
        icon: Clock,
      },
      {
        label: 'Reports',
        href: '/employee/workspace/reports',
        icon: FileBarChart,
      },
    ],
  },
  {
    title: 'Recruiting',
    items: [
      {
        label: 'Jobs',
        href: '/employee/recruiting/jobs',
        icon: Briefcase,
      },
      {
        label: 'Talent',
        href: '/employee/recruiting/talent',
        icon: UserCheck,
      },
      {
        label: 'Candidates',
        href: '/employee/recruiting/candidates',
        icon: Users,
      },
      {
        label: 'Submissions',
        href: '/employee/recruiting/submissions',
        icon: Send,
      },
      {
        label: 'Interviews',
        href: '/employee/recruiting/interviews',
        icon: Calendar,
      },
      {
        label: 'Placements',
        href: '/employee/recruiting/placements',
        icon: TrendingUp,
      },
      {
        label: 'My Commissions',
        href: '/employee/recruiting/commissions',
        icon: DollarSign,
      },
    ],
  },
  {
    title: 'CRM',
    items: [
      {
        label: 'Campaigns',
        href: '/employee/crm/campaigns',
        icon: Megaphone,
      },
      {
        label: 'Accounts',
        href: '/employee/recruiting/accounts',
        icon: Building2,
      },
      {
        label: 'Vendors',
        href: '/employee/recruiting/vendors',
        icon: Warehouse,
      },
      {
        label: 'Job Orders',
        href: '/employee/recruiting/job-orders',
        icon: FileText,
      },
      {
        label: 'Talent Hotlists',
        href: '/employee/recruiting/talent-hotlists',
        icon: Star,
      },
      {
        label: 'Leads',
        href: '/employee/crm/leads',
        icon: Target,
      },
      {
        label: 'Deals',
        href: '/employee/crm/deals',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        label: 'Profile',
        href: '/employee/settings/profile',
        icon: UserCircle,
      },
      {
        label: 'Preferences',
        href: '/employee/settings/preferences',
        icon: Settings,
      },
    ],
  },
]
