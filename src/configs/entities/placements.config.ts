import {
  Award,
  Plus,
  Building2,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  FileText,
  ArrowRight,
  Briefcase,
  Heart,
  Pause,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
// PCF Section Adapters
import {
  PlacementOverviewSectionPCF,
  PlacementTimesheetsSectionPCF,
  PlacementActivitiesSectionPCF,
  PlacementDocumentsSectionPCF,
} from './sections/placements.sections'

// Type definition for Placement entity
export interface Placement extends Record<string, unknown> {
  id: string
  status: string
  health_status?: string | null
  start_date?: string | null
  end_date?: string | null
  pay_rate?: number | null
  bill_rate?: number | null
  next_check_in_date?: string | null
  last_check_in_date?: string | null
  checkin_7_day_completed?: boolean
  checkin_30_day_completed?: boolean
  checkin_60_day_completed?: boolean
  checkin_90_day_completed?: boolean
  job?: {
    id: string
    title: string
  } | null
  candidate?: {
    id: string
    first_name: string
    last_name: string
  } | null
  account?: {
    id: string
    name: string
  } | null
  submission?: {
    id: string
    submitted_by?: string
  } | null
  created_at: string
  updated_at?: string
}

// Placement status configuration
export const PLACEMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending_start: {
    label: 'Pending Start',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: Clock,
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle2,
  },
  extended: {
    label: 'Extended',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: ArrowRight,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Award,
  },
  terminated: {
    label: 'Terminated',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Pause,
  },
}

// Placement health configuration
export const PLACEMENT_HEALTH_CONFIG: Record<string, StatusConfig> = {
  healthy: {
    label: 'Healthy',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Heart,
  },
  at_risk: {
    label: 'At Risk',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: AlertCircle,
  },
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: AlertCircle,
  },
}

