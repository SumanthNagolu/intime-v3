import { Clock, FileText, Calendar, DollarSign, CheckCircle, AlertCircle, Send, Eye, XCircle, Pencil, Trash2 } from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig, StatCardConfig, FilterConfig, ColumnConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// ============================================
// TIMESHEETS-01: Timesheet Management Config
// PCF configuration for timesheets list and detail views
// ============================================

// ============================================
// TYPES
// ============================================

export interface Timesheet {
  [key: string]: unknown
  id: string
  orgId: string
  placementId: string
  periodStart: string
  periodEnd: string
  periodType: string
  totalRegularHours: number
  totalOvertimeHours: number
  totalDoubleTimeHours: number
  totalPtoHours: number
  totalHolidayHours: number
  totalBillableAmount: number
  totalPayableAmount: number
  rateSnapshot: Record<string, unknown> | null
  status: TimesheetStatus
  submittedAt: string | null
  submittedBy: string | null
  clientApprovalStatus: string | null
  clientApprovedAt: string | null
  clientApprovedBy: string | null
  clientApprovalNotes: string | null
  internalApprovalStatus: string | null
  internalApprovedAt: string | null
  internalApprovedBy: string | null
  internalApprovalNotes: string | null
  processedAt: string | null
  processedBy: string | null
  invoiceId: string | null
  payrollRunId: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  // Joined relations
  placement?: {
    id: string
    job?: { id: string; title: string }
    candidate?: { id: string; first_name: string; last_name: string }
  }
  submitter?: { id: string; full_name: string }
}

export interface TimesheetEntry {
  id: string
  timesheetId: string
  workDate: string
  regularHours: number
  overtimeHours: number
  doubleTimeHours: number
  ptoHours: number
  holidayHours: number
  startTime: string | null
  endTime: string | null
  breakMinutes: number | null
  projectId: string | null
  taskCode: string | null
  costCenter: string | null
  isBillable: boolean
  billRate: number | null
  payRate: number | null
  billableAmount: number
  payableAmount: number
  description: string | null
  internalNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface TimesheetExpense {
  id: string
  timesheetId: string
  expenseDate: string
  category: string
  description: string
  amount: number
  isBillable: boolean
  isReimbursable: boolean
  receiptUrl: string | null
  receiptVerified: boolean
  verifiedBy: string | null
  verifiedAt: string | null
  notes: string | null
  createdAt: string
}

export type TimesheetStatus =
  | 'draft'
  | 'submitted'
  | 'pending_client_approval'
  | 'client_approved'
  | 'client_rejected'
  | 'pending_internal_approval'
  | 'internal_approved'
  | 'internal_rejected'
  | 'approved'
  | 'processed'
  | 'void'

export type PeriodType = 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly'

// ============================================
// STATUS CONFIGURATION
// ============================================

export const TIMESHEET_STATUS_CONFIG: Record<TimesheetStatus, {
  label: string
  color: string
  bgColor: string
  textColor: string
  icon: typeof Clock
}> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-200',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-700',
    icon: Pencil,
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: Send,
  },
  pending_client_approval: {
    label: 'Pending Client',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: Clock,
  },
  client_approved: {
    label: 'Client Approved',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: CheckCircle,
  },
  client_rejected: {
    label: 'Client Rejected',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: XCircle,
  },
  pending_internal_approval: {
    label: 'Pending Internal',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: Eye,
  },
  internal_approved: {
    label: 'Internal Approved',
    color: 'bg-teal-500',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    icon: CheckCircle,
  },
  internal_rejected: {
    label: 'Internal Rejected',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: XCircle,
  },
  approved: {
    label: 'Approved',
    color: 'bg-success-500',
    bgColor: 'bg-success-50',
    textColor: 'text-success-700',
    icon: CheckCircle,
  },
  processed: {
    label: 'Processed',
    color: 'bg-gold-500',
    bgColor: 'bg-gold-50',
    textColor: 'text-gold-700',
    icon: FileText,
  },
  void: {
    label: 'Void',
    color: 'bg-charcoal-500',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: AlertCircle,
  },
}

export const PERIOD_TYPE_CONFIG: Record<PeriodType, { label: string; days: number }> = {
  weekly: { label: 'Weekly', days: 7 },
  bi_weekly: { label: 'Bi-Weekly', days: 14 },
  semi_monthly: { label: 'Semi-Monthly', days: 15 },
  monthly: { label: 'Monthly', days: 30 },
}

