import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  FileText,
  Briefcase,
  Star,
  Activity,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Target,
  UserCheck,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
// PCF Section Adapters - import from separate file to avoid circular dependencies
import {
  AccountOverviewSectionPCF,
  AccountContactsSectionPCF,
  AccountJobsSectionPCF,
  AccountPlacementsSectionPCF,
  AccountDocumentsSectionPCF,
  AccountActivitiesSectionPCF,
  AccountMeetingsSectionPCF,
  AccountNotesSectionPCF,
  AccountEscalationsSectionPCF,
} from './sections/accounts.sections'

// Type definition for Account entity
export interface Account extends Record<string, unknown> {
  id: string
  name: string
  status: string
  industry?: string | null
  website?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  company_type?: string
  type?: string
  tier?: string | null
  description?: string | null
  nps_score?: number | null
  annual_revenue_target?: number | null
  last_contact_date?: string | null
  lastContactDate?: string | null
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  owner_id?: string
  jobsCount?: number
  jobs_count?: number
  contactsCount?: number
  contacts_count?: number
  placementsCount?: number
  placements_count?: number
  created_at: string
  createdAt?: string
  updated_at?: string
}

// Account status configuration
export const ACCOUNT_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  prospect: {
    label: 'Prospect',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: TrendingUp,
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: Minus,
  },
}

