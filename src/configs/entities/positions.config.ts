import {
  Briefcase,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Snowflake,
  XCircle,
  DollarSign,
  Building2,
} from 'lucide-react'
import { ListViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// Type definition for Position entity
export interface Position extends Record<string, unknown> {
  id: string
  title: string
  code?: string
  description?: string
  departmentId: string
  level?: string
  salaryBandMin?: number
  salaryBandMid?: number
  salaryBandMax?: number
  headcountBudget: number
  status: string
  createdAt: string
  updatedAt?: string
  department?: {
    id: string
    name: string
    code?: string
  } | null
  filledCount?: number
}

// Position status configuration
export const POSITION_STATUS_CONFIG: Record<string, StatusConfig> = {
  open: {
    label: 'Open',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  filled: {
    label: 'Filled',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Users,
  },
  frozen: {
    label: 'Frozen',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Snowflake,
  },
  closed: {
    label: 'Closed',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: XCircle,
  },
}

// Positions List View Configuration
export const positionsListConfig: ListViewConfig<Position> = {
  entityType: 'position',
  entityName: { singular: 'Position', plural: 'Positions' },
  baseRoute: '/employee/operations/positions',

  title: 'Positions',
  description: 'Manage job positions and headcount within departments',
  icon: Briefcase,

  primaryAction: {
    label: 'Add Position',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openPositionDialog', { detail: { dialogId: 'create' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Positions',
      icon: Briefcase,
    },
    {
      key: 'open',
      label: 'Open',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'filled',
      label: 'Filled',
      color: 'bg-blue-100 text-blue-800',
      icon: Users,
    },
    {
      key: 'vacancies',
      label: 'Vacancies',
      color: 'bg-amber-100 text-amber-800',
      icon: Clock,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Positions',
      placeholder: 'Search by title, code...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(POSITION_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'departmentId',
      type: 'select',
      label: 'Department',
      dynamic: true,
      options: [{ value: '', label: 'All Departments' }],
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
      key: 'code',
      header: 'Code',
      label: 'Code',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => (value as string) || '—',
    },
    {
      key: 'department',
      header: 'Department',
      label: 'Department',
      width: 'w-[150px]',
      render: (value) => {
        const dept = value as Position['department']
        return dept?.name || '—'
      },
    },
    {
      key: 'level',
      header: 'Level',
      label: 'Level',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => (value as string) || '—',
    },
    {
      key: 'headcountBudget',
      header: 'Budget',
      label: 'Headcount Budget',
      width: 'w-[80px]',
      align: 'center',
      render: (value) => String(value ?? 0),
    },
    {
      key: 'filledCount',
      header: 'Filled',
      label: 'Filled',
      width: 'w-[80px]',
      align: 'center',
      render: (value) => String(value ?? 0),
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
      key: 'salaryBandMin',
      header: 'Salary Band',
      label: 'Salary Band',
      width: 'w-[150px]',
      render: (value, item) => {
        const pos = item as Position
        if (!pos.salaryBandMin && !pos.salaryBandMax) return '—'
        const min = pos.salaryBandMin ? `$${pos.salaryBandMin.toLocaleString()}` : '—'
        const max = pos.salaryBandMax ? `$${pos.salaryBandMax.toLocaleString()}` : '—'
        return `${min} - ${max}`
      },
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: POSITION_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Briefcase,
    title: 'No positions found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first position to get started',
    action: {
      label: 'Add Position',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openPositionDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const departmentIdValue = filters.departmentId as string | undefined

    const validStatuses = ['open', 'filled', 'frozen', 'closed', 'all'] as const
    type PositionStatus = (typeof validStatuses)[number]

    return trpc.positions.listWithStats.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as PositionStatus)
        ? statusValue
        : 'all') as PositionStatus,
      departmentId: departmentIdValue || undefined,
      page: ((filters.offset as number) || 0) / ((filters.limit as number) || 20) + 1,
      pageSize: (filters.limit as number) || 20,
    })
  },

  // Stats query for metrics cards
  useStatsQuery: () => {
    return trpc.positions.stats.useQuery()
  },
}
