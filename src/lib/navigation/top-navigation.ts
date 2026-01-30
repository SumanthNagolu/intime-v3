import {
  Briefcase, Building2, Users, Target, Handshake, LayoutDashboard,
  Search, Clock, Plus, Gauge, Settings,
  Calendar, CheckCircle, Package, TrendingUp, DollarSign,
  UserCheck, Send, Megaphone, Activity, UserCircle, Star,
  UsersRound, Inbox, AlertTriangle, Award,
  Shield, Network, Workflow, FileText, Bell, Database, Key, Flag, Timer,
  ClipboardList, Receipt, Wallet, UserPlus,
  LayoutGrid, ListTodo, Rocket, History, BarChart3, User, Kanban, Flame
} from 'lucide-react'
import { EntityNavTab, EntityNavDropdownItem } from './entity-navigation.types'
import { listViewSidebarConfigs } from './list-view-configs'
import { moduleConfigs } from './module-configs'

// =============================================================================
// HELPER: Generate dropdown items from entity sidebar config
// =============================================================================
function generateEntityDropdown(sidebarConfigKey: string): EntityNavDropdownItem[] {
  const config = listViewSidebarConfigs[sidebarConfigKey]
  if (!config) return []

  const items: EntityNavDropdownItem[] = []

  // 1. Search box
  items.push({
    id: `search-${config.id}`,
    label: `Search ${config.title}`,
    icon: Search,
    type: 'search',
    placeholder: config.searchPlaceholder || 'Search...',
  })

  // 2. Divider after search
  items.push({ id: 'divider-1', label: '', type: 'divider' })

  // 3. Views (matching sidebar exactly)
  config.views.forEach((view) => {
    items.push({
      id: view.id,
      label: view.label.toUpperCase(),
      icon: view.icon,
      href: view.href,
      type: 'link',
    })
  })

  // 4. Divider before create
  items.push({ id: 'divider-2', label: '', type: 'divider' })

  // 5. Create action
  if (config.createPath) {
    items.push({
      id: `create-${config.id}`,
      label: config.createLabel?.toUpperCase() || `CREATE ${config.title.toUpperCase()}`,
      icon: Plus,
      href: config.createPath,
      type: 'link',
    })
  }

  return items
}

// =============================================================================
// HELPER: Generate dropdown items from module config
// =============================================================================
function generateModuleDropdown(moduleKey: string): EntityNavDropdownItem[] {
  const config = moduleConfigs[moduleKey]
  if (!config) return []

  const items: EntityNavDropdownItem[] = []

  // Track quickLink IDs to avoid duplicates in sections
  const quickLinkIds = new Set(config.quickLinks.map(link => link.id))

  // 1. Quick Links (top items shown prominently)
  config.quickLinks.forEach((link) => {
    items.push({
      id: link.id,
      label: link.label.toUpperCase(),
      icon: link.icon,
      href: link.href,
      type: 'link',
    })
  })

  // 2. Divider after quick links
  items.push({ id: 'divider-ql', label: '', type: 'divider' })

  // 3. Key sections (first 4 sections, flattened) - skip items already in quickLinks
  const visibleSections = config.sections.filter(s => s.defaultOpen !== false).slice(0, 4)
  visibleSections.forEach((section, sectionIndex) => {
    // Filter out items that are already in quickLinks
    const uniqueItems = section.items.filter(item => !quickLinkIds.has(item.id))

    // Skip section entirely if no unique items
    if (uniqueItems.length === 0) return

    // Section header
    items.push({
      id: `header-${section.id}`,
      label: section.label.toUpperCase(),
      type: 'header',
    })

    // Section items (max 4 per section to keep dropdown manageable)
    uniqueItems.slice(0, 4).forEach((item) => {
      items.push({
        id: item.id,
        label: item.label.toUpperCase(),
        icon: item.icon,
        href: item.href,
        type: 'link',
      })
    })

    // Divider between sections (not after last)
    if (sectionIndex < visibleSections.length - 1) {
      items.push({ id: `divider-${section.id}`, label: '', type: 'divider' })
    }
  })

  // 4. Actions at bottom
  if (config.actions && config.actions.length > 0) {
    items.push({ id: 'divider-actions', label: '', type: 'divider' })
    config.actions.forEach((action) => {
      items.push({
        id: action.id,
        label: action.label.toUpperCase(),
        icon: action.icon,
        href: action.href,
        type: 'link',
      })
    })
  }

  return items
}