// Account tier configuration
export const ACCOUNT_TIER_CONFIG: Record<string, StatusConfig> = {
  strategic: {
    label: 'Strategic',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Star,
  },
  preferred: {
    label: 'Preferred',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  exclusive: {
    label: 'Exclusive',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
}

// Health status configuration
export const ACCOUNT_HEALTH_CONFIG: Record<string, StatusConfig> = {
  healthy: {
    label: 'Healthy',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: TrendingUp,
  },
  attention: {
    label: 'Needs Attention',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Minus,
  },
  at_risk: {
    label: 'At Risk',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: TrendingDown,
  },
}

// Account type configuration
export const ACCOUNT_TYPE_CONFIG: Record<string, StatusConfig> = {
  enterprise: {
    label: 'Enterprise',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  mid_market: {
    label: 'Mid-Market',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  smb: {
    label: 'SMB',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  startup: {
    label: 'Startup',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
}

// Industry options for filters
export const ACCOUNT_INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
]

// Accounts List View Configuration
export const accountsListConfig: ListViewConfig<Account> = {
  entityType: 'account',
  entityName: { singular: 'Account', plural: 'Accounts' },
  baseRoute: '/employee/recruiting/accounts',

  title: 'Accounts',
  description: 'Manage client accounts and relationships',
  icon: Building2,

  primaryAction: {
    label: 'New Account',
    icon: Plus,
    href: '/employee/recruiting/accounts/new',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Accounts',
      icon: Building2,
    },
    {
      key: 'activeClients',
      label: 'Active Clients',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'prospects',
      label: 'Prospects',
      color: 'bg-blue-100 text-blue-800',
      icon: Target,
    },
    {
      key: 'jobsThisQuarter',
      label: 'Jobs This Qtr',
      color: 'bg-purple-100 text-purple-800',
      icon: Briefcase,
    },
    {
      key: 'placementsYTD',
      label: 'Placements YTD',
      color: 'bg-gold-100 text-gold-800',
      icon: UserCheck,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Accounts',
      placeholder: 'Search by name or industry...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(ACCOUNT_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(ACCOUNT_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'industry',
      type: 'select',
      label: 'Industry',
      options: [
        { value: 'all', label: 'All Industries' },
        ...ACCOUNT_INDUSTRY_OPTIONS,
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      header: 'Company Name',
      label: 'Company Name',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'industry',
      header: 'Industry',
      label: 'Industry',
      sortable: true,
      width: 'w-[130px]',
    },
    {
      key: 'type',
      header: 'Type',
      label: 'Type',
      sortable: true,
      width: 'w-[100px]',
      render: (value, entity) => {
        const account = entity as Account
        const type = account.type || account.company_type
        return ACCOUNT_TYPE_CONFIG[type || '']?.label || type || '—'
      },
    },
    {
      key: 'status',
      header: 'Status',
      label: 'Status',
      sortable: true,
      width: 'w-[100px]',
      format: 'status' as const,
    },
    {
      key: 'location',
      header: 'Location',
      label: 'Location',
      width: 'w-[140px]',
      render: (value, entity) => {
        const account = entity as Account
        if (account.city && account.state) {
          return `${account.city}, ${account.state}`
        }
        return account.city || account.state || '—'
      },
    },
    {
      key: 'jobsCount',
      header: 'Jobs',
      label: 'Jobs',
      sortable: true,
      width: 'w-[70px]',
      align: 'right' as const,
      render: (value, entity) => {
        const account = entity as Account
        const count = account.jobsCount ?? account.jobs_count ?? 0
        return count.toLocaleString()
      },
    },
    {
      key: 'contactsCount',
      header: 'Contacts',
      label: 'Contacts',
      width: 'w-[80px]',
      align: 'right' as const,
      render: (value, entity) => {
        const account = entity as Account
        const count = account.contactsCount ?? account.contacts_count ?? 0
        return count.toLocaleString()
      },
    },
    {
      key: 'placementsCount',
      header: 'Placements',
      label: 'Placements',
      sortable: true,
      width: 'w-[90px]',
      align: 'right' as const,
      render: (value, entity) => {
        const account = entity as Account
        const count = account.placementsCount ?? account.placements_count ?? 0
        return count.toLocaleString()
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      label: 'Owner',
      sortable: true,
      width: 'w-[130px]',
      render: (value) => {
        const owner = value as Account['owner']
        return owner?.full_name || '—'
      },
    },
    {
      key: 'lastContactDate',
      header: 'Last Contact',
      label: 'Last Contact',
      sortable: true,
      width: 'w-[110px]',
      format: 'relative-date' as const,
      render: (value, entity) => {
        const account = entity as Account
        const date = account.lastContactDate || account.last_contact_date
        if (!date) return '—'
        const d = new Date(date)
        const now = new Date()
        const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`
        return `${Math.floor(days / 30)} months ago`
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
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: ACCOUNT_STATUS_CONFIG,

  pageSize: 50,

  emptyState: {
    icon: Building2,
    title: 'No accounts found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first account to start building relationships',
    action: {
      label: 'Create Account',
      href: '/employee/recruiting/accounts/new',
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const typeValue = filters.type as string | undefined
    const industryValue = filters.industry as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['active', 'inactive', 'prospect', 'on_hold', 'all'] as const
    const validTypes = ['enterprise', 'mid_market', 'smb', 'startup'] as const
    const _validSortFields = [
      'name',
      'industry',
      'type',
      'status',
      'jobs_count',
      'placements_count',
      'owner_id',
      'last_contact_date',
      'created_at',
    ] as const

    type AccountStatus = (typeof validStatuses)[number]
    type AccountType = (typeof validTypes)[number]
    type SortField = (typeof _validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      industry: 'industry',
      type: 'type',
      status: 'status',
      jobsCount: 'jobs_count',
      placementsCount: 'placements_count',
      owner: 'owner_id',
      lastContactDate: 'last_contact_date',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    return trpc.crm.accounts.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as AccountStatus)
        ? statusValue
        : 'all') as AccountStatus,
      type: typeValue && typeValue !== 'all' && validTypes.includes(typeValue as AccountType)
        ? typeValue as AccountType
        : undefined,
      industry: industryValue !== 'all' ? industryValue : undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  useStatsQuery: () => {
    return trpc.crm.accounts.stats.useQuery()
  },
}

// Accounts Detail View Configuration
export const accountsDetailConfig: DetailViewConfig<Account> = {
  entityType: 'account',
  baseRoute: '/employee/recruiting/accounts',
  titleField: 'name',
  statusField: 'status',
  statusConfig: ACCOUNT_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'My Work', href: '/employee/workspace/dashboard' },
    { label: 'Accounts', href: '/employee/recruiting/accounts' },
  ],

  subtitleFields: [
    { key: 'industry' },
    {
      key: 'city',
      icon: MapPin,
      format: (value, entity) => {
        const account = entity as unknown as Account
        if (account.city && account.state) {
          return `${account.city}, ${account.state}`
        }
        return (account.city || account.state || '') as string
      },
    },
    { key: 'phone', icon: Phone },
    {
      key: 'website',
      icon: Globe,
      format: (value) => {
        if (!value) return ''
        return String(value).replace(/^https?:\/\//, '')
      },
    },
  ],

  metrics: [
    {
      key: 'activeJobs',
      label: 'Active Jobs',
      icon: Briefcase,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: () => 0, // Populated from additional queries
      tooltip: 'Active job requisitions',
    },
    {
      key: 'placements',
      label: 'Placements',
      icon: Users,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: () => 0,
      tooltip: 'Total placements this year',
    },
    {
      key: 'contacts',
      label: 'Contacts',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: () => 0,
      tooltip: 'Total contacts at this account',
    },
    {
      key: 'health',
      label: 'Health Score',
      icon: Activity,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: () => 0,
      tooltip: 'Account health score (0-100)',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: AccountOverviewSectionPCF,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      showCount: true,
      component: AccountContactsSectionPCF,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      showCount: true,
      component: AccountJobsSectionPCF,
    },
    {
      id: 'placements',
      label: 'Placements',
      icon: CheckCircle,
      showCount: true,
      component: AccountPlacementsSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: AccountActivitiesSectionPCF,
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: Calendar,
      component: AccountMeetingsSectionPCF,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: MessageSquare,
      component: AccountNotesSectionPCF,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      component: AccountDocumentsSectionPCF,
    },
    {
      id: 'escalations',
      label: 'Escalations',
      icon: AlertTriangle,
      alertOnCount: true,
      component: AccountEscalationsSectionPCF,
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const account = entity as Account
        // Dispatch event for sidebar to handle
        window.dispatchEvent(
          new CustomEvent('openAccountDialog', {
            detail: { dialogId: 'logActivity', accountId: account.id },
          })
        )
      },
    },
    {
      id: 'add-contact',
      label: 'Add Contact',
      icon: Users,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const account = entity as Account
        window.dispatchEvent(
          new CustomEvent('openAccountDialog', {
            detail: { dialogId: 'addContact', accountId: account.id },
          })
        )
      },
    },
    {
      id: 'create-job',
      label: 'Create Job',
      icon: Plus,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const account = entity as Account
        window.location.href = `/employee/recruiting/jobs/intake?accountId=${account.id}`
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Account',
      icon: FileText,
      onClick: (entity) => {
        window.location.href = `/employee/recruiting/accounts/${entity.id}/edit`
      },
    },
    {
      label: 'View Health Dashboard',
      icon: TrendingUp,
      onClick: (entity) => {
        window.location.href = `/employee/recruiting/accounts/${entity.id}/health`
      },
    },
    { separator: true, label: '' },
    {
      label: 'Start Onboarding',
      icon: Calendar,
      onClick: (entity) => {
        window.location.href = `/employee/recruiting/accounts/${entity.id}/onboarding`
      },
      isVisible: (entity) => entity.status === 'prospect',
    },
  ],

  eventNamespace: 'account',

  useEntityQuery: (entityId) => trpc.crm.accounts.getById.useQuery({ id: entityId }),
}
