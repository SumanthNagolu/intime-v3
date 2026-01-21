import {
  Users,
  Plus,
  Building2,
  GitBranch,
  MapPin,
  UserCog,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  Briefcase,
  Award,
  Activity,
  FileText,
  History,
  Shield,
  Settings,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig, ColumnConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type GroupType = 'root' | 'division' | 'branch' | 'team' | 'satellite_office' | 'producer'
export type TeamStatus = 'active' | 'inactive' | 'on_hold'

export interface Team extends Record<string, unknown> {
  id: string
  org_id: string
  name: string
  code: string | null
  description: string | null
  groupType: GroupType
  isActive: boolean
  // Hierarchy
  parentGroupId: string | null
  parentGroup: { id: string; name: string; groupType?: string } | null
  hierarchyLevel: number
  hierarchyPath: string | null
  // Leadership
  supervisorId: string | null
  supervisor: { id: string; fullName: string; email?: string | null; avatarUrl: string | null } | null
  managerId: string | null
  manager: { id: string; fullName: string; email?: string | null; avatarUrl: string | null } | null
  // Configuration
  securityZone: string | null
  loadFactor: number
  // Contact info
  phone: string | null
  fax: string | null
  email: string | null
  // Address
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  // Computed counts
  memberCount?: number
  activeJobsCount?: number
  activePlacementsCount?: number
  // Timestamps
  createdAt: string
  updatedAt: string | null
}

// ============================================
// STATUS CONFIGURATIONS
// ============================================

export const TEAM_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: XCircle,
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: AlertTriangle,
  },
}

export const GROUP_TYPE_CONFIG: Record<string, StatusConfig> = {
  root: {
    label: 'Root Organization',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Building2,
    description: 'Top-level organization',
  },
  division: {
    label: 'Division',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: GitBranch,
    description: 'Major business division',
  },
  branch: {
    label: 'Branch',
    color: 'bg-teal-100 text-teal-800',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    icon: MapPin,
    description: 'Regional branch office',
  },
  team: {
    label: 'Team',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Users,
    description: 'Working team',
  },
  satellite_office: {
    label: 'Satellite Office',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: MapPin,
    description: 'Remote satellite location',
  },
  producer: {
    label: 'Producer',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: UserCog,
    description: 'Individual producer/recruiter',
  },
}

// ============================================
// SECTION DEFINITIONS
// ============================================

export const TEAM_SECTIONS = [
  // Main sections
  { id: 'summary', label: 'Summary', icon: BarChart3, group: 'main', isOverview: true },
  { id: 'details', label: 'Details', icon: Settings, group: 'main' },
  { id: 'members', label: 'Members', icon: Users, group: 'main', showCount: true },
  { id: 'roles', label: 'Roles', icon: Shield, group: 'main' },
  { id: 'workload', label: 'Workload', icon: BarChart3, group: 'main' },
  { id: 'performance', label: 'Performance', icon: BarChart3, group: 'main' },
  // Related sections
  { id: 'accounts', label: 'Accounts', icon: Building2, group: 'related', showCount: true },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, group: 'related', showCount: true },
  // Tool sections
  { id: 'activities', label: 'Activities', icon: Activity, group: 'tools', showCount: true },
  { id: 'notes', label: 'Notes', icon: FileText, group: 'tools', showCount: true },
  { id: 'history', label: 'History', icon: History, group: 'tools' },
] as const

// ============================================
// LIST VIEW CONFIGURATION
// ============================================

/**
 * Teams List View - main teams/groups management page
 */