// Placements List View Configuration
export const placementsListConfig: ListViewConfig<Placement> = {
  entityType: 'placement',
  entityName: { singular: 'Placement', plural: 'Placements' },
  baseRoute: '/employee/recruiting/placements',

  title: 'Placements',
  description: 'Track active placements and consultant health',
  icon: Award,

  primaryAction: {
    label: 'New Placement',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openPlacementDialog', { detail: { dialogId: 'create' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Placements',
      icon: Award,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle2,
    },
    {
      key: 'endingSoon',
      label: 'Ending Soon',
      color: 'bg-amber-100 text-amber-800',
      icon: Clock,
    },
    {
      key: 'atRisk',
      label: 'At Risk',
      color: 'bg-red-100 text-red-700',
      icon: AlertCircle,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Placements',
      placeholder: 'Search by candidate or job...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(PLACEMENT_STATUS_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(PLACEMENT_HEALTH_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'endingSoon',
      type: 'toggle',
      label: 'Ending Soon',
    },
  ],

  columns: [
    {
      key: 'candidate',
      label: 'Candidate',
      render: (value) => {
        const candidate = value as Placement['candidate']
        if (!candidate) return '—'
        return `${candidate.first_name} ${candidate.last_name}`.trim()
      },
    },
    {
      key: 'job',
      label: 'Job',
      icon: Briefcase,
      render: (value) => {
        const job = value as Placement['job']
        return job?.title || '—'
      },
    },
    {
      key: 'account',
      label: 'Account',
      icon: Building2,
      render: (value) => {
        const account = value as Placement['account']
        return account?.name || '—'
      },
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'health_status',
      label: 'Health',
      render: (value) => {
        const health = value as string | null
        return PLACEMENT_HEALTH_CONFIG[health || '']?.label || '—'
      },
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'date',
    },
    {
      key: 'end_date',
      label: 'End Date',
      type: 'date',
    },
    {
      key: 'bill_rate',
      label: 'Bill Rate',
      type: 'currency',
      render: (value) => {
        const rate = value as number | null
        return rate ? `$${rate}/hr` : '—'
      },
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: PLACEMENT_STATUS_CONFIG,

  pageSize: 50,

  emptyState: {
    icon: Award,
    title: 'No placements found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first placement to start tracking consultants',
    action: {
      label: 'Create Placement',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openPlacementDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const healthValue = filters.healthStatus as string | undefined
    const validStatuses = ['pending_start', 'active', 'extended', 'completed', 'terminated', 'on_hold', 'all'] as const
    const validHealth = ['healthy', 'at_risk', 'critical'] as const

    type PlacementStatus = (typeof validStatuses)[number]
    type HealthStatus = (typeof validHealth)[number]

    return trpc.ats.placements.list.useQuery({
      status: (statusValue && validStatuses.includes(statusValue as PlacementStatus)
        ? statusValue
        : 'all') as PlacementStatus,
      healthStatus: healthValue && validHealth.includes(healthValue as HealthStatus)
        ? (healthValue as HealthStatus)
        : undefined,
      endingSoon: filters.endingSoon as boolean | undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
    })
  },

  useStatsQuery: () => trpc.ats.placements.getStats.useQuery({ period: 'month' }),
}

// Placements Detail View Configuration
export const placementsDetailConfig: DetailViewConfig<Placement> = {
  entityType: 'placement',
  baseRoute: '/employee/recruiting/placements',
  titleField: 'id',
  statusField: 'status',
  statusConfig: PLACEMENT_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'Recruiting', href: '/employee/recruiting' },
    { label: 'Placements', href: '/employee/recruiting/placements' },
  ],

  titleFormatter: (entity) => {
    const placement = entity as Placement
    if (placement.candidate && placement.job) {
      return `${placement.candidate.first_name} ${placement.candidate.last_name} @ ${placement.job.title}`
    }
    return `Placement #${placement.id.slice(0, 8)}`
  },

  subtitleFields: [
    {
      key: 'job',
      icon: Briefcase,
      format: (value) => {
        const job = value as Placement['job'] | null
        return job?.title || ''
      },
    },
    {
      key: 'account',
      icon: Building2,
      format: (value) => {
        const account = value as Placement['account'] | null
        return account?.name || ''
      },
    },
    {
      key: 'start_date',
      icon: Calendar,
      format: (value) => {
        if (!value) return ''
        return new Date(value as string).toLocaleDateString()
      },
    },
  ],

  metrics: [
    {
      key: 'daysActive',
      label: 'Days Active',
      icon: Clock,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const placement = entity as Placement
        if (!placement.start_date) return 0
        const start = new Date(placement.start_date)
        const now = new Date()
        return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      },
      tooltip: 'Days since placement started',
    },
    {
      key: 'margin',
      label: 'Margin',
      icon: TrendingUp,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const placement = entity as Placement
        if (!placement.bill_rate || !placement.pay_rate) return 0
        const margin = ((placement.bill_rate - placement.pay_rate) / placement.bill_rate) * 100
        return Math.round(margin)
      },
      format: (value) => `${value}%`,
      tooltip: 'Gross margin percentage',
    },
    {
      key: 'billRate',
      label: 'Bill Rate',
      icon: DollarSign,
      iconBg: 'bg-gold-100',
      iconColor: 'text-gold-600',
      getValue: (entity: unknown) => {
        const placement = entity as Placement
        return placement.bill_rate || 0
      },
      format: (value) => `$${Number(value)}/hr`,
      tooltip: 'Hourly bill rate',
    },
    {
      key: 'health',
      label: 'Health Status',
      icon: Heart,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity: unknown) => {
        const placement = entity as Placement
        return PLACEMENT_HEALTH_CONFIG[placement.health_status || 'healthy']?.label || 'Unknown'
      },
      tooltip: 'Current placement health',
    },
  ],

  showProgressBar: {
    label: 'Assignment Progress',
    getValue: (entity) => {
      const placement = entity as Placement
      if (!placement.start_date) return 0
      const start = new Date(placement.start_date)
      const now = new Date()
      return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    },
    getMax: (entity) => {
      const placement = entity as Placement
      if (!placement.start_date || !placement.end_date) return 90
      const start = new Date(placement.start_date)
      const end = new Date(placement.end_date)
      return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    },
  },

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: PlacementOverviewSectionPCF,
    },
    {
      id: 'timesheets',
      label: 'Timesheets',
      icon: Calendar,
      showCount: true,
      component: PlacementTimesheetsSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: PlacementActivitiesSectionPCF,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      component: PlacementDocumentsSectionPCF,
    },
  ],

  journeySteps: [
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: User,
      activeStatuses: ['pending_start'],
      completedStatuses: ['active', 'extended', 'completed'],
    },
    {
      id: '7day',
      label: '7-Day Check',
      icon: Calendar,
      activeStatuses: [],
      completedStatuses: [],
    },
    {
      id: '30day',
      label: '30-Day Check',
      icon: Calendar,
      activeStatuses: [],
      completedStatuses: [],
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: TrendingUp,
      activeStatuses: ['active', 'extended'],
      completedStatuses: ['completed'],
    },
    {
      id: 'completion',
      label: 'Completion',
      icon: CheckCircle2,
      activeStatuses: ['completed'],
      completedStatuses: [],
    },
  ],

  quickActions: [
    {
      id: 'log-checkin',
      label: 'Log Check-in',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const placement = entity as Placement
        window.dispatchEvent(
          new CustomEvent('openPlacementDialog', {
            detail: { dialogId: 'logCheckin', placementId: placement.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const placement = entity as Placement
        return ['active', 'extended'].includes(placement.status)
      },
    },
    {
      id: 'extend',
      label: 'Extend Placement',
      icon: ArrowRight,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const placement = entity as Placement
        window.dispatchEvent(
          new CustomEvent('openPlacementDialog', {
            detail: { dialogId: 'extend', placementId: placement.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const placement = entity as Placement
        return placement.status === 'active'
      },
    },
    {
      id: 'update-health',
      label: 'Update Health',
      icon: Heart,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const placement = entity as Placement
        window.dispatchEvent(
          new CustomEvent('openPlacementDialog', {
            detail: { dialogId: 'updateHealth', placementId: placement.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const placement = entity as Placement
        return ['active', 'extended'].includes(placement.status)
      },
    },
  ],

  dropdownActions: [
    {
      label: 'View Candidate',
      icon: User,
      onClick: (entity) => {
        const placement = entity as Placement
        if (placement.candidate?.id) {
          window.location.href = `/employee/recruiting/candidates/${placement.candidate.id}`
        }
      },
    },
    {
      label: 'View Job',
      icon: Briefcase,
      onClick: (entity) => {
        const placement = entity as Placement
        if (placement.job?.id) {
          window.location.href = `/employee/recruiting/jobs/${placement.job.id}`
        }
      },
    },
    {
      label: 'View Account',
      icon: Building2,
      onClick: (entity) => {
        const placement = entity as Placement
        if (placement.account?.id) {
          window.location.href = `/employee/recruiting/accounts/${placement.account.id}`
        }
      },
    },
    { separator: true, label: '' },
    {
      label: 'Put On Hold',
      icon: Pause,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openPlacementDialog', {
            detail: { dialogId: 'putOnHold', placementId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const placement = entity as Placement
        return placement.status === 'active' || placement.status === 'extended'
      },
    },
    {
      label: 'Mark Complete',
      icon: CheckCircle2,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openPlacementDialog', {
            detail: { dialogId: 'markComplete', placementId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const placement = entity as Placement
        return ['active', 'extended'].includes(placement.status)
      },
    },
    {
      label: 'Terminate',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openPlacementDialog', {
            detail: { dialogId: 'terminate', placementId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const placement = entity as Placement
        return !['completed', 'terminated'].includes(placement.status)
      },
    },
  ],

  eventNamespace: 'placement',

  useEntityQuery: (entityId) => trpc.ats.placements.getById.useQuery({ placementId: entityId }),
}
