import {
  Briefcase,
  Plus,
  Building2,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Activity,
  Send,
  Target,
  Edit,
  Trash2,
  UserPlus,
  MapPin,
  Timer,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// Type definition for JobOrder entity
export interface JobOrder extends Record<string, unknown> {
  id: string
  title: string
  description?: string | null
  client_name?: string | null
  vendor_id?: string | null
  vendor?: {
    id: string
    name: string
    type?: string | null
    tier?: string | null
  } | null
  status: string
  priority?: string | null
  bill_rate?: number | null
  rate_type?: string | null
  duration_months?: number | null
  location?: string | null
  work_mode?: string | null
  positions?: number | null
  received_at?: string | null
  response_due_at?: string | null
  source?: string | null
  original_source_url?: string | null
  submissions?: Array<{ count: number }> | null
  created_at: string
  updated_at?: string | null
}

// JobOrder status configuration (matches router: new, working, filled, closed, on_hold)
export const JOB_ORDER_STATUS_CONFIG: Record<string, StatusConfig> = {
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Clock,
  },
  working: {
    label: 'Working',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Target,
  },
  filled: {
    label: 'Filled',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  closed: {
    label: 'Closed',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: XCircle,
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: AlertCircle,
  },
}

// Priority configuration (matches router: low, medium, high, urgent)
export const JOB_ORDER_PRIORITY_CONFIG: Record<string, StatusConfig> = {
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: AlertCircle,
  },
  high: {
    label: 'High',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  low: {
    label: 'Low',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
  },
}

// JobOrders List View Configuration
export const jobOrdersListConfig: ListViewConfig<JobOrder> = {
  entityType: 'job_order',
  entityName: { singular: 'Job Order', plural: 'Job Orders' },
  baseRoute: '/employee/bench/job-orders',

  title: 'Job Orders',
  description: 'Manage vendor job orders and submissions',
  icon: Briefcase,

  primaryAction: {
    label: 'New Job Order',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(
        new CustomEvent('openJobOrderDialog', { detail: { dialogId: 'create' } })
      )
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Orders',
      icon: Briefcase,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-blue-100 text-blue-800',
      icon: Target,
    },
    {
      key: 'filled',
      label: 'Filled',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'avgTimeToFill',
      label: 'Avg Time to Fill',
      format: (value: number) => `${value} days`,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Job Orders',
      placeholder: 'Search job orders...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(JOB_ORDER_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'priority',
      type: 'select',
      label: 'Priority',
      options: [
        { value: 'all', label: 'All Priorities' },
        ...Object.entries(JOB_ORDER_PRIORITY_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'title',
      header: 'Title',
      label: 'Title',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'vendor',
      header: 'Vendor',
      label: 'Vendor',
      width: 'w-[150px]',
      render: (value) => {
        const vendor = value as JobOrder['vendor']
        return vendor?.name || '—'
      },
    },
    {
      key: 'client_name',
      header: 'Client',
      label: 'Client',
      width: 'w-[140px]',
      render: (value) => {
        return (value as string) || '—'
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
      key: 'priority',
      header: 'Priority',
      label: 'Priority',
      sortable: true,
      width: 'w-[80px]',
      align: 'center' as const,
      render: (value) => {
        const priority = value as string | null
        return JOB_ORDER_PRIORITY_CONFIG[priority || '']?.label || priority || '—'
      },
    },
    {
      key: 'bill_rate',
      header: 'Bill Rate',
      label: 'Bill Rate',
      sortable: true,
      width: 'w-[90px]',
      align: 'right' as const,
      render: (value, entity) => {
        const jo = entity as JobOrder
        if (jo.bill_rate) {
          return `$${jo.bill_rate}/${jo.rate_type || 'hr'}`
        }
        return '—'
      },
    },
    {
      key: 'duration_months',
      header: 'Duration',
      label: 'Duration',
      sortable: true,
      width: 'w-[80px]',
      align: 'center' as const,
      render: (value) => {
        const months = value as number | null
        if (!months) return '—'
        return `${months} mo`
      },
    },
    {
      key: 'location',
      header: 'Location',
      label: 'Location',
      width: 'w-[130px]',
      render: (value, entity) => {
        const jo = entity as JobOrder
        const location = value as string | null
        if (!location) return jo.work_mode || '—'
        return location
      },
    },
    {
      key: 'submissions',
      header: 'Submissions',
      label: 'Submissions',
      width: 'w-[90px]',
      align: 'right' as const,
      render: (value) => {
        const submissions = value as JobOrder['submissions']
        const count = submissions?.[0]?.count || 0
        return String(count)
      },
    },
    {
      key: 'received_at',
      header: 'Received',
      label: 'Received',
      sortable: true,
      width: 'w-[100px]',
      format: 'relative-date' as const,
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: JOB_ORDER_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Briefcase,
    title: 'No job orders found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first job order to start sourcing',
    action: {
      label: 'Create Job Order',
      onClick: () => {
        window.dispatchEvent(
          new CustomEvent('openJobOrderDialog', { detail: { dialogId: 'create' } })
        )
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const priorityValue = filters.priority as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['new', 'working', 'filled', 'closed', 'on_hold', 'all'] as const
    const validPriorities = ['low', 'medium', 'high', 'urgent', 'all'] as const
    const validSortFields = ['received_at', 'title', 'status', 'priority', 'bill_rate', 'duration_months', 'created_at'] as const

    type JobOrderStatus = (typeof validStatuses)[number]
    type JobOrderPriority = (typeof validPriorities)[number]
    type SortField = (typeof validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      title: 'title',
      status: 'status',
      priority: 'priority',
      bill_rate: 'bill_rate',
      duration_months: 'duration_months',
      received_at: 'received_at',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'received_at'

    return trpc.bench.jobOrders.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as JobOrderStatus)
        ? statusValue
        : 'all') as JobOrderStatus,
      priority: (priorityValue && validPriorities.includes(priorityValue as JobOrderPriority)
        ? priorityValue
        : 'all') as JobOrderPriority,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  // Stats query for metrics cards
  useStatsQuery: () => {
    return trpc.bench.jobOrders.stats.useQuery()
  },
}

// JobOrders Detail View Configuration
export const jobOrdersDetailConfig: DetailViewConfig<JobOrder> = {
  entityType: 'job_order',
  baseRoute: '/employee/bench/job-orders',
  titleField: 'title',
  statusField: 'status',
  statusConfig: JOB_ORDER_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'Bench Sales', href: '/employee/bench' },
    { label: 'Job Orders', href: '/employee/bench/job-orders' },
  ],

  subtitleFields: [
    {
      key: 'vendor',
      icon: Building2,
      format: (value) => (value as JobOrder['vendor'])?.name || 'No vendor',
    },
    {
      key: 'received_at',
      icon: Calendar,
      format: (value) => {
        if (!value) return ''
        return new Date(value as string).toLocaleDateString()
      },
    },
    {
      key: 'bill_rate',
      icon: DollarSign,
      format: (value, entity) => {
        const jo = entity as JobOrder
        if (jo?.bill_rate) return `$${jo.bill_rate}/${jo?.rate_type || 'hr'}`
        return ''
      },
    },
  ],

  metrics: [
    {
      key: 'submissions',
      label: 'Submissions',
      icon: Send,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity) => {
        const jo = entity as JobOrder
        return jo.submissions?.[0]?.count || 0
      },
      tooltip: 'Total submissions made',
    },
    {
      key: 'positions',
      label: 'Positions',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity) => {
        const jo = entity as JobOrder
        return jo.positions || 1
      },
      tooltip: 'Positions filled / total',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: Send,
      showCount: true,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      showCount: true,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      showCount: true,
    },
  ],

  quickActions: [
    {
      id: 'submit-talent',
      label: 'Submit Talent',
      icon: UserPlus,
      variant: 'default',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openJobOrderDialog', {
            detail: { dialogId: 'submitTalent', jobOrderId: (entity as JobOrder).id },
          })
        )
      },
      isVisible: (entity) => {
        const jo = entity as JobOrder
        return jo.status !== 'filled' && jo.status !== 'cancelled'
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Job Order',
      icon: Edit,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openJobOrderDialog', {
            detail: { dialogId: 'edit', jobOrderId: entity.id },
          })
        )
      },
    },
    { separator: true, label: '' },
    {
      label: 'Cancel Job Order',
      icon: Trash2,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openJobOrderDialog', {
            detail: { dialogId: 'cancel', jobOrderId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const jo = entity as JobOrder
        return jo.status !== 'cancelled' && jo.status !== 'filled'
      },
    },
  ],

  eventNamespace: 'jobOrder',

  useEntityQuery: (id: string) => {
    return trpc.bench.jobOrders.getById.useQuery({ id })
  },
}

