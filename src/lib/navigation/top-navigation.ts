import {
  Briefcase, Building2, Users, Target, Handshake, LayoutDashboard,
  Search, Clock, Plus, Gauge, Settings, Bell, ListTodo,
  Calendar, CheckCircle, Package, TrendingUp, DollarSign,
  UserCheck, Send, Megaphone, Shield, Activity, UserCircle, Star,
  ClipboardList, UserPlus, Network, FileText
} from 'lucide-react'
import { EntityNavTab } from './entity-navigation.types'

// Order: My Work, Accounts, Jobs, Candidates, CRM, Pipeline, Administration
export const topNavigationTabs: EntityNavTab[] = [
  {
    id: 'workspace',
    label: 'My Work',
    entityType: 'job', // Not entity-specific, but needed for type
    icon: LayoutDashboard,
    defaultHref: '/employee/workspace/dashboard',
    dropdown: [
      { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, href: '/employee/workspace/dashboard', type: 'link' },
      { id: 'today', label: 'Today', icon: Calendar, href: '/employee/workspace/today', type: 'link' },
      { id: 'activities', label: 'My Activities', icon: Activity, href: '/employee/workspace/desktop?tab=activities', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'my-accounts', label: 'My Accounts', icon: Building2, href: '/employee/recruiting/accounts?owner=me', type: 'link' },
      { id: 'my-jobs', label: 'My Jobs', icon: Briefcase, href: '/employee/recruiting/jobs?assigned=me', type: 'link' },
      { id: 'my-submissions', label: 'My Submissions', icon: Send, href: '/employee/recruiting/submissions?owner=me', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'reports', label: 'Reports', icon: ListTodo, href: '/employee/workspace/reports', type: 'link' },
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
      { id: 'my-accounts', label: 'My Accounts', icon: Users, href: '/employee/recruiting/accounts?owner=me', type: 'link' },
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
      { id: 'my-contacts', label: 'My Contacts', icon: Users, href: '/employee/contacts?owner=me', type: 'link' },
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
      { id: 'search-jobs', label: 'Search Jobs', icon: Search, href: '/employee/recruiting/jobs', type: 'link' },
      { id: 'recent-jobs', label: 'Recent Jobs', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'my-jobs', label: 'My Assigned Jobs', icon: Users, href: '/employee/recruiting/jobs?assigned=me', type: 'link' },
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
      { id: 'search-candidates', label: 'Search Candidates', icon: Search, href: '/employee/recruiting/candidates', type: 'link' },
      { id: 'recent-candidates', label: 'Recent Candidates', type: 'recent' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'hotlist', label: 'Hotlist', icon: CheckCircle, href: '/employee/recruiting/hotlist', type: 'link' },
      { id: 'bench', label: 'Bench', icon: Package, href: '/employee/recruiting/candidates?status=bench', type: 'link' },
      { id: 'talent', label: 'Talent Pool', icon: UserCheck, href: '/employee/recruiting/talent', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-candidate', label: 'Add Candidate', icon: Plus, href: '/employee/recruiting/candidates/new', type: 'link' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    entityType: 'lead',
    icon: Target,
    defaultHref: '/employee/crm/leads',
    dropdown: [
      { id: 'leads', label: 'Leads', icon: Target, href: '/employee/crm/leads', type: 'link' },
      { id: 'deals', label: 'Deals Pipeline', icon: Handshake, href: '/employee/crm/deals', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'campaigns', label: 'Campaigns', icon: Megaphone, href: '/employee/crm/campaigns', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-lead', label: 'Create Lead', icon: Plus, href: '/employee/crm/leads/new', type: 'link' },
      { id: 'new-deal', label: 'Create Deal', icon: Plus, href: '/employee/crm/deals/new', type: 'link' },
    ],
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    entityType: 'submission',
    icon: TrendingUp,
    defaultHref: '/employee/recruiting/submissions',
    dropdown: [
      { id: 'submissions', label: 'All Submissions', icon: Send, href: '/employee/recruiting/submissions', type: 'link' },
      { id: 'interviews', label: 'Interviews', icon: Calendar, href: '/employee/recruiting/interviews', type: 'link' },
      { id: 'offers', label: 'Offers', icon: DollarSign, href: '/employee/recruiting/offers', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'placements', label: 'Placements', icon: CheckCircle, href: '/employee/recruiting/placements', type: 'link' },
      { id: 'timesheets', label: 'Timesheets', icon: Clock, href: '/employee/recruiting/timesheets', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'commissions', label: 'My Commissions', icon: DollarSign, href: '/employee/recruiting/commissions', type: 'link' },
    ],
  },
  {
    id: 'hr',
    label: 'HR',
    entityType: 'contact', // HR works with employees (contacts)
    icon: UserPlus,
    defaultHref: '/employee/hr/onboarding',
    dropdown: [
      { id: 'onboarding', label: 'Onboarding', icon: ClipboardList, href: '/employee/hr/onboarding', type: 'link' },
      { id: 'templates', label: 'Onboarding Templates', icon: FileText, href: '/employee/hr/onboarding/templates', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'employees', label: 'Employees', icon: Users, href: '/employee/hr/employees', type: 'link' },
      { id: 'pods', label: 'Pods & Teams', icon: Network, href: '/employee/hr/pods', type: 'link' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    entityType: 'job', // Not entity-specific
    icon: Settings,
    defaultHref: '/employee/admin/dashboard',
    dropdown: [
      { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, href: '/employee/admin/dashboard', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'users', label: 'Users', icon: Users, href: '/employee/admin/users', type: 'link' },
      { id: 'roles', label: 'Roles & Permissions', icon: Shield, href: '/employee/admin/roles', type: 'link' },
      { id: 'pods', label: 'Pods', icon: Package, href: '/employee/admin/pods', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'settings', label: 'Organization Settings', icon: Settings, href: '/employee/admin/org-settings', type: 'link' },
      { id: 'integrations', label: 'Integrations', icon: Package, href: '/employee/admin/integrations', type: 'link' },
      { id: 'audit', label: 'Audit Logs', icon: Activity, href: '/employee/admin/audit', type: 'link' },
    ],
  },
]

// Helper to get tab by ID
export function getNavTab(tabId: string): EntityNavTab | undefined {
  return topNavigationTabs.find(tab => tab.id === tabId)
}

// Helper to determine active tab from pathname
export function getActiveTabFromPath(pathname: string): string | null {
  if (pathname.includes('/employee/recruiting/jobs')) return 'jobs'
  if (pathname.includes('/employee/recruiting/accounts')) return 'accounts'
  if (pathname.includes('/employee/contacts')) return 'contacts'
  if (pathname.includes('/employee/recruiting/candidates') ||
      pathname.includes('/employee/recruiting/talent') ||
      pathname.includes('/employee/recruiting/hotlist')) return 'candidates'
  if (pathname.includes('/employee/recruiting/submissions') ||
      pathname.includes('/employee/recruiting/interviews') ||
      pathname.includes('/employee/recruiting/offers') ||
      pathname.includes('/employee/recruiting/placements') ||
      pathname.includes('/employee/recruiting/commissions')) return 'pipeline'
  if (pathname.includes('/employee/crm')) return 'crm'
  if (pathname.includes('/employee/workspace')) return 'workspace'
  if (pathname.includes('/employee/hr')) return 'hr'
  if (pathname.includes('/employee/admin')) return 'admin'
  return null
}
