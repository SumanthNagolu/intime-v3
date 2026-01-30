import {
  Building2,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Archive,
  Network,
} from 'lucide-react'
import { ListViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// Type definition for Department entity
export interface Department extends Record<string, unknown> {
  id: string
  name: string
  code?: string
  description?: string
  parentId?: string
  headId?: string
  costCenterCode?: string
  budgetAmount?: number
  status: string
  hierarchyLevel?: number
  createdAt: string
  updatedAt?: string
  head?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  } | null
  parent?: {
    id: string
    name: string
    code?: string
  } | null
  headcount?: number
}

// Department status configuration
export const DEPARTMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
  archived: {
    label: 'Archived',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: Archive,
  },
}

// Departments List View Configuration
export const departmentsListConfig: ListViewConfig<Department> = {
  entityType: 'department',
  entityName: { singular: 'Department', plural: 'Departments' },
  baseRoute: '/employee/operations/departments',

  title: 'Departments',
  description: 'Manage organizational departments and hierarchy',
  icon: Building2,

  primaryAction: {
    label: 'Add Department',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openDepartmentDialog', { detail: { dialogId: 'create' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Departments',
      icon: Building2,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'totalEmployees',
      label: 'Total Employees',
      color: 'bg-blue-100 text-blue-800',
      icon: Users,
    },
    {
      key: 'avgSize',
      label: 'Avg. Size',
      color: 'bg-purple-100 text-purple-800',
      icon: Network,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Departments',
      placeholder: 'Search by name, code...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(DEPARTMENT_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      header: 'Name',
      label: 'Name',
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
      key: 'headcount',
      header: 'Headcount',
      label: 'Headcount',
      width: 'w-[100px]',
      align: 'center',
      render: (value) => String(value ?? 0),
    },
    {
      key: 'head',
      header: 'Department Head',
      label: 'Department Head',
      width: 'w-[180px]',
      render: (value) => {
        const head = value as Department['head']
        return head?.full_name || '—'
      },
    },
    {
      key: 'parent',
      header: 'Parent',
      label: 'Parent',
      width: 'w-[150px]',
      render: (value) => {
        const parent = value as Department['parent']
        return parent?.name || '—'
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
      key: 'costCenterCode',
      header: 'Cost Center',
      label: 'Cost Center',
      width: 'w-[120px]',
      render: (value) => (value as string) || '—',
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: DEPARTMENT_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Building2,
    title: 'No departments found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first department to get started',
    action: {
      label: 'Add Department',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openDepartmentDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['active', 'inactive', 'archived', 'all'] as const
    type DepartmentStatus = (typeof validStatuses)[number]

    const validSortFields = ['created_at', 'name', 'code', 'status', 'headcount'] as const
    type SortField = (typeof validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      code: 'code',
      status: 'status',
      headcount: 'headcount',
      createdAt: 'created_at',
    }

    const mappedSortBy =
      sortByValue && sortFieldMap[sortByValue] ? sortFieldMap[sortByValue] : 'name'

    return trpc.departments.listWithStats.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as DepartmentStatus)
        ? statusValue
        : 'all') as DepartmentStatus,
      page: ((filters.offset as number) || 0) / ((filters.limit as number) || 20) + 1,
      pageSize: (filters.limit as number) || 20,
    })
  },

  // Stats query for metrics cards (using combined listWithStats)
  useStatsQuery: () => {
    return trpc.departments.stats.useQuery()
  },
}
