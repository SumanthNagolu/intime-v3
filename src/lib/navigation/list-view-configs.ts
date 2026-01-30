import {
  LucideIcon,
  List,
  Home,
  LayoutDashboard,
  Clock,
  Activity,
  Building2,
  Briefcase,
  Send,
  FileBarChart,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Contact,
  User,
  Star,
  Inbox,
  TrendingUp,
  Flame,
  UserCheck,
  FileText,
  FilePen,
  CalendarClock,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  PlayCircle,
  StopCircle,
} from 'lucide-react'
import { EntityType } from './entity-navigation.types'
import { ListViewSidebarConfig } from './list-view-sidebar.types'

/**
 * Unified List View Sidebar Configurations
 *
 * These configs are used by:
 * 1. SectionSidebar.tsx - Left sidebar on list pages
 * 2. top-navigation.ts - Dropdown menus in top nav
 *
 * Structure for each entity:
 * - VIEWS: Always visible, max 3 items (All, My, Key filter)
 * - STATUS/STAGE: Collapsible, entity-specific workflow states
 * - RECENT: Grouped by time (Today, Yesterday, Earlier)
 */
export const listViewSidebarConfigs: Record<string, ListViewSidebarConfig> = {
  // =============================================================================
  // JOBS
  // =============================================================================
  jobs: {
    id: 'jobs',
    title: 'Jobs',
    icon: Briefcase,
    entityType: 'job',
    basePath: '/employee/recruiting/jobs',
    createPath: '/employee/recruiting/jobs/new',
    createLabel: 'New Job',
    searchPlaceholder: 'Search by title...',
    showWorkspaceToggle: true,
    views: [
      { id: 'all', label: 'All Jobs', icon: Briefcase, href: '/employee/recruiting/jobs' },
      { id: 'my-jobs', label: 'My Jobs', icon: User, href: '/employee/recruiting/jobs?assigned=me' },
      { id: 'urgent', label: 'Urgent Jobs', icon: Flame, href: '/employee/recruiting/jobs?priority=urgent' },
    ],
    statusSection: {
      label: 'Status',
      defaultOpen: true,
      items: [
        { id: 'open', label: 'Open', icon: Inbox, href: '/employee/recruiting/jobs?status=open' },
        { id: 'on_hold', label: 'On Hold', icon: Pause, href: '/employee/recruiting/jobs?status=on_hold' },
        { id: 'filled', label: 'Filled', icon: CheckCircle, href: '/employee/recruiting/jobs?status=filled' },
        { id: 'closed', label: 'Closed', icon: XCircle, href: '/employee/recruiting/jobs?status=closed' },
      ],
    },
  },

  // =============================================================================
  // CANDIDATES
  // =============================================================================
  candidates: {
    id: 'candidates',
    title: 'Candidates',
    icon: Users,
    entityType: 'candidate',
    basePath: '/employee/recruiting/candidates',
    createPath: '/employee/recruiting/candidates/new',
    createLabel: 'Add Candidate',
    searchPlaceholder: 'Search by name...',
    showWorkspaceToggle: true,
    views: [
      { id: 'all', label: 'All Candidates', icon: Users, href: '/employee/recruiting/candidates' },
      { id: 'my-candidates', label: 'My Candidates', icon: User, href: '/employee/recruiting/candidates?owner=me' },
      { id: 'hotlist', label: 'Hotlist', icon: Star, href: '/employee/recruiting/hotlist' },
    ],
    // No status section for candidates - they have availability status inline
  },

  // =============================================================================
  // ACCOUNTS
  // =============================================================================
  accounts: {
    id: 'accounts',
    title: 'Accounts',
    icon: Building2,
    entityType: 'account',
    basePath: '/employee/recruiting/accounts',
    createPath: '/employee/recruiting/accounts/new',
    createLabel: 'Create Account',
    searchPlaceholder: 'Search by name...',
    showWorkspaceToggle: true,
    views: [
      { id: 'all', label: 'All Accounts', icon: Building2, href: '/employee/recruiting/accounts' },
      { id: 'my-accounts', label: 'My Accounts', icon: User, href: '/employee/recruiting/accounts?owner=me' },
      { id: 'active', label: 'Active Accounts', icon: CheckCircle, href: '/employee/recruiting/accounts?status=active' },
    ],
    // No status section for accounts - use filters in list page
  },

  // =============================================================================
  // CONTACTS
  // =============================================================================
  contacts: {
    id: 'contacts',
    title: 'Contacts',
    icon: Contact,
    entityType: 'contact',
    basePath: '/employee/contacts',
    createPath: '/employee/contacts/new',
    createLabel: 'Create Contact',
    searchPlaceholder: 'Search by name...',
    showWorkspaceToggle: true,
    views: [
      { id: 'all', label: 'All Contacts', icon: Contact, href: '/employee/contacts' },
      { id: 'my-contacts', label: 'My Contacts', icon: User, href: '/employee/contacts?owner=me' },
      { id: 'key-contacts', label: 'Key Contacts', icon: Star, href: '/employee/contacts?type=key' },
    ],
    // No status section for contacts
  },

  // =============================================================================
  // LEADS (CRM)
  // =============================================================================
  leads: {
    id: 'leads',
    title: 'Leads',
    icon: TrendingUp,
    entityType: 'lead',
    basePath: '/employee/crm/leads',
    createPath: '/employee/crm/leads/new',
    createLabel: 'Create Lead',
    searchPlaceholder: 'Search by name...',
    showWorkspaceToggle: true,
    views: [
      { id: 'all', label: 'All Leads', icon: TrendingUp, href: '/employee/crm/leads' },
      { id: 'my-leads', label: 'My Leads', icon: User, href: '/employee/crm/leads?owner=me' },
      { id: 'hot', label: 'Hot Leads', icon: Flame, href: '/employee/crm/leads?temperature=hot' },
    ],
    statusSection: {
      label: 'Status',
      defaultOpen: true,
      items: [
        { id: 'new', label: 'New', icon: Sparkles, href: '/employee/crm/leads?status=new' },
        { id: 'contacted', label: 'Contacted', icon: Phone, href: '/employee/crm/leads?status=contacted' },
        { id: 'qualified', label: 'Qualified', icon: ThumbsUp, href: '/employee/crm/leads?status=qualified' },
        { id: 'nurture', label: 'Nurture', icon: MessageSquare, href: '/employee/crm/leads?status=nurture' },
        { id: 'converted', label: 'Converted', icon: CheckCircle, href: '/employee/crm/leads?status=converted' },
      ],
    },
  },

  // =============================================================================
  // DEALS (CRM)
  // =============================================================================
  deals: {
    id: 'deals',
    title: 'Deals',
    icon: FileText,
    entityType: 'deal',
    basePath: '/employee/crm/deals',
    createPath: '/employee/crm/deals/new',
    createLabel: 'Create Deal',
    searchPlaceholder: 'Search by name...',
    showWorkspaceToggle: true,
    views: [
      { id: 'all', label: 'All Deals', icon: FileText, href: '/employee/crm/deals' },
      { id: 'my-deals', label: 'My Deals', icon: User, href: '/employee/crm/deals?owner=me' },
      { id: 'open', label: 'Open Deals', icon: Inbox, href: '/employee/crm/deals?status=open' },
    ],
    statusSection: {
      label: 'Stage',
      defaultOpen: true,
      items: [
        { id: 'discovery', label: 'Discovery', icon: Sparkles, href: '/employee/crm/deals?stage=discovery' },
        { id: 'qualification', label: 'Qualification', icon: ThumbsUp, href: '/employee/crm/deals?stage=qualification' },
        { id: 'proposal', label: 'Proposal', icon: FileText, href: '/employee/crm/deals?stage=proposal' },
        { id: 'negotiation', label: 'Negotiation', icon: MessageSquare, href: '/employee/crm/deals?stage=negotiation' },
        { id: 'closed_won', label: 'Closed Won', icon: CheckCircle, href: '/employee/crm/deals?stage=closed_won' },
      ],
    },
  },

  // =============================================================================
  // CAMPAIGNS (CRM)
  // =============================================================================
  campaigns: {
    id: 'campaigns',
    title: 'Campaigns',
    icon: Send,
    entityType: 'campaign',
    basePath: '/employee/crm/campaigns',
    createPath: '/employee/crm/campaigns/new',
    createLabel: 'Create Campaign',
    searchPlaceholder: 'Search by name...',
    showWorkspaceToggle: true,
    views: [
      { id: 'all', label: 'All Campaigns', icon: Send, href: '/employee/crm/campaigns' },
      { id: 'my-campaigns', label: 'My Campaigns', icon: User, href: '/employee/crm/campaigns?owner=me' },
      { id: 'active', label: 'Active', icon: Activity, href: '/employee/crm/campaigns?status=active' },
    ],
    statusSection: {
      label: 'Status',
      defaultOpen: true,
      items: [
        { id: 'scheduled', label: 'Scheduled', icon: CalendarClock, href: '/employee/crm/campaigns?status=scheduled' },
        { id: 'active', label: 'Active', icon: Activity, href: '/employee/crm/campaigns?status=active' },
        { id: 'paused', label: 'Paused', icon: Pause, href: '/employee/crm/campaigns?status=paused' },
        { id: 'completed', label: 'Completed', icon: CheckCircle, href: '/employee/crm/campaigns?status=completed' },
      ],
    },
  },

  // =============================================================================
  // PLACEMENTS
  // =============================================================================
  placements: {
    id: 'placements',
    title: 'Placements',
    icon: UserCheck,
    entityType: 'placement',
    basePath: '/employee/recruiting/placements',
    createPath: '/employee/recruiting/placements/new',
    createLabel: 'Create Placement',
    searchPlaceholder: 'Search by name...',
    showWorkspaceToggle: true,
    views: [
      { id: 'all', label: 'All Placements', icon: UserCheck, href: '/employee/recruiting/placements' },
      { id: 'my-placements', label: 'My Placements', icon: User, href: '/employee/recruiting/placements?owner=me' },
      { id: 'active', label: 'Active', icon: Activity, href: '/employee/recruiting/placements?status=active' },
    ],
    statusSection: {
      label: 'Status',
      defaultOpen: true,
      items: [
        { id: 'pending_start', label: 'Pending Start', icon: Clock, href: '/employee/recruiting/placements?status=pending_start' },
        { id: 'active', label: 'Active', icon: PlayCircle, href: '/employee/recruiting/placements?status=active' },
        { id: 'extended', label: 'Extended', icon: CalendarClock, href: '/employee/recruiting/placements?status=extended' },
        { id: 'on_hold', label: 'On Hold', icon: Pause, href: '/employee/recruiting/placements?status=on_hold' },
        { id: 'completed', label: 'Completed', icon: StopCircle, href: '/employee/recruiting/placements?status=completed' },
      ],
    },
  },

  // =============================================================================
  // WORKSPACE (non-entity section)
  // =============================================================================
  workspace: {
    id: 'workspace',
    title: 'My Workspace',
    icon: Home,
    basePath: '/employee/workspace',
    showWorkspaceToggle: true,
    views: [],
    navLinks: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/workspace' },
      { id: 'today', label: 'Today', icon: Clock, href: '/employee/workspace/today' },
      { id: 'activities', label: 'My Activities', icon: Activity, href: '/employee/workspace/activities' },
      { id: 'accounts', label: 'My Accounts', icon: Building2, href: '/employee/workspace/accounts' },
      { id: 'jobs', label: 'My Jobs', icon: Briefcase, href: '/employee/workspace/jobs' },
      { id: 'submissions', label: 'My Submissions', icon: Send, href: '/employee/workspace/submissions' },
      { id: 'reports', label: 'Reports', icon: FileBarChart, href: '/employee/workspace/reports' },
    ],
  },

  // =============================================================================
  // TEAM WORKSPACE (non-entity section)
  // =============================================================================
  team: {
    id: 'team',
    title: 'Team Workspace',
    icon: Users,
    basePath: '/employee/team',
    showWorkspaceToggle: true,
    views: [],
    navLinks: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/team' },
      { id: 'today', label: 'Today', icon: Clock, href: '/employee/team/today' },
      { id: 'activities', label: 'Activities', icon: Activity, href: '/employee/team/activities' },
      { id: 'accounts', label: 'Accounts', icon: Building2, href: '/employee/team/accounts' },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/employee/team/jobs' },
      { id: 'submissions', label: 'Submissions', icon: Send, href: '/employee/team/submissions' },
      { id: 'reports', label: 'Reports', icon: FileBarChart, href: '/employee/team/reports' },
    ],
  },

  // =============================================================================
  // ACADEMY (non-entity section)
  // =============================================================================
  academy: {
    id: 'academy',
    title: 'Academy Admin',
    icon: GraduationCap,
    basePath: '/employee/academy',
    showWorkspaceToggle: false,
    views: [],
    navLinks: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/academy/dashboard' },
      { id: 'courses', label: 'Courses', icon: BookOpen, href: '/employee/academy/courses' },
      { id: 'students', label: 'Students', icon: Users, href: '/employee/academy/students' },
      { id: 'cohorts', label: 'Cohorts', icon: GraduationCap, href: '/employee/academy/cohorts' },
      { id: 'certificates', label: 'Certificates', icon: Award, href: '/employee/academy/certificates' },
    ],
  },
}

// Legacy export for backwards compatibility
export const sectionConfigs = listViewSidebarConfigs
