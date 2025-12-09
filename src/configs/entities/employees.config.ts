import {
  Users,
  Plus,
  UserCheck,
  UserPlus,
  Building2,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  FileText,
} from 'lucide-react'
import { ListViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// Type definition for Employee entity
export interface Employee extends Record<string, unknown> {
  id: string
  userId: string
  employeeNumber?: string
  status: string
  employmentType: string
  hireDate: string
  terminationDate?: string
  department?: string
  jobTitle?: string
  location?: string
  workMode?: string
  salaryType?: string
  salaryAmount?: number
  currency?: string
  createdAt: string
  updatedAt?: string
  user?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
    phone?: string
  } | null
  manager?: {
    id: string
    user_id: string
    user?: {
      id: string
      full_name: string
      avatar_url?: string
    }
  } | null
}

// Employee status configuration
export const EMPLOYEE_STATUS_CONFIG: Record<string, StatusConfig> = {
  onboarding: {
    label: 'Onboarding',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Clock,
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  on_leave: {
    label: 'On Leave',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Pause,
  },
  terminated: {
    label: 'Terminated',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: AlertCircle,
  },
}

// Employment type configuration
export const EMPLOYMENT_TYPE_CONFIG: Record<string, StatusConfig> = {
  fte: {
    label: 'Full-Time',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Briefcase,
  },
  contractor: {
    label: 'Contractor',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: FileText,
  },
  intern: {
    label: 'Intern',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    icon: UserPlus,
  },
  part_time: {
    label: 'Part-Time',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
}

// Employees List View Configuration
export const employeesListConfig: ListViewConfig<Employee> = {
  entityType: 'employee',
  entityName: { singular: 'Employee', plural: 'Employees' },
  baseRoute: '/employee/hr/employees',

  title: 'Employees',
  description: 'Manage internal staff and employee records',
  icon: Users,

  primaryAction: {
    label: 'Add Employee',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openEmployeeDialog', { detail: { dialogId: 'create' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Employees',
      icon: Users,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: UserCheck,
    },
    {
      key: 'newThisMonth',
      label: 'New This Month',
      color: 'bg-blue-100 text-blue-800',
      icon: UserPlus,
    },
    {
      key: 'byDepartment',
      label: 'Departments',
      color: 'bg-purple-100 text-purple-800',
      icon: Building2,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Employees',
      placeholder: 'Search by name, title, department...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(EMPLOYEE_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'employmentType',
      type: 'select',
      label: 'Employment Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(EMPLOYMENT_TYPE_CONFIG).map(([value, config]) => ({
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
      width: 'min-w-[180px]',
      render: (value, item) => {
        const employee = item as Employee
        const user = employee.user
        return user?.full_name || '—'
      },
    },
    {
      key: 'jobTitle',
      header: 'Title',
      label: 'Title',
      sortable: true,
      width: 'w-[150px]',
    },
    {
      key: 'department',
      header: 'Department',
      label: 'Department',
      sortable: true,
      width: 'w-[120px]',
      render: (value) => {
        const dept = value as string | undefined
        if (!dept) return '—'
        // Format department name
        return dept.charAt(0).toUpperCase() + dept.slice(1).replace(/_/g, ' ')
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
      key: 'email',
      header: 'Email',
      label: 'Email',
      width: 'w-[180px]',
      render: (value, item) => {
        const employee = item as Employee
        return employee.user?.email || '—'
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      label: 'Phone',
      width: 'w-[120px]',
      render: (value, item) => {
        const employee = item as Employee
        return employee.user?.phone || '—'
      },
    },
    {
      key: 'manager',
      header: 'Manager',
      label: 'Manager',
      sortable: true,
      width: 'w-[130px]',
      render: (value, item) => {
        const employee = item as Employee
        return employee.manager?.user?.full_name || '—'
      },
    },
    {
      key: 'employmentType',
      header: 'Type',
      label: 'Type',
      width: 'w-[100px]',
      render: (value) => {
        const type = value as string
        return EMPLOYMENT_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'hireDate',
      header: 'Hired',
      label: 'Hired',
      sortable: true,
      width: 'w-[100px]',
      format: 'date' as const,
    },
    {
      key: 'location',
      header: 'Location',
      label: 'Location',
      sortable: true,
      width: 'w-[130px]',
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: EMPLOYEE_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Users,
    title: 'No employees found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Add your first employee to get started',
    action: {
      label: 'Add Employee',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openEmployeeDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const employmentTypeValue = filters.employmentType as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['onboarding', 'active', 'on_leave', 'terminated', 'all'] as const
    const validEmploymentTypes = ['fte', 'contractor', 'intern', 'part_time', 'all'] as const
    const validSortFields = [
      'created_at',
      'hire_date',
      'employee_number',
      'job_title',
      'department',
      'status',
      'location',
    ] as const

    type EmployeeStatus = (typeof validStatuses)[number]
    type EmploymentType = (typeof validEmploymentTypes)[number]
    type SortField = (typeof validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      name: 'created_at', // User name sorting not directly supported, fallback to created_at
      jobTitle: 'job_title',
      department: 'department',
      status: 'status',
      hireDate: 'hire_date',
      location: 'location',
      createdAt: 'created_at',
      manager: 'created_at', // Manager sorting not directly supported
      employmentType: 'created_at', // Type sorting not directly supported in DB
    }

    const mappedSortBy =
      sortByValue && sortFieldMap[sortByValue] ? sortFieldMap[sortByValue] : 'created_at'

    return trpc.hr.employees.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as EmployeeStatus)
        ? statusValue
        : 'all') as EmployeeStatus,
      employmentType: (employmentTypeValue &&
      validEmploymentTypes.includes(employmentTypeValue as EmploymentType)
        ? employmentTypeValue
        : 'all') as EmploymentType,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc',
    })
  },

  // Stats query for metrics cards
  useStatsQuery: () => {
    return trpc.hr.employees.stats.useQuery()
  },
}