export const teamsListConfig: ListViewConfig<Team> = {
  entityType: 'team',
  entityName: { singular: 'Team', plural: 'Teams' },
  baseRoute: '/employee/settings/teams',

  title: 'Teams',
  description: 'Manage organizational teams and groups',
  icon: Users,

  primaryAction: {
    label: 'New Team',
    icon: Plus,
    href: '/employee/settings/teams/new',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Teams',
      icon: Users,
    },
    {
      key: 'byStatus.active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'byType.team',
      label: 'Teams',
      color: 'bg-blue-100 text-blue-800',
      icon: Users,
    },
    {
      key: 'byType.division',
      label: 'Divisions',
      color: 'bg-purple-100 text-purple-800',
      icon: GitBranch,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Teams',
      placeholder: 'Search by name or code...',
    },
    {
      key: 'groupType',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(GROUP_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'on_hold', label: 'On Hold' },
      ],
    },
    {
      key: 'parentGroupId',
      type: 'select',
      label: 'Parent',
      options: [
        { value: 'all', label: 'All Parents' },
      ],
      dynamic: true, // Options populated at runtime from groups.list
    },
  ],

  columns: [
    {
      key: 'name',
      header: 'Team Name',
      label: 'Team Name',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'code',
      header: 'Code',
      label: 'Code',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => value || '—',
    },
    {
      key: 'groupType',
      header: 'Type',
      label: 'Type',
      sortable: true,
      width: 'w-[120px]',
      render: (value) => {
        const config = GROUP_TYPE_CONFIG[value as string]
        return config?.label || (value as string)?.replace(/_/g, ' ') || '—'
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      label: 'Status',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => {
        const isActive = value as boolean
        const config = TEAM_STATUS_CONFIG[isActive ? 'active' : 'inactive']
        return config?.label || (isActive ? 'Active' : 'Inactive')
      },
    },
    {
      key: 'memberCount',
      header: 'Members',
      label: 'Members',
      sortable: true,
      width: 'w-[90px]',
      align: 'center' as const,
      render: (value) => value ?? '—',
    },
    {
      key: 'manager',
      header: 'Manager',
      label: 'Manager',
      width: 'w-[150px]',
      render: (value) => {
        const manager = value as Team['manager']
        return manager?.fullName || '—'
      },
    },
    {
      key: 'parentGroup',
      header: 'Parent',
      label: 'Parent',
      width: 'w-[150px]',
      render: (value) => {
        const parent = value as Team['parentGroup']
        return parent?.name || '—'
      },
    },
    {
      key: 'city',
      header: 'Location',
      label: 'Location',
      width: 'w-[140px]',
      render: (value, entity) => {
        const team = entity as Team
        if (team.city && team.state) {
          return `${team.city}, ${team.state}`
        }
        return team.city || team.state || '—'
      },
    },
    {
      key: 'loadFactor',
      header: 'Load',
      label: 'Load Factor',
      sortable: true,
      width: 'w-[80px]',
      align: 'center' as const,
      render: (value) => {
        const load = value as number
        const color = load > 80 ? 'text-red-600' : load > 60 ? 'text-amber-600' : 'text-green-600'
        return <span className={color}>{load}%</span>
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      label: 'Created',
      sortable: true,
      width: 'w-[100px]',
      format: 'relative-date' as const,
    },
  ] as ColumnConfig<Team>[],

  renderMode: 'table',
  statusField: 'isActive',
  statusConfig: TEAM_STATUS_CONFIG,
  pageSize: 50,

  emptyState: {
    icon: Users,
    title: 'No teams found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first team to start organizing your organization',
    action: {
      label: 'Create Team',
      href: '/employee/settings/teams/new',
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const groupTypeValue = filters.groupType as string | undefined
    const statusValue = filters.status as string | undefined
    const parentGroupIdValue = filters.parentGroupId as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validGroupTypes = ['root', 'division', 'branch', 'team', 'satellite_office', 'producer'] as const
    type GroupTypeFilter = (typeof validGroupTypes)[number]

    return trpc.groups.list.useQuery({
      search: filters.search as string | undefined,
      groupType: groupTypeValue && groupTypeValue !== 'all' && validGroupTypes.includes(groupTypeValue as GroupTypeFilter)
        ? groupTypeValue as GroupTypeFilter
        : undefined,
      isActive: statusValue === 'active' ? true : statusValue === 'inactive' ? false : undefined,
      parentGroupId: parentGroupIdValue && parentGroupIdValue !== 'all' ? parentGroupIdValue : undefined,
      page: filters.page as number || 1,
      pageSize: (filters.limit as number) || 50,
    })
  },

  useStatsQuery: () => {
    // Use list query to compute stats if no dedicated stats endpoint
    const query = trpc.groups.list.useQuery({ pageSize: 1000 })
    const items = query.data?.items || []

    // Flatten stats to match Record<string, number | string> type
    const stats: Record<string, number | string> = {
      total: items.length,
      'byStatus.active': items.filter(i => i.isActive).length,
      'byStatus.inactive': items.filter(i => !i.isActive).length,
      'byType.root': items.filter(i => i.groupType === 'root').length,
      'byType.division': items.filter(i => i.groupType === 'division').length,
      'byType.branch': items.filter(i => i.groupType === 'branch').length,
      'byType.team': items.filter(i => i.groupType === 'team').length,
      'byType.satellite_office': items.filter(i => i.groupType === 'satellite_office').length,
      'byType.producer': items.filter(i => i.groupType === 'producer').length,
    }

    return {
      data: stats,
      isLoading: query.isLoading,
    }
  },
}

// ============================================
// DETAIL VIEW CONFIGURATION
// ============================================

/**
 * Team Detail View configuration
 */
export const teamDetailConfig: DetailViewConfig<Team> = {
  entityType: 'team',
  baseRoute: '/employee/settings/teams',

  // Header fields
  titleField: 'name',
  statusField: 'isActive',
  statusConfig: TEAM_STATUS_CONFIG,

  // Navigation
  navigationMode: 'sections',
  defaultSection: 'summary',

  // Section definitions for sidebar navigation
  sections: TEAM_SECTIONS.map(s => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    showCount: 'showCount' in s ? s.showCount : undefined,
    description: s.group === 'tools' ? 'Tool section' : undefined,
  })),

  // Quick actions available from sidebar
  quickActions: [
    {
      id: 'add_member',
      label: 'Add Member',
      icon: Plus,
      variant: 'default',
      onClick: () => { /* handled by workspace */ },
    },
    {
      id: 'add_note',
      label: 'Add Note',
      icon: FileText,
      variant: 'outline',
      onClick: () => { /* handled by workspace */ },
    },
    {
      id: 'edit_settings',
      label: 'Edit Settings',
      icon: Settings,
      variant: 'outline',
      onClick: () => { /* handled by workspace */ },
    },
  ],

  // Data fetching
  useEntityQuery: (id: string, options?: { enabled?: boolean }) => {
    return trpc.groups.getById.useQuery(
      { id },
      { enabled: options?.enabled ?? true }
    )
  },
}