// =============================================================================
// UNIFIED WORKSPACE DROPDOWN ITEMS
// Simple 3-option dropdown: My Space, Team Space, Scrum
// =============================================================================
export const workspaceDropdownItems: EntityNavDropdownItem[] = [
  { id: 'ws-my-space', label: 'MY SPACE', icon: User, href: '/employee/workspace', type: 'link' },
  { id: 'ws-team-space', label: 'TEAM SPACE', icon: UsersRound, href: '/employee/team', type: 'link' },
  { id: 'divider-1', label: '', type: 'divider' },
  { id: 'ws-scrum', label: 'SCRUM BOARD', icon: Kanban, href: '/employee/scrum', type: 'link' },
]

// Legacy exports for backwards compatibility
export const mySpaceDropdownItems = workspaceDropdownItems
export const teamSpaceDropdownItems = workspaceDropdownItems

// =============================================================================
// TOP NAVIGATION TABS
// Order: Workspaces, CRM, Accounts, Contacts, Jobs, Candidates, HR, Finance, Admin
// =============================================================================
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
  // =============================================================================
  // CRM - Campaigns, Leads, Deals
  // =============================================================================
  {
    id: 'crm',
    label: 'CRM',
    entityType: 'lead',
    icon: Target,
    defaultHref: '/employee/crm/leads',
    dropdown: [
      { id: 'campaigns', label: 'CAMPAIGNS', icon: Megaphone, href: '/employee/crm/campaigns', type: 'link' },
      { id: 'leads', label: 'LEADS', icon: Target, href: '/employee/crm/leads', type: 'link' },
      { id: 'deals', label: 'DEALS', icon: Handshake, href: '/employee/crm/deals', type: 'link' },
    ],
  },
  // =============================================================================
  // ACCOUNTS - Uses sidebar config
  // =============================================================================
  {
    id: 'accounts',
    label: 'Accounts',
    entityType: 'account',
    icon: Building2,
    defaultHref: '/employee/recruiting/accounts',
    dropdown: generateEntityDropdown('accounts'),
  },
  // =============================================================================
  // CONTACTS - Uses sidebar config
  // =============================================================================
  {
    id: 'contacts',
    label: 'Contacts',
    entityType: 'contact',
    icon: UserCircle,
    defaultHref: '/employee/contacts',
    dropdown: generateEntityDropdown('contacts'),
  },
  // =============================================================================
  // JOBS - Uses sidebar config
  // =============================================================================
  {
    id: 'jobs',
    label: 'Jobs',
    entityType: 'job',
    icon: Briefcase,
    defaultHref: '/employee/recruiting/jobs',
    dropdown: generateEntityDropdown('jobs'),
  },
  // =============================================================================
  // CANDIDATES - Uses sidebar config
  // =============================================================================
  {
    id: 'candidates',
    label: 'Candidates',
    entityType: 'candidate',
    icon: Users,
    defaultHref: '/employee/recruiting/candidates',
    dropdown: generateEntityDropdown('candidates'),
  },
  // =============================================================================
  // OPERATIONS - Merged HR + Finance
  // =============================================================================
  {
    id: 'operations',
    label: 'Operations',
    entityType: 'contact',  // Employees are a type of contact
    icon: Settings,
    defaultHref: '/employee/operations/employees',
    dropdown: generateModuleDropdown('operations'),
  },
  // =============================================================================
  // ADMIN - Uses module config
  // =============================================================================
  {
    id: 'admin',
    label: 'Admin',
    entityType: 'team',  // Admin manages teams/users
    icon: Settings,
    defaultHref: '/employee/admin/dashboard',
    dropdown: generateModuleDropdown('admin'),
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

  // Operations paths (merged HR + Finance)
  if (pathname.includes('/employee/operations')) return 'operations'

  // Legacy HR/Finance paths - map to operations
  if (pathname.includes('/employee/hr')) return 'operations'
  if (pathname.includes('/employee/finance')) return 'operations'

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
