import {
  Users,
  Plus,
  CheckCircle,
  Pause,
  Briefcase,
  Target,
  Trophy,
  UserCheck,
} from 'lucide-react'
import { ListViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// Type definition for Pod entity
export interface Pod extends Record<string, unknown> {
  id: string
  name: string
  description?: string
  pod_type: string
  podType?: string
  status: string
  sprint_duration_weeks?: number
  placements_per_sprint_target?: number
  total_placements?: number
  current_sprint_placements?: number
  is_active?: boolean
  formed_date?: string
  dissolved_date?: string
  created_at: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  memberCount?: number
  manager?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  } | null
  region?: {
    id: string
    name: string
    code: string
  } | null
  members?: Array<{
    id: string
    role: string
    is_active: boolean
    user?: {
      id: string
      full_name: string
      email: string
      avatar_url?: string
    }
  }>
}

// Pod status configuration
export const POD_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: Pause,
  },
}

// Pod type configuration
export const POD_TYPE_CONFIG: Record<string, StatusConfig> = {
  recruiting: {
    label: 'Recruiting',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Users,
  },
  bench_sales: {
    label: 'Bench Sales',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Briefcase,
  },
  ta: {
    label: 'Talent Acquisition',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    icon: Target,
  },
  hr: {
    label: 'HR',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: UserCheck,
  },
  mixed: {
    label: 'Mixed',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: Users,
  },
}

// Pods List View Configuration
export const podsListConfig: ListViewConfig<Pod> = {
  entityType: 'pod',
  entityName: { singular: 'Pod', plural: 'Pods' },
  baseRoute: '/employee/hr/pods',

  title: 'Pods',
  description: 'Manage team pods and track sprint performance',
  icon: Users,

  primaryAction: {
    label: 'Create Pod',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openPodDialog', { detail: { dialogId: 'create' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Pods',
      icon: Users,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'avgSize',
      label: 'Avg Size',
      color: 'bg-blue-100 text-blue-800',
      icon: Users,
    },
    {
      key: 'totalMembers',
      label: 'Total Members',
      color: 'bg-purple-100 text-purple-800',
      icon: UserCheck,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Pods',
      placeholder: 'Search pods...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(POD_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'podType',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(POD_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      header: 'Pod Name',
      label: 'Pod Name',
      sortable: true,
      width: 'min-w-[180px]',
    },
    {
      key: 'podType',
      header: 'Type',
      label: 'Type',
      sortable: true,
      width: 'w-[100px]',
      render: (value, item) => {
        const pod = item as Pod
        const type = pod.podType || pod.pod_type
        return POD_TYPE_CONFIG[type]?.label || type
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
      key: 'manager',
      header: 'Pod Lead',
      label: 'Pod Lead',
      sortable: true,
      width: 'w-[150px]',
      render: (value, item) => {
        const pod = item as Pod
        return pod.manager?.full_name || '—'
      },
    },
    {
      key: 'memberCount',
      header: 'Members',
      label: 'Members',
      sortable: true,
      width: 'w-[80px]',
      align: 'right' as const,
      render: (value, item) => {
        const pod = item as Pod
        return pod.memberCount ?? pod.members?.filter((m) => m.is_active).length ?? 0
      },
    },
    {
      key: 'focus',
      header: 'Focus Area',
      label: 'Focus Area',
      width: 'w-[140px]',
      render: (value, item) => {
        const pod = item as Pod
        return pod.description || '—'
      },
    },
    {
      key: 'placements_per_sprint_target',
      header: 'Sprint Target',
      label: 'Sprint Target',
      width: 'w-[100px]',
      align: 'right' as const,
      render: (value, item) => {
        const pod = item as Pod
        return pod.placements_per_sprint_target ?? '—'
      },
    },
    {
      key: 'total_placements',
      header: 'Placements',
      label: 'Placements',
      sortable: true,
      width: 'w-[100px]',
      align: 'right' as const,
      render: (value, item) => {
        const pod = item as Pod
        return pod.total_placements ?? 0
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      label: 'Created',
      sortable: true,
      width: 'w-[100px]',
      format: 'relative-date' as const,
      render: (value, item) => {
        const pod = item as Pod
        return pod.createdAt || pod.created_at
      },
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: POD_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Users,
    title: 'No pods found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first pod to organize your teams',
    action: {
      label: 'Create Pod',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openPodDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const podTypeValue = filters.podType as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['active', 'inactive', 'all'] as const
    const validPodTypes = ['recruiting', 'bench_sales', 'ta', 'hr', 'mixed'] as const
    const validSortFields = ['created_at', 'name', 'pod_type', 'status'] as const

    type PodStatus = (typeof validStatuses)[number]
    type PodType = (typeof validPodTypes)[number]
    type SortField = (typeof validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      podType: 'pod_type',
      status: 'status',
      createdAt: 'created_at',
      manager: 'created_at', // Manager sorting not directly supported
      memberCount: 'created_at', // Member count sorting not directly supported
      total_placements: 'created_at', // Placements sorting not directly supported
    }

    const mappedSortBy =
      sortByValue && sortFieldMap[sortByValue] ? sortFieldMap[sortByValue] : 'created_at'

    return trpc.pods.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as PodStatus)
        ? statusValue
        : undefined) as PodStatus | undefined,
      podType: (podTypeValue && validPodTypes.includes(podTypeValue as PodType)
        ? podTypeValue
        : undefined) as PodType | undefined,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc',
    })
  },

  // Stats query for metrics cards
  useStatsQuery: () => {
    return trpc.pods.stats.useQuery()
  },
}
