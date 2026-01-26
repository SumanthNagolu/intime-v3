import {
  Briefcase, Building2, Users, Target, Handshake, LayoutDashboard,
  Search, Clock, Plus, Gauge, Settings,
  Calendar, CheckCircle, Package, TrendingUp, DollarSign,
  UserCheck, Send, Megaphone, Activity, UserCircle, Star,
  UsersRound, Inbox, AlertTriangle, Award
} from 'lucide-react'
import { EntityNavTab } from './entity-navigation.types'

// Order: My Workspace, My Team Space, CRM, Accounts, Contacts, Jobs, Candidates
export const topNavigationTabs: EntityNavTab[] = [
  {
    id: 'workspace',
    label: 'My Workspace',
    entityType: 'job',
    icon: LayoutDashboard,
    defaultHref: '/employee/workspace',
    dropdown: [
      // Overview
      { id: 'my-dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/workspace', type: 'link' },
      { id: 'today', label: 'Today', icon: Calendar, href: '/employee/workspace/today', type: 'link' },
      { id: 'activities', label: 'My Activities', icon: Activity, href: '/employee/workspace/activities', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      // My Pipeline
      { id: 'my-submissions', label: 'My Submissions', icon: Send, href: '/employee/recruiting/submissions?owner=me', type: 'link' },
      { id: 'my-interviews', label: 'My Interviews', icon: Calendar, href: '/employee/recruiting/interviews?owner=me', type: 'link' },
      { id: 'my-offers', label: 'My Offers', icon: DollarSign, href: '/employee/recruiting/offers?owner=me', type: 'link' },
      { id: 'my-placements', label: 'My Placements', icon: Award, href: '/employee/recruiting/placements?owner=me', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      // My Entities
      { id: 'my-accounts', label: 'My Accounts', icon: Building2, href: '/employee/recruiting/accounts?owner=me', type: 'link' },
      { id: 'my-jobs', label: 'My Jobs', icon: Briefcase, href: '/employee/recruiting/jobs?assigned=me', type: 'link' },
      { id: 'my-candidates', label: 'My Candidates', icon: Users, href: '/employee/recruiting/candidates?owner=me', type: 'link' },
      { id: 'divider-3', label: '', type: 'divider' },
      // Tracking
      { id: 'my-commissions', label: 'My Commissions', icon: DollarSign, href: '/employee/recruiting/commissions', type: 'link' },
      { id: 'my-timesheets', label: 'My Timesheets', icon: Clock, href: '/employee/recruiting/timesheets?owner=me', type: 'link' },
    ],
  },
  {
    id: 'team',
    label: 'My Team Space',
    entityType: 'job',
    icon: UsersRound,
    defaultHref: '/employee/team',
    dropdown: [
      // Overview
      { id: 'team-dashboard', label: 'Team Dashboard', icon: UsersRound, href: '/employee/team', type: 'link' },
      { id: 'team-performance', label: 'Performance', icon: TrendingUp, href: '/employee/team/performance', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      // Team Pipeline
      { id: 'team-submissions', label: 'Team Submissions', icon: Send, href: '/employee/recruiting/submissions', type: 'link' },
      { id: 'team-interviews', label: 'Team Interviews', icon: Calendar, href: '/employee/recruiting/interviews', type: 'link' },
      { id: 'team-placements', label: 'Team Placements', icon: Award, href: '/employee/recruiting/placements', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      // Team Work
      { id: 'team-activities', label: 'Team Activities', icon: Activity, href: '/employee/team/activities', type: 'link' },
      { id: 'workqueue', label: 'Work Queue', icon: Inbox, href: '/employee/team/workqueue', type: 'link', badge: true },
      { id: 'escalated', label: 'Escalated', icon: AlertTriangle, href: '/employee/team/escalated', type: 'link' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    entityType: 'lead',
    icon: Target,
    defaultHref: '/employee/crm/leads',
    dropdown: [
      { id: 'campaigns', label: 'Campaigns', icon: Megaphone, href: '/employee/crm/campaigns', type: 'link' },
      { id: 'leads', label: 'Leads', icon: Target, href: '/employee/crm/leads', type: 'link' },
      { id: 'deals', label: 'Deals', icon: Handshake, href: '/employee/crm/deals', type: 'link' },
    ],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    entityType: 'account',
    icon: Building2,
    defaultHref: '/employee/recruiting/accounts',
    dropdown: [
      { id: 'search-accounts', label: 'Search Accounts', icon: Search, type: 'search', placeholder: 'Search by name...' },
      { id: 'recent-accounts', label: 'Recent Accounts', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'all-accounts', label: 'All Accounts', icon: Building2, href: '/employee/recruiting/accounts', type: 'link' },
      { id: 'active-accounts', label: 'Active Accounts', icon: CheckCircle, href: '/employee/recruiting/accounts?status=active', type: 'link' },
      { id: 'account-health', label: 'Account Health', icon: Gauge, href: '/employee/recruiting/accounts/health', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-account', label: 'Create Account', icon: Plus, href: '/employee/recruiting/accounts/new', type: 'link' },
    ],
  },
  {
    id: 'contacts',
    label: 'Contacts',
    entityType: 'contact',
    icon: UserCircle,
    defaultHref: '/employee/contacts',
    dropdown: [
      { id: 'search-contacts', label: 'Search Contacts', icon: Search, type: 'search', placeholder: 'Search by name...' },
      { id: 'recent-contacts', label: 'Recent Contacts', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'all-contacts', label: 'All Contacts', icon: UserCircle, href: '/employee/contacts', type: 'link' },
      { id: 'key-contacts', label: 'Key Contacts', icon: Star, href: '/employee/contacts?type=key', type: 'link' },
      { id: 'recent-activity', label: 'Recent Activity', icon: Activity, href: '/employee/contacts?activity=recent', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-contact', label: 'Create Contact', icon: Plus, href: '/employee/contacts/new', type: 'link' },
    ],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    entityType: 'job',
    icon: Briefcase,
    defaultHref: '/employee/recruiting/jobs',
    dropdown: [
      { id: 'search-jobs', label: 'Search Jobs', icon: Search, type: 'search', placeholder: 'Search by title...' },
      { id: 'recent-jobs', label: 'Recent Jobs', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'all-jobs', label: 'All Jobs', icon: Briefcase, href: '/employee/recruiting/jobs', type: 'link' },
      { id: 'active-jobs', label: 'Active Jobs', icon: CheckCircle, href: '/employee/recruiting/jobs?status=active', type: 'link' },
      { id: 'urgent-jobs', label: 'Urgent Jobs', icon: Clock, href: '/employee/recruiting/jobs?priority=urgent', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-job', label: 'Create Job', icon: Plus, href: '/employee/recruiting/jobs/new', type: 'link' },
    ],
  },
  {
    id: 'candidates',
    label: 'Candidates',
    entityType: 'candidate',
    icon: Users,
    defaultHref: '/employee/recruiting/candidates',
    dropdown: [
      { id: 'search-candidates', label: 'Search Candidates', icon: Search, type: 'search', placeholder: 'Search by name...' },
      { id: 'recent-candidates', label: 'Recent Candidates', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'all-candidates', label: 'All Candidates', icon: Users, href: '/employee/recruiting/candidates', type: 'link' },
      { id: 'hotlist', label: 'Hotlist', icon: CheckCircle, href: '/employee/recruiting/hotlist', type: 'link' },
      { id: 'bench', label: 'Bench', icon: Package, href: '/employee/recruiting/candidates?status=bench', type: 'link' },
      { id: 'talent', label: 'Talent Pool', icon: UserCheck, href: '/employee/recruiting/talent', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-candidate', label: 'Add Candidate', icon: Plus, href: '/employee/recruiting/candidates/new', type: 'link' },
    ],
  },
]

// Helper to get tab by ID
export function getNavTab(tabId: string): EntityNavTab | undefined {
  return topNavigationTabs.find(tab => tab.id === tabId)
}

// Helper to determine active tab from pathname
export function getActiveTabFromPath(pathname: string): string | null {
  // Workspace paths
  if (pathname.includes('/employee/workspace')) return 'workspace'

  // Team paths
  if (pathname.includes('/employee/team')) return 'team'

  // CRM paths
  if (pathname.includes('/employee/crm')) return 'crm'

  // Entity paths - more specific first
  if (pathname.includes('/employee/recruiting/accounts')) return 'accounts'
  if (pathname.includes('/employee/contacts')) return 'contacts'
  if (pathname.includes('/employee/recruiting/jobs')) return 'jobs'
  if (pathname.includes('/employee/recruiting/candidates') ||
      pathname.includes('/employee/recruiting/talent') ||
      pathname.includes('/employee/recruiting/hotlist')) return 'candidates'

  // Pipeline paths - map to workspace (user's pipeline) or team
  if (pathname.includes('/employee/recruiting/submissions') ||
      pathname.includes('/employee/recruiting/interviews') ||
      pathname.includes('/employee/recruiting/offers') ||
      pathname.includes('/employee/recruiting/placements') ||
      pathname.includes('/employee/recruiting/commissions') ||
      pathname.includes('/employee/recruiting/timesheets')) {
    // Check if it's filtered by owner=me, otherwise default to workspace
    return 'workspace'
  }

  return null
}
