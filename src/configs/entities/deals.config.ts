import {
  Handshake,
  Plus,
  Building2,
  DollarSign,
  Calendar,
  User,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  FileText,
  ArrowRight,
  Users,
  History,
  Briefcase,
  ClipboardList,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import {
  DealOverviewSectionPCF,
  DealActivitySectionPCF,
  DealRolesSectionPCF,
  DealHistorySectionPCF,
  DealTasksSectionPCF,
} from './sections/deals.sections'

// Type definition for Deal entity
export interface Deal extends Record<string, unknown> {
  id: string
  name: string
  title?: string | null
  stage: string
  value?: number | null
  probability?: number | null
  expected_close_date?: string | null
  deal_type?: string | null
  health_status?: string | null
  account_id?: string | null
  account?: {
    id: string
    name: string
    industry?: string
  } | null
  lead_id?: string | null
  lead?: {
    id: string
    company_name?: string
    first_name?: string
    last_name?: string
  } | null
  owner_id?: string | null
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  estimated_placements?: number | null
  avg_bill_rate?: number | null
  contract_length_months?: number | null
  next_action?: string | null
  next_action_date?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
  closed_at?: string | null
}

// Deal stage configuration
export const DEAL_STAGE_CONFIG: Record<string, StatusConfig> = {
  discovery: {
    label: 'Discovery',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: Target,
  },
  qualification: {
    label: 'Qualification',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: CheckCircle2,
  },
  proposal: {
    label: 'Proposal',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: FileText,
  },
  negotiation: {
    label: 'Negotiation',
    color: 'bg-orange-100 text-orange-800',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: Handshake,
  },
  verbal_commit: {
    label: 'Verbal Commit',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: TrendingUp,
  },
  closed_won: {
    label: 'Closed Won',
    color: 'bg-green-600 text-white',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    icon: CheckCircle2,
  },
  closed_lost: {
    label: 'Closed Lost',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
}

// Deal health configuration
export const DEAL_HEALTH_CONFIG: Record<string, StatusConfig> = {
  on_track: {
    label: 'On Track',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle2,
  },
  slow: {
    label: 'Slow',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
  stale: {
    label: 'Stale',
    color: 'bg-orange-100 text-orange-800',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: AlertCircle,
  },
  at_risk: {
    label: 'At Risk',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: AlertCircle,
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-600 text-white',
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    icon: AlertCircle,
  },
}

// Deals List View Configuration
export const dealsListConfig: ListViewConfig<Deal> = {
  entityType: 'deal',
  entityName: { singular: 'Deal', plural: 'Deals' },
  baseRoute: '/employee/crm/deals',

  title: 'Deals',
  description: 'Manage your sales pipeline and deals',
  icon: Handshake,

  primaryAction: {
    label: 'New Deal',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openDealDialog', { detail: { dialogId: 'create' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Pipeline',
      icon: DollarSign,
      format: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: 'weighted',
      label: 'Weighted Value',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-800',
      format: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: 'atRisk',
      label: 'At Risk',
      color: 'bg-red-100 text-red-700',
      icon: AlertCircle,
    },
    {
      key: 'closingThisMonth',
      label: 'Closing This Month',
      color: 'bg-green-100 text-green-800',
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Deals',
      placeholder: 'Search by name or account...',
    },
    {
      key: 'stage',
      type: 'select',
      label: 'Stage',
      options: [
        { value: 'all', label: 'All Stages' },
        ...Object.entries(DEAL_STAGE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'healthStatus',
      type: 'select',
      label: 'Health',
      options: [
        { value: 'all', label: 'All Health' },
        ...Object.entries(DEAL_HEALTH_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      label: 'Deal Name',
      sortable: true,
    },
    {
      key: 'account',
      label: 'Account',
      icon: Building2,
      render: (value) => {
        const account = value as Deal['account']
        return account?.name || '—'
      },
    },
    {
      key: 'stage',
      label: 'Stage',
    },
    {
      key: 'value',
      label: 'Value',
      type: 'currency',
      sortable: true,
    },
    {
      key: 'probability',
      label: 'Probability',
      render: (value) => {
        const prob = value as number | null
        return prob !== null ? `${prob}%` : '—'
      },
    },
    {
      key: 'expected_close_date',
      label: 'Expected Close',
      type: 'date',
      sortable: true,
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (value) => {
        const owner = value as Deal['owner']
        return owner?.full_name || '—'
      },
    },
    {
      key: 'health_status',
      label: 'Health',
      render: (value) => {
        const health = value as string | null
        return DEAL_HEALTH_CONFIG[health || '']?.label || '—'
      },
    },
  ],

  renderMode: 'table',
  statusField: 'stage',
  statusConfig: DEAL_STAGE_CONFIG,

  pageSize: 50,

  emptyState: {
    icon: Handshake,
    title: 'No deals found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first deal to start tracking your pipeline',
    action: {
      label: 'Create Deal',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openDealDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const stageValue = filters.stage as string | undefined
    const healthValue = filters.healthStatus as string | undefined
    const validHealth = ['on_track', 'slow', 'stale', 'urgent', 'at_risk', 'all'] as const
    type HealthStatus = (typeof validHealth)[number]

    return trpc.crm.deals.list.useQuery({
      search: filters.search as string | undefined,
      stage: stageValue !== 'all' ? stageValue : undefined,
      healthStatus: (healthValue && validHealth.includes(healthValue as HealthStatus)
        ? healthValue
        : 'all') as HealthStatus,
      excludeClosed: false,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: 'expected_close_date',
      sortOrder: 'asc',
    })
  },

  useStatsQuery: () => trpc.crm.deals.getStats.useQuery({ period: 'quarter' }),
}

// Deals Detail View Configuration
export const dealsDetailConfig: DetailViewConfig<Deal> = {
  entityType: 'deal',
  baseRoute: '/employee/crm/deals',
  titleField: 'name',
  statusField: 'stage',
  statusConfig: DEAL_STAGE_CONFIG,

  breadcrumbs: [
    { label: 'CRM', href: '/employee/crm' },
    { label: 'Deals', href: '/employee/crm/deals' },
  ],

  subtitleFields: [
    {
      key: 'account',
      icon: Building2,
      format: (value) => {
        const account = value as Deal['account'] | null
        return account?.name || ''
      },
    },
    {
      key: 'value',
      icon: DollarSign,
      format: (value) => {
        const amount = value as number | null
        return amount ? `$${amount.toLocaleString()}` : ''
      },
    },
    {
      key: 'expected_close_date',
      icon: Calendar,
      format: (value) => {
        if (!value) return ''
        return new Date(value as string).toLocaleDateString()
      },
    },
  ],

  metrics: [
    {
      key: 'value',
      label: 'Deal Value',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const deal = entity as Deal
        return deal.value || 0
      },
      format: (value) => `$${Number(value).toLocaleString()}`,
      tooltip: 'Total deal value',
    },
    {
      key: 'probability',
      label: 'Probability',
      icon: Target,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const deal = entity as Deal
        return deal.probability || 0
      },
      format: (value) => `${value}%`,
      tooltip: 'Win probability',
    },
    {
      key: 'placements',
      label: 'Est. Placements',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity: unknown) => {
        const deal = entity as Deal
        return deal.estimated_placements || 0
      },
      tooltip: 'Estimated number of placements',
    },
    {
      key: 'daysOpen',
      label: 'Days Open',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const deal = entity as Deal
        const created = new Date(deal.created_at)
        const now = new Date()
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      },
      tooltip: 'Days since deal was created',
    },
  ],

  navigationMode: 'journey',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: DealOverviewSectionPCF,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
      component: DealActivitySectionPCF,
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: Briefcase,
      component: DealRolesSectionPCF,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: ClipboardList,
      component: DealTasksSectionPCF,
    },
    {
      id: 'history',
      label: 'Stage History',
      icon: History,
      component: DealHistorySectionPCF,
    },
  ],

  journeySteps: [
    {
      id: 'discovery',
      label: 'Discovery',
      icon: Target,
      activeStatuses: ['discovery'],
      completedStatuses: [
        'qualification',
        'proposal',
        'negotiation',
        'verbal_commit',
        'closed_won',
      ],
    },
    {
      id: 'qualification',
      label: 'Qualification',
      icon: CheckCircle2,
      activeStatuses: ['qualification'],
      completedStatuses: ['proposal', 'negotiation', 'verbal_commit', 'closed_won'],
    },
    {
      id: 'proposal',
      label: 'Proposal',
      icon: FileText,
      activeStatuses: ['proposal'],
      completedStatuses: ['negotiation', 'verbal_commit', 'closed_won'],
    },
    {
      id: 'negotiation',
      label: 'Negotiation',
      icon: Handshake,
      activeStatuses: ['negotiation'],
      completedStatuses: ['verbal_commit', 'closed_won'],
    },
    {
      id: 'verbal_commit',
      label: 'Verbal Commit',
      icon: TrendingUp,
      activeStatuses: ['verbal_commit'],
      completedStatuses: ['closed_won'],
    },
    {
      id: 'closed',
      label: 'Closed',
      icon: CheckCircle2,
      activeStatuses: ['closed_won', 'closed_lost'],
      completedStatuses: [],
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const deal = entity as Deal
        window.dispatchEvent(
          new CustomEvent('openDealDialog', {
            detail: { dialogId: 'logActivity', dealId: deal.id },
          })
        )
      },
    },
    {
      id: 'advance-stage',
      label: 'Advance Stage',
      icon: ArrowRight,
      variant: 'default',
      onClick: (entity: unknown) => {
        const deal = entity as Deal
        window.dispatchEvent(
          new CustomEvent('openDealDialog', {
            detail: { dialogId: 'advanceStage', dealId: deal.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const deal = entity as Deal
        return deal.stage !== 'closed_won' && deal.stage !== 'closed_lost'
      },
    },
    {
      id: 'close-won',
      label: 'Close Won',
      icon: CheckCircle2,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const deal = entity as Deal
        window.dispatchEvent(
          new CustomEvent('openDealDialog', {
            detail: { dialogId: 'closeWon', dealId: deal.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const deal = entity as Deal
        return deal.stage === 'verbal_commit' || deal.stage === 'negotiation'
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Deal',
      icon: FileText,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openDealDialog', {
            detail: { dialogId: 'edit', dealId: entity.id },
          })
        )
      },
    },
    {
      label: 'Add Stakeholder',
      icon: Users,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openDealDialog', {
            detail: { dialogId: 'addStakeholder', dealId: entity.id },
          })
        )
      },
    },
    { separator: true, label: '' },
    {
      label: 'Close Lost',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openDealDialog', {
            detail: { dialogId: 'closeLost', dealId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const deal = entity as Deal
        return deal.stage !== 'closed_won' && deal.stage !== 'closed_lost'
      },
    },
  ],

  eventNamespace: 'deal',

  useEntityQuery: (entityId) => trpc.crm.deals.getById.useQuery({ id: entityId }),
}
