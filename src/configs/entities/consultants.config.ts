import {
  Users,
  Plus,
  Clock,
  Briefcase,
  PieChart,
  Timer,
  CheckCircle,
  AlertCircle,
  Target,
  Play,
  Pause,
  UserCheck,
  MapPin,
  FileText,
  Activity,
} from 'lucide-react'
import { ListViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// Type definition for Consultant (Bench Talent) entity - uses contactBench data shape
export interface Consultant extends Record<string, unknown> {
  id: string
  contactId: string
  benchStatus: string
  benchType?: string | null
  visaType?: string | null
  visaExpiryDate?: string | null
  workAuthStatus?: string | null
  minAcceptableRate?: number | null
  targetRate?: number | null
  currency?: string | null
  willingToRelocate?: boolean | null
  preferredLocations?: string[] | null
  benchSalesRepId?: string | null
  marketingStatus?: string | null
  benchStartDate?: string | null
  createdAt: string
  updatedAt?: string
  // Legacy snake_case aliases for backwards compatibility during transition
  status?: string
  visa_type?: string | null
  visa_expiry_date?: string | null
  work_auth_status?: string | null
  min_acceptable_rate?: number | null
  target_rate?: number | null
  willing_relocate?: boolean | null
  preferred_locations?: string[] | null
  bench_sales_rep_id?: string | null
  marketing_status?: string | null
  bench_start_date?: string | null
  created_at?: string
  updated_at?: string
  // Joined contact (replaces candidate)
  contact?: {
    id: string
    first_name: string
    last_name: string
    email?: string | null
    phone?: string | null
    title?: string | null
  } | null
  // Legacy candidate alias
  candidate?: {
    id: string
    full_name: string
    email?: string | null
    phone?: string | null
    avatar_url?: string | null
    location?: string | null
  } | null
  // Sales rep (replaces bench_sales_rep)
  salesRep?: {
    id: string
    full_name: string
    avatar_url?: string | null
  } | null
  bench_sales_rep?: {
    id: string
    full_name: string
  } | null
}

// Consultant status configuration
export const CONSULTANT_STATUS_CONFIG: Record<string, StatusConfig> = {
  onboarding: {
    label: 'Onboarding',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: FileText,
  },
  available: {
    label: 'Available',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  marketing: {
    label: 'Marketing',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Target,
  },
  interviewing: {
    label: 'Interviewing',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Activity,
  },
  placed: {
    label: 'Placed',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: UserCheck,
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: Pause,
  },
}

// Visa type configuration
export const VISA_TYPE_CONFIG: Record<string, StatusConfig> = {
  h1b: {
    label: 'H-1B',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  opt: {
    label: 'OPT',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  cpt: {
    label: 'CPT',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
  },
  gc: {
    label: 'Green Card',
    color: 'bg-emerald-100 text-emerald-800',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
  },
  citizen: {
    label: 'US Citizen',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
  },
  l1: {
    label: 'L-1',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  tn: {
    label: 'TN',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  ead: {
    label: 'EAD',
    color: 'bg-teal-100 text-teal-800',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
  },
}

// Marketing status configuration
export const MARKETING_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: FileText,
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Play,
  },
  paused: {
    label: 'Paused',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Pause,
  },
  archived: {
    label: 'Archived',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: AlertCircle,
  },
}

// Helper function to calculate days on bench
function calculateDaysOnBench(benchStartDate: string | null | undefined): number {
  if (!benchStartDate) return 0
  const start = new Date(benchStartDate)
  const now = new Date()
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

// Consultants List View Configuration
export const consultantsListConfig: ListViewConfig<Consultant> = {
  entityType: 'consultant',
  entityName: { singular: 'Consultant', plural: 'Consultants' },
  baseRoute: '/employee/bench/consultants',

  title: 'Consultants',
  description: 'Manage bench consultants and their placements',
  icon: Users,

  primaryAction: {
    label: 'Add Consultant',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(
        new CustomEvent('openConsultantDialog', { detail: { dialogId: 'create' } })
      )
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Consultants',
      icon: Users,
    },
    {
      key: 'onBench',
      label: 'On Bench',
      color: 'bg-blue-100 text-blue-800',
      icon: Clock,
    },
    {
      key: 'deployed',
      label: 'Deployed',
      color: 'bg-green-100 text-green-800',
      icon: Briefcase,
    },
    {
      key: 'utilization',
      label: 'Utilization Rate',
      color: 'bg-purple-100 text-purple-800',
      icon: PieChart,
      format: (value: number) => `${value}%`,
    },
    {
      key: 'avgDaysOnBench',
      label: 'Avg Days on Bench',
      icon: Timer,
      format: (value: number) => `${value} days`,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Consultants',
      placeholder: 'Search by name...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(CONSULTANT_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'visaType',
      type: 'select',
      label: 'Visa Type',
      options: [
        { value: '', label: 'All Visa Types' },
        ...Object.entries(VISA_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'marketingStatus',
      type: 'select',
      label: 'Marketing',
      options: [
        { value: 'all', label: 'All Marketing' },
        ...Object.entries(MARKETING_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'contact',
      header: 'Name',
      label: 'Name',
      sortable: false, // Can't sort on joined field directly
      width: 'min-w-[180px]',
      render: (value, entity) => {
        const consultant = entity as Consultant
        // Handle both new contact shape and legacy candidate shape
        const contact = consultant.contact
        const candidate = consultant.candidate
        if (contact) {
          return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || '—'
        }
        return candidate?.full_name || '—'
      },
    },
    {
      key: 'contact',
      header: 'Title',
      label: 'Title',
      width: 'w-[130px]',
      render: (value, entity) => {
        const consultant = entity as Consultant
        const contact = consultant.contact
        return contact?.title || '—'
      },
    },
    {
      key: 'benchStatus',
      header: 'Status',
      label: 'Status',
      sortable: true,
      width: 'w-[100px]',
      render: (value, entity) => {
        const consultant = entity as Consultant
        // Handle both camelCase and snake_case
        const status = consultant.benchStatus || consultant.status
        return status || '—'
      },
      format: 'status' as const,
    },
    {
      key: 'visaType',
      header: 'Visa',
      label: 'Visa',
      sortable: false, // Can't sort directly on this field
      width: 'w-[80px]',
      render: (value, entity) => {
        const consultant = entity as Consultant
        const visaType = consultant.visaType || consultant.visa_type
        if (!visaType) return '—'
        const config = VISA_TYPE_CONFIG[visaType.toLowerCase()]
        return config?.label || visaType.toUpperCase()
      },
    },
    {
      key: 'targetRate',
      header: 'Bill Rate',
      label: 'Bill Rate',
      sortable: true,
      width: 'w-[100px]',
      align: 'right' as const,
      render: (value, entity) => {
        const consultant = entity as Consultant
        const rate = consultant.targetRate || consultant.target_rate
        if (!rate) return '—'
        const currency = consultant.currency || 'USD'
        return `$${rate}/${currency === 'USD' ? 'hr' : currency}`
      },
    },
    {
      key: 'benchStartDate',
      header: 'Days on Bench',
      label: 'Days on Bench',
      sortable: true,
      width: 'w-[100px]',
      align: 'right' as const,
      render: (value, entity) => {
        const consultant = entity as Consultant
        const status = consultant.benchStatus || consultant.status
        if (status !== 'available') return '—'
        const benchStart = consultant.benchStartDate || consultant.bench_start_date
        const days = calculateDaysOnBench(benchStart)
        return String(days)
      },
    },
    {
      key: 'marketingStatus',
      header: 'Marketing',
      label: 'Marketing',
      width: 'w-[100px]',
      render: (value, entity) => {
        const consultant = entity as Consultant
        const status = consultant.marketingStatus || consultant.marketing_status
        if (!status) return '—'
        const config = MARKETING_STATUS_CONFIG[status]
        return config?.label || status
      },
    },
    {
      key: 'salesRep',
      header: 'Owner',
      label: 'Owner',
      width: 'w-[130px]',
      render: (value, entity) => {
        const consultant = entity as Consultant
        // Handle both salesRep and bench_sales_rep
        const rep = consultant.salesRep || consultant.bench_sales_rep
        return rep?.full_name || '—'
      },
    },
    {
      key: 'benchStartDate',
      header: 'Bench Start',
      label: 'Bench Start',
      sortable: true,
      width: 'w-[100px]',
      render: (value, entity) => {
        const consultant = entity as Consultant
        const benchStart = consultant.benchStartDate || consultant.bench_start_date
        return benchStart || '—'
      },
      format: 'date' as const,
    },
    {
      key: 'createdAt',
      header: 'Created',
      label: 'Created',
      sortable: true,
      width: 'w-[100px]',
      render: (value, entity) => {
        const consultant = entity as Consultant
        return consultant.createdAt || consultant.created_at || '—'
      },
      format: 'relative-date' as const,
    },
  ],

  renderMode: 'table',
  statusField: 'benchStatus', // Use camelCase field from contactBench router
  statusConfig: CONSULTANT_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Users,
    title: 'No consultants found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Add your first consultant to start tracking bench talent',
    action: {
      label: 'Add Consultant',
      onClick: () => {
        window.dispatchEvent(
          new CustomEvent('openConsultantDialog', { detail: { dialogId: 'create' } })
        )
      },
    },
  },

  // tRPC hooks for data fetching - uses contactBench router
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const visaTypeValue = filters.visaType as string | undefined
    const marketingStatusValue = filters.marketingStatus as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['onboarding', 'available', 'marketing', 'interviewing', 'placed', 'inactive'] as const
    const validMarketingStatuses = ['draft', 'active', 'paused', 'archived'] as const
    const validSortFields = ['bench_start_date', 'bench_status', 'marketing_status', 'target_rate', 'created_at'] as const

    type BenchStatus = (typeof validStatuses)[number]
    type MarketingStatus = (typeof validMarketingStatuses)[number]
    type SortField = (typeof validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      status: 'bench_status',
      benchStatus: 'bench_status',
      visa_type: 'bench_status', // No direct visa sort, fallback
      target_rate: 'target_rate',
      bench_start_date: 'bench_start_date',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'bench_start_date'

    return trpc.contactBench.list.useQuery({
      search: filters.search as string | undefined,
      benchStatus: (statusValue && validStatuses.includes(statusValue as BenchStatus))
        ? (statusValue as BenchStatus)
        : undefined,
      marketingStatus: (marketingStatusValue && validMarketingStatuses.includes(marketingStatusValue as MarketingStatus))
        ? (marketingStatusValue as MarketingStatus)
        : undefined,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  // Stats query for metrics cards - uses contactBench router
  useStatsQuery: () => {
    return trpc.contactBench.stats.useQuery({})
  },
}