export const EXPENSE_CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'lodging', label: 'Lodging' },
  { value: 'meals', label: 'Meals' },
  { value: 'mileage', label: 'Mileage' },
  { value: 'parking', label: 'Parking' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'communication', label: 'Communication' },
  { value: 'other', label: 'Other' },
] as const

// ============================================
// LIST VIEW CONFIG
// ============================================

const statsCards: StatCardConfig[] = [
  {
    key: 'total',
    label: 'Total Timesheets',
    icon: Clock,
  },
  {
    key: 'pendingApproval',
    label: 'Pending Approval',
    color: 'bg-amber-100 text-amber-800',
  },
  {
    key: 'approved',
    label: 'Approved',
    color: 'bg-success-100 text-success-800',
  },
  {
    key: 'uninvoiced',
    label: 'Uninvoiced',
    color: 'bg-blue-100 text-blue-800',
  },
]

const filters: FilterConfig[] = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search timesheets...',
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    placeholder: 'All Statuses',
    options: Object.entries(TIMESHEET_STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
  {
    key: 'periodType',
    type: 'select',
    label: 'Period Type',
    placeholder: 'All Periods',
    options: Object.entries(PERIOD_TYPE_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
]

const columns: ColumnConfig<Timesheet>[] = [
  {
    key: 'period',
    header: 'Period',
    sortable: true,
    width: 'min-w-[180px]',
    render: (_value: unknown, row: Timesheet) => {
      const start = new Date(row.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const end = new Date(row.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${start} - ${end}`
    },
  },
  {
    key: 'consultant',
    header: 'Consultant',
    width: 'min-w-[200px]',
    render: (_value: unknown, row: Timesheet) => {
      const candidate = row.placement?.candidate
      if (!candidate) return '-'
      return `${candidate.first_name} ${candidate.last_name}`
    },
  },
  {
    key: 'job',
    header: 'Job',
    width: 'min-w-[180px]',
    render: (_value: unknown, row: Timesheet) => row.placement?.job?.title || '-',
  },
  {
    key: 'totalHours',
    header: 'Hours',
    sortable: true,
    align: 'right',
    width: 'w-[100px]',
    render: (_value: unknown, row: Timesheet) => {
      const total = row.totalRegularHours + row.totalOvertimeHours + row.totalDoubleTimeHours
      return total.toFixed(1)
    },
  },
  {
    key: 'totalBillableAmount',
    header: 'Billable',
    sortable: true,
    align: 'right',
    width: 'w-[120px]',
    render: (value: unknown) => `$${(value as number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: 'w-[140px]',
    format: 'status' as const,
  },
  {
    key: 'submittedAt',
    header: 'Submitted',
    sortable: true,
    width: 'w-[120px]',
    format: 'relative-date' as const,
  },
]

// Sort field mapping (frontend keys to backend columns)
const sortFieldMap: Record<string, string> = {
  period_start: 'period_start',
  period_end: 'period_end',
  total_regular_hours: 'total_regular_hours',
  total_billable_amount: 'total_billable_amount',
  status: 'status',
  submitted_at: 'submitted_at',
  created_at: 'created_at',
}

export const timesheetsListConfig: ListViewConfig<Timesheet> = {
  entityType: 'timesheet',
  entityName: {
    singular: 'Timesheet',
    plural: 'Timesheets',
  },
  baseRoute: '/employee/recruiting/timesheets',
  title: 'Timesheets',
  icon: Clock,

  // Stats
  statsCards,

  // Filters
  filters,

  // Columns
  columns,

  // Render mode
  renderMode: 'table',
  statusField: 'status',
  statusConfig: TIMESHEET_STATUS_CONFIG,

  // Sort field mapping
  sortFieldMap,

  // Actions
  primaryAction: {
    label: 'New Timesheet',
    icon: Clock,
    href: '/employee/recruiting/timesheets/new',
  },

  // Empty state
  emptyState: {
    icon: Clock,
    title: 'No timesheets yet',
    description: 'Create your first timesheet to start tracking time and expenses.',
    action: {
      label: 'New Timesheet',
      href: '/employee/recruiting/timesheets/new',
    },
  },

  // Data hooks
  useListQuery: (filters: Record<string, unknown>) => {
    const page = (filters.page as number | undefined) || 1
    const pageSize = (filters.pageSize as number | undefined) || 50
    return trpc.timesheets.list.useQuery({
      search: filters.search as string | undefined,
      status: filters.status as TimesheetStatus | undefined,
      periodType: filters.periodType as PeriodType | undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      sortBy: (sortFieldMap[filters.sortBy as string] || 'period_start') as 'period_start' | 'period_end' | 'status' | 'total_billable_amount' | 'created_at' | 'submitted_at',
      sortOrder: (filters.sortOrder as 'asc' | 'desc') || 'desc',
    })
  },

  useStatsQuery: () => {
    return trpc.timesheets.stats.useQuery()
  },
}

// ============================================
// DETAIL VIEW CONFIG
// ============================================

export const timesheetsDetailConfig: DetailViewConfig<Timesheet> = {
  entityType: 'timesheet',
  baseRoute: '/employee/recruiting/timesheets',

  // Header configuration
  titleField: 'periodStart',
  titleFormatter: (entity: Timesheet) => {
    const start = new Date(entity.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const end = new Date(entity.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${start} - ${end}`
  },
  subtitleFields: [
    {
      key: 'placementId',
      format: (_value: unknown, entity?: unknown) => {
        const ts = entity as Timesheet
        const candidate = ts?.placement?.candidate
        if (!candidate) return ''
        return `${candidate.first_name} ${candidate.last_name}`
      },
    },
  ],

  // Status configuration
  statusField: 'status',
  statusConfig: TIMESHEET_STATUS_CONFIG,

  // Navigation mode
  navigationMode: 'sections',
  defaultSection: 'overview',

  // Sections
  sections: [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'entries', label: 'Time Entries', icon: Calendar },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'activities', label: 'Activities', icon: FileText },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'history', label: 'History', icon: Clock },
  ],

  // Quick actions (header)
  quickActions: [
    {
      id: 'submit',
      label: 'Submit',
      icon: Send,
      variant: 'default',
      onClick: (entity: unknown) => {
        console.log('Submit timesheet:', (entity as Timesheet).id)
      },
      isVisible: (entity: unknown) => (entity as Timesheet).status === 'draft',
    },
    {
      id: 'approve',
      label: 'Approve',
      icon: CheckCircle,
      variant: 'default',
      onClick: (entity: unknown) => {
        console.log('Approve timesheet:', (entity as Timesheet).id)
      },
      isVisible: (entity: unknown) => ['submitted', 'pending_client_approval', 'pending_internal_approval', 'client_approved', 'internal_approved'].includes((entity as Timesheet).status),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: (entity: unknown) => {
        console.log('Edit timesheet:', (entity as Timesheet).id)
      },
      isVisible: (entity: unknown) => (entity as Timesheet).status === 'draft',
    },
  ],

  // Dropdown actions
  dropdownActions: [
    {
      label: 'Reject',
      icon: XCircle,
      onClick: (entity: Timesheet) => {
        console.log('Reject timesheet:', entity.id)
      },
      isVisible: (entity: Timesheet) => ['submitted', 'pending_client_approval', 'pending_internal_approval'].includes(entity.status),
    },
    {
      label: 'Void Timesheet',
      icon: AlertCircle,
      variant: 'destructive',
      onClick: (entity: Timesheet) => {
        console.log('Void timesheet:', entity.id)
      },
      isVisible: (entity: Timesheet) => !entity.invoiceId && !entity.payrollRunId && entity.status !== 'void',
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (entity: Timesheet) => {
        console.log('Delete timesheet:', entity.id)
      },
      isVisible: (entity: Timesheet) => entity.status === 'draft',
    },
  ],

  // Data hooks
  useEntityQuery: (id: string) => {
    return trpc.timesheets.getById.useQuery({ id })
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getTimesheetStatusLabel(status: TimesheetStatus): string {
  return TIMESHEET_STATUS_CONFIG[status]?.label || status
}

export function getTimesheetStatusColor(status: TimesheetStatus): string {
  return TIMESHEET_STATUS_CONFIG[status]?.color || 'bg-charcoal-200'
}

export function getPeriodTypeLabel(periodType: PeriodType): string {
  return PERIOD_TYPE_CONFIG[periodType]?.label || periodType
}

export function calculateTotalHours(entry: TimesheetEntry): number {
  return entry.regularHours + entry.overtimeHours + entry.doubleTimeHours + entry.ptoHours + entry.holidayHours
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatHours(hours: number): string {
  return hours.toFixed(1)
}

export function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} - ${endStr}`
}
