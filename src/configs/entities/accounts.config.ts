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
  tier?: string | null
  description?: string | null
  nps_score?: number | null
  annual_revenue_target?: number | null
  last_contact_date?: string | null
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  created_at: string
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
      key: 'healthy',
      label: 'Healthy',
      color: 'bg-green-100 text-green-800',
      icon: TrendingUp,
    },
    {
      key: 'needsAttention',
      label: 'Needs Attention',
      color: 'bg-amber-100 text-amber-800',
      icon: Minus,
    },
    {
      key: 'atRisk',
      label: 'At Risk',
      color: 'bg-red-100 text-red-700',
      icon: TrendingDown,
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
  ],

  columns: [
    {
      key: 'name',
      label: 'Account Name',
      sortable: true,
    },
    {
      key: 'industry',
      label: 'Industry',
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'city',
      label: 'Location',
      icon: MapPin,
      render: (value, entity) => {
        const account = entity as Account
        if (account.city && account.state) {
          return `${account.city}, ${account.state}`
        }
        return account.city || account.state || '—'
      },
    },
    {
      key: 'phone',
      label: 'Phone',
      icon: Phone,
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (value) => {
        const owner = value as Account['owner']
        return owner?.full_name || '—'
      },
    },
    {
      key: 'lastContactDate',
      label: 'Last Contact',
      type: 'date',
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
    const validStatuses = ['active', 'inactive', 'prospect', 'all'] as const
    type AccountStatus = (typeof validStatuses)[number]

    return trpc.crm.accounts.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as AccountStatus)
        ? statusValue
        : 'all') as AccountStatus,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
    })
  },

  useStatsQuery: () => {
    const healthQuery = trpc.crm.accounts.getHealth.useQuery({})
    return {
      data: healthQuery.data?.summary,
      isLoading: healthQuery.isLoading,
    }
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
