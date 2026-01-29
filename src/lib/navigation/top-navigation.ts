import {
  Briefcase, Building2, Users, Target, Handshake, LayoutDashboard,
  Search, Clock, Plus, Gauge, Settings,
  Calendar, CheckCircle, Package, TrendingUp, DollarSign,
  UserCheck, Send, Megaphone, Activity, UserCircle, Star,
  UsersRound, Inbox, AlertTriangle, Award,
  Shield, Network, Workflow, FileText, Bell, Database, Key, Flag, Timer,
  ClipboardList, Receipt, Wallet, UserPlus,
  LayoutGrid, ListTodo, Rocket, History, BarChart3, User, Kanban
} from 'lucide-react'
import { EntityNavTab, EntityNavDropdownItem } from './entity-navigation.types'

// =============================================================================
// UNIFIED WORKSPACE DROPDOWN ITEMS
// Simple 3-option dropdown: My Space, Team Space, Scrum
// =============================================================================
export const workspaceDropdownItems: EntityNavDropdownItem[] = [
  { id: 'ws-my-space', label: 'My Space', icon: User, href: '/employee/workspace', type: 'link' },
  { id: 'ws-team-space', label: 'Team Space', icon: UsersRound, href: '/employee/team', type: 'link' },
  { id: 'divider-1', label: '', type: 'divider' },
  { id: 'ws-scrum', label: 'Scrum Board', icon: Kanban, href: '/employee/scrum', type: 'link' },
]

// Legacy exports for backwards compatibility
export const mySpaceDropdownItems = workspaceDropdownItems
export const teamSpaceDropdownItems = workspaceDropdownItems

// Order: Workspaces, CRM, Accounts, Contacts, Jobs, Candidates
export const topNavigationTabs: EntityNavTab[] = [
  // =============================================================================
  // WORKSPACES - My Workspace + Team Workspace (same sections, different data)
  // =============================================================================
  {
    id: 'workspaces',
    label: 'Workspaces',
    entityType: 'job',
    icon: LayoutGrid,
    defaultHref: '/employee/workspace',
    dropdown: workspaceDropdownItems,
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
      { id: 'my-candidates', label: 'My Candidates', icon: UserCheck, href: '/employee/recruiting/candidates?owner=me', type: 'link' },
      { id: 'hotlist', label: 'Hotlist', icon: Star, href: '/employee/recruiting/hotlist', type: 'link' },
      { id: 'bench', label: 'Bench', icon: Package, href: '/employee/recruiting/candidates?status=bench', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      { id: 'new-candidate', label: 'Add Candidate', icon: Plus, href: '/employee/recruiting/candidates/new', type: 'link' },
    ],
  },
  // ============================================================
  // HR Tab - Human Resources module
  // ============================================================
  {
    id: 'hr',
    label: 'HR',
    entityType: 'contact',  // Employees are a type of contact
    icon: Users,
    defaultHref: '/employee/hr/employees',
    dropdown: [
      { id: 'hr-employees', label: 'Employees', icon: Users, href: '/employee/hr/employees', type: 'link' },
      { id: 'hr-pods', label: 'Pods', icon: Network, href: '/employee/hr/pods', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'hr-onboarding', label: 'Onboarding', icon: UserPlus, href: '/employee/hr/onboarding', type: 'link' },
      { id: 'hr-onboarding-templates', label: 'Onboarding Templates', icon: ClipboardList, href: '/employee/hr/onboarding/templates', type: 'link' },
    ],
  },
  // ============================================================
  // Finance Tab - Finance module
  // ============================================================
  {
    id: 'finance',
    label: 'Finance',
    entityType: 'invoice',
    icon: DollarSign,
    defaultHref: '/employee/finance/invoices',
    dropdown: [
      { id: 'finance-invoices', label: 'Invoices', icon: Receipt, href: '/employee/finance/invoices', type: 'link' },
      { id: 'finance-payroll', label: 'Payroll', icon: Wallet, href: '/employee/finance/payroll', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      { id: 'new-invoice', label: 'Create Invoice', icon: Plus, href: '/employee/finance/invoices/new', type: 'link' },
      { id: 'new-payroll', label: 'Create Payroll', icon: Plus, href: '/employee/finance/payroll/new', type: 'link' },
    ],
  },
  // ============================================================
  // Admin Tab - Administration module
  // ============================================================
  {
    id: 'admin',
    label: 'Admin',
    entityType: 'team',  // Admin manages teams/users
    icon: Settings,
    defaultHref: '/employee/admin/dashboard',
    dropdown: [
      // Main
      { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/admin/dashboard', type: 'link' },
      { id: 'divider-1', label: '', type: 'divider' },
      // User Management
      { id: 'admin-users', label: 'Users', icon: Users, href: '/employee/admin/users', type: 'link' },
      { id: 'admin-pods', label: 'Pods', icon: Network, href: '/employee/admin/pods', type: 'link' },
      { id: 'admin-roles', label: 'Roles', icon: Shield, href: '/employee/admin/roles', type: 'link' },
      { id: 'admin-permissions', label: 'Permissions', icon: Shield, href: '/employee/admin/permissions', type: 'link' },
      { id: 'divider-2', label: '', type: 'divider' },
      // System
      { id: 'admin-settings', label: 'Settings', icon: Settings, href: '/employee/admin/settings', type: 'link' },
      { id: 'admin-integrations', label: 'Integrations', icon: Workflow, href: '/employee/admin/integrations', type: 'link' },
      { id: 'admin-workflows', label: 'Workflows', icon: Workflow, href: '/employee/admin/workflows', type: 'link' },
      { id: 'divider-3', label: '', type: 'divider' },
      // Monitoring
      { id: 'admin-audit', label: 'Audit Logs', icon: FileText, href: '/employee/admin/audit', type: 'link' },
      { id: 'admin-notifications', label: 'Notifications', icon: Bell, href: '/employee/admin/notifications', type: 'link' },
    ],
  },
]

// Helper to get tab by ID
export function getNavTab(tabId: string): EntityNavTab | undefined {
  return topNavigationTabs.find(tab => tab.id === tabId)
}

// Helper to determine active tab from pathname
export function getActiveTabFromPath(pathname: string): string | null {
  // Admin paths - check first (most specific)
  if (pathname.includes('/employee/admin')) return 'admin'

  // HR paths
  if (pathname.includes('/employee/hr')) return 'hr'

  // Finance paths
  if (pathname.includes('/employee/finance')) return 'finance'

  // Workspace paths (My Workspace and Team Workspace)
  if (pathname.includes('/employee/workspace')) return 'workspaces'
  if (pathname.includes('/employee/team')) return 'workspaces'

  // CRM paths
  if (pathname.includes('/employee/crm')) return 'crm'

  // Entity paths - more specific first
  if (pathname.includes('/employee/recruiting/accounts')) return 'accounts'
  if (pathname.includes('/employee/contacts')) return 'contacts'
  if (pathname.includes('/employee/recruiting/jobs')) return 'jobs'
  if (pathname.includes('/employee/recruiting/candidates') ||
      pathname.includes('/employee/recruiting/hotlist')) return 'candidates'

  // Pipeline paths - map to workspace
  if (pathname.includes('/employee/recruiting/submissions') ||
      pathname.includes('/employee/recruiting/interviews') ||
      pathname.includes('/employee/recruiting/offers') ||
      pathname.includes('/employee/recruiting/placements') ||
      pathname.includes('/employee/recruiting/commissions') ||
      pathname.includes('/employee/recruiting/timesheets')) {
    return 'workspaces'
  }

  return null
}