// ============================================
// WIZARD CONFIGURATION (for creation)
// ============================================

export const teamWizardConfig = {
  entityType: 'team',
  entityName: { singular: 'Team', plural: 'Teams' },
  baseRoute: '/employee/settings/teams/new',

  steps: [
    {
      id: 'identity',
      label: 'Identity',
      description: 'Team name and classification',
      icon: Users,
      fields: ['name', 'code', 'description', 'groupType', 'parentGroupId', 'securityZone'],
    },
    {
      id: 'location',
      label: 'Location',
      description: 'Address and regions',
      icon: MapPin,
      fields: ['addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country'],
    },
    {
      id: 'members',
      label: 'Members',
      description: 'Team members and roles',
      icon: UserCog,
      fields: ['managerId', 'supervisorId'],
    },
  ],

  // Draft creation
  createDraft: {
    defaultValues: {
      name: 'New Team (Draft)',
      groupType: 'team',
    },
  },

  // Final submission
  submitAction: {
    label: 'Create Team',
    successMessage: 'Team created successfully',
    redirectTo: (id: string) => `/employee/settings/teams/${id}`,
  },
}

// ============================================
// EXPORTS
// ============================================

export default {
  list: teamsListConfig,
  detail: teamDetailConfig,
  wizard: teamWizardConfig,
}
