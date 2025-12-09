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
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
// Note: trpc router for jobOrders not implemented yet

// Type definition for JobOrder entity
export interface JobOrder extends Record<string, unknown> {
  id: string
  title: string
  client_name?: string
  vendor_id?: string
  vendor?: {
    id: string
    name: string
  } | null
  status: string
  priority?: string
  rate_min?: number
  rate_max?: number
  rate_type?: string
  duration?: string
  location?: string
  remote_type?: string
  start_date?: string
  end_date?: string
  positions_count?: number
  positions_filled?: number
  submissions_count?: number
  owner_id?: string
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  created_at: string
  updated_at?: string
}

// JobOrder status configuration
export const JOB_ORDER_STATUS_CONFIG: Record<string, StatusConfig> = {
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Clock,
  },
  sourcing: {
    label: 'Sourcing',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Target,
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Send,
  },
  filled: {
    label: 'Filled',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
}

// Priority configuration
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
  normal: {
    label: 'Normal',
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
      label: 'Title',
      sortable: true,
    },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (value) => {
        const vendor = value as JobOrder['vendor']
        return vendor?.name || '—'
      },
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => {
        const priority = value as string
        return JOB_ORDER_PRIORITY_CONFIG[priority]?.label || priority || '—'
      },
    },
    {
      key: 'rate_max',
      label: 'Rate',
      render: (value, entity) => {
        const jo = entity as JobOrder
        if (jo.rate_max) {
          return `$${jo.rate_max}/${jo.rate_type || 'hr'}`
        }
        return '—'
      },
    },
    {
      key: 'submissions_count',
      label: 'Submissions',
      format: 'number',
    },
    {
      key: 'start_date',
      label: 'Start Date',
      format: 'date',
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

  useListQuery: () => {
    // TODO: Implement jobOrders router
    // For now, return empty data
    return {
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data: { items: [], total: 0 } }),
    } as any
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
      key: 'start_date',
      icon: Calendar,
      format: (value) => {
        if (!value) return ''
        return new Date(value as string).toLocaleDateString()
      },
    },
    {
      key: 'rate_max',
      icon: DollarSign,
      format: (value, entity) => {
        const jo = entity as JobOrder
        if (jo?.rate_max) return `$${jo.rate_max}/${jo?.rate_type || 'hr'}`
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
      getValue: (entity) => (entity as JobOrder).submissions_count || 0,
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
        return `${jo.positions_filled || 0}/${jo.positions_count || 1}`
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

  useEntityQuery: () => {
    // TODO: Implement jobOrders router
    // For now, return empty data
    return {
      data: undefined,
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data: undefined }),
    } as any
  },
}

