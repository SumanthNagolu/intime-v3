import { DollarSign, Clock, CheckCircle, AlertCircle, Send, XCircle, Pencil, Trash2, Users, Calculator, Play, Ban, FileText, CreditCard } from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig, StatCardConfig, FilterConfig, ColumnConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// ============================================
// PAYROLL-01: Payroll Management Config
// PCF configuration for pay runs list and detail views
// ============================================

// ============================================
// TYPES
// ============================================

export interface PayRun {
  [key: string]: unknown
  id: string
  orgId: string
  payPeriodId: string
  runNumber: string
  runType: PayRunType
  checkDate: string
  directDepositDate: string | null
  totalGross: number
  totalEmployerTaxes: number
  totalEmployeeTaxes: number
  totalDeductions: number
  totalNet: number
  totalEmployerCost: number
  employeeCount: number
  consultantCount: number
  contractorCount: number
  status: PayRunStatus
  calculatedAt: string | null
  approvedAt: string | null
  approvedBy: string | null
  submittedAt: string | null
  processedAt: string | null
  payrollProvider: string | null
  externalRunId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  // Joined relations
  payPeriod?: {
    id: string
    period_start: string
    period_end: string
    period_type: string
  }
  approver?: {
    id: string
    full_name: string
  }
  payItems?: PayItem[]
}

export interface PayItem {
  id: string
  payRunId: string
  workerType: WorkerType
  workerId: string
  contactId: string | null
  payType: PayType
  timesheetIds: string[] | null
  // Hours
  regularHours: number
  overtimeHours: number
  doubleTimeHours: number
  ptoHours: number
  holidayHours: number
  totalHours: number
  // Rates
  regularRate: number | null
  overtimeRate: number | null
  doubleTimeRate: number | null
  // Earnings
  regularEarnings: number
  overtimeEarnings: number
  doubleTimeEarnings: number
  ptoEarnings: number
  holidayEarnings: number
  bonusEarnings: number
  otherEarnings: number
  grossPay: number
  // Employee taxes
  federalIncomeTax: number
  stateIncomeTax: number
  localIncomeTax: number
  socialSecurityTax: number
  medicareTax: number
  totalEmployeeTaxes: number
  // Employer taxes
  employerSocialSecurity: number
  employerMedicare: number
  employerFuta: number
  employerSuta: number
  totalEmployerTaxes: number
  // Deductions
  preTaxDeductions: number
  postTaxDeductions: number
  garnishments: number
  totalDeductions: number
  // Net pay
  netPay: number
  // Payment
  paymentMethod: string
  bankAccountLast4: string | null
  checkNumber: string | null
  status: string
  createdAt: string
  // Joined relations
  contact?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export interface PayPeriod {
  id: string
  orgId: string
  periodNumber: number
  year: number
  periodStart: string
  periodEnd: string
  payDate: string
  periodType: PeriodType
  status: PayPeriodStatus
  timesheetCutoff: string | null
  createdAt: string
}

export type PayRunStatus =
  | 'draft'
  | 'calculating'
  | 'pending_approval'
  | 'approved'
  | 'submitted'
  | 'processing'
  | 'completed'
  | 'void'

export type PayRunType = 'regular' | 'off_cycle' | 'bonus' | 'final' | 'correction'

export type WorkerType = 'employee' | 'consultant' | 'contractor'

export type PayType = 'hourly' | 'salary' | 'commission' | 'bonus' | 'reimbursement'

export type PeriodType = 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly'

export type PayPeriodStatus = 'upcoming' | 'current' | 'processing' | 'closed'

// ============================================
// STATUS CONFIGURATION
// ============================================

export const PAY_RUN_STATUS_CONFIG: Record<PayRunStatus, StatusConfig & { icon: typeof Clock }> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-200',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-700',
    icon: Pencil,
  },
  calculating: {
    label: 'Calculating',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: Calculator,
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: 'bg-teal-500',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    icon: CheckCircle,
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    icon: Send,
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: Play,
  },
  completed: {
    label: 'Completed',
    color: 'bg-success-500',
    bgColor: 'bg-success-50',
    textColor: 'text-success-700',
    icon: CheckCircle,
  },
  void: {
    label: 'Void',
    color: 'bg-charcoal-500',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: Ban,
  },
}

export const PAY_RUN_TYPE_CONFIG: Record<PayRunType, { label: string; description: string }> = {
  regular: { label: 'Regular', description: 'Standard scheduled payroll run' },
  off_cycle: { label: 'Off-Cycle', description: 'Additional run outside normal schedule' },
  bonus: { label: 'Bonus', description: 'Bonus payment run' },
  final: { label: 'Final', description: 'Final pay for terminated workers' },
  correction: { label: 'Correction', description: 'Correction to previous run' },
}

export const WORKER_TYPE_CONFIG: Record<WorkerType, { label: string; color: string }> = {
  employee: { label: 'Employee', color: 'bg-blue-100 text-blue-800' },
  consultant: { label: 'Consultant', color: 'bg-purple-100 text-purple-800' },
  contractor: { label: 'Contractor', color: 'bg-amber-100 text-amber-800' },
}

export const PERIOD_TYPE_CONFIG: Record<PeriodType, { label: string; description: string }> = {
  weekly: { label: 'Weekly', description: '52 pay periods per year' },
  bi_weekly: { label: 'Bi-Weekly', description: '26 pay periods per year' },
  semi_monthly: { label: 'Semi-Monthly', description: '24 pay periods per year' },
  monthly: { label: 'Monthly', description: '12 pay periods per year' },
}

export const PAY_PERIOD_STATUS_CONFIG: Record<PayPeriodStatus, StatusConfig> = {
  upcoming: {
    label: 'Upcoming',
    color: 'bg-charcoal-200',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-700',
  },
  current: {
    label: 'Current',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  processing: {
    label: 'Processing',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  closed: {
    label: 'Closed',
    color: 'bg-charcoal-500',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
  },
}

// ============================================
// LIST VIEW CONFIG
// ============================================

const statsCards: StatCardConfig[] = [
  {
    key: 'total',
    label: 'Total Runs',
    icon: FileText,
  },
  {
    key: 'pendingApproval',
    label: 'Pending Approval',
    color: 'bg-amber-100 text-amber-800',
  },
  {
    key: 'ytdGross',
    label: 'YTD Gross Pay',
    color: 'bg-success-100 text-success-800',
    format: 'currency',
  },
  {
    key: 'ytdNet',
    label: 'YTD Net Pay',
    color: 'bg-blue-100 text-blue-800',
    format: 'currency',
  },
]

const filters: FilterConfig[] = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search pay runs...',
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    placeholder: 'All Statuses',
    options: Object.entries(PAY_RUN_STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
  {
    key: 'runType',
    type: 'select',
    label: 'Type',
    placeholder: 'All Types',
    options: Object.entries(PAY_RUN_TYPE_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
]

const columns: ColumnConfig<PayRun>[] = [
  {
    key: 'runNumber',
    header: 'Run #',
    sortable: true,
    width: 'min-w-[140px]',
  },
  {
    key: 'payPeriod',
    header: 'Pay Period',
    width: 'min-w-[200px]',
    render: (_value: unknown, row: PayRun) => {
      if (!row.payPeriod) return '-'
      const start = new Date(row.payPeriod.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const end = new Date(row.payPeriod.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${start} - ${end}`
    },
  },
  {
    key: 'checkDate',
    header: 'Check Date',
    sortable: true,
    width: 'w-[120px]',
    format: 'date' as const,
  },
  {
    key: 'workerCount',
    header: 'Workers',
    width: 'w-[100px]',
    align: 'right',
    render: (_value: unknown, row: PayRun) => {
      const total = row.employeeCount + row.consultantCount + row.contractorCount
      return total.toLocaleString()
    },
  },
  {
    key: 'totalGross',
    header: 'Gross',
    sortable: true,
    align: 'right',
    width: 'w-[120px]',
    render: (value: unknown) => formatCurrency(value as number),
  },
  {
    key: 'totalNet',
    header: 'Net',
    sortable: true,
    align: 'right',
    width: 'w-[120px]',
    render: (value: unknown) => formatCurrency(value as number),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: 'w-[140px]',
    format: 'status' as const,
  },
]

// Sort field mapping (frontend keys to backend columns)
const sortFieldMap: Record<string, string> = {
  run_number: 'run_number',
  check_date: 'check_date',
  total_gross: 'total_gross',
  total_net: 'total_net',
  status: 'status',
  created_at: 'created_at',
}

export const payrollListConfig: ListViewConfig<PayRun> = {
  entityType: 'pay_run',
  entityName: {
    singular: 'Pay Run',
    plural: 'Pay Runs',
  },
  baseRoute: '/employee/finance/payroll',
  title: 'Payroll',
  icon: DollarSign,

  // Stats
  statsCards,

  // Filters
  filters,

  // Columns
  columns,

  // Render mode
  renderMode: 'table',
  statusField: 'status',
  statusConfig: PAY_RUN_STATUS_CONFIG,

  // Sort field mapping
  sortFieldMap,

  // Actions
  primaryAction: {
    label: 'New Pay Run',
    icon: DollarSign,
    href: '/employee/finance/payroll/new',
  },

  // Empty state
  emptyState: {
    icon: DollarSign,
    title: 'No pay runs yet',
    description: 'Create your first pay run to start processing payroll.',
    action: {
      label: 'New Pay Run',
      href: '/employee/finance/payroll/new',
    },
  },

  // Data hooks
  useListQuery: (filters: Record<string, unknown>) => {
    const page = (filters.page as number | undefined) || 1
    const pageSize = (filters.pageSize as number | undefined) || 50
    return trpc.payroll.list.useQuery({
      search: filters.search as string | undefined,
      status: filters.status as PayRunStatus | undefined,
      runType: filters.runType as PayRunType | undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      sortBy: (sortFieldMap[filters.sortBy as string] || 'check_date') as 'check_date' | 'run_number' | 'total_gross' | 'status' | 'created_at',
      sortOrder: (filters.sortOrder as 'asc' | 'desc') || 'desc',
    })
  },

  useStatsQuery: () => {
    return trpc.payroll.stats.useQuery()
  },
}

// ============================================
// DETAIL VIEW CONFIG
// ============================================

export const payrollDetailConfig: DetailViewConfig<PayRun> = {
  entityType: 'pay_run',
  baseRoute: '/employee/finance/payroll',

  // Header configuration
  titleField: 'runNumber',
  subtitleFields: [
    {
      key: 'payPeriodId',
      icon: Clock,
      format: (_value: unknown, entity?: unknown) => {
        const run = entity as PayRun
        if (!run?.payPeriod) return 'No Period'
        const start = new Date(run.payPeriod.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const end = new Date(run.payPeriod.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        return `${start} - ${end}`
      },
    },
    {
      key: 'totalGross',
      icon: DollarSign,
      format: (value: unknown) => `Gross: ${formatCurrency(value as number)}`,
    },
  ],

  // Status configuration
  statusField: 'status',
  statusConfig: PAY_RUN_STATUS_CONFIG,

  // Navigation mode
  navigationMode: 'sections',
  defaultSection: 'overview',

  // Sections
  sections: [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'payItems', label: 'Pay Items', icon: Users },
    { id: 'taxes', label: 'Taxes & Deductions', icon: Calculator },
    { id: 'activities', label: 'Activities', icon: Clock },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'history', label: 'History', icon: Clock },
  ],

  // Quick actions (header)
  quickActions: [
    {
      id: 'calculate',
      label: 'Calculate',
      icon: Calculator,
      variant: 'default',
      onClick: (entity: unknown) => {
        console.log('Calculate pay run:', (entity as PayRun).id)
      },
      isVisible: (entity: unknown) => (entity as PayRun).status === 'draft',
    },
    {
      id: 'submitForApproval',
      label: 'Submit for Approval',
      icon: Send,
      variant: 'default',
      onClick: (entity: unknown) => {
        console.log('Submit for approval:', (entity as PayRun).id)
      },
      isVisible: (entity: unknown) => (entity as PayRun).status === 'draft' && (entity as PayRun).totalGross > 0,
    },
    {
      id: 'approve',
      label: 'Approve',
      icon: CheckCircle,
      variant: 'default',
      onClick: (entity: unknown) => {
        console.log('Approve pay run:', (entity as PayRun).id)
      },
      isVisible: (entity: unknown) => (entity as PayRun).status === 'pending_approval',
    },
    {
      id: 'process',
      label: 'Process',
      icon: Play,
      variant: 'premium',
      onClick: (entity: unknown) => {
        console.log('Process pay run:', (entity as PayRun).id)
      },
      isVisible: (entity: unknown) => (entity as PayRun).status === 'approved',
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: (entity: unknown) => {
        console.log('Edit pay run:', (entity as PayRun).id)
      },
      isVisible: (entity: unknown) => ['draft', 'calculating'].includes((entity as PayRun).status),
    },
  ],

  // Dropdown actions
  dropdownActions: [
    {
      label: 'Download Report',
      icon: FileText,
      onClick: (entity: PayRun) => {
        console.log('Download report:', entity.id)
      },
      isVisible: (entity: PayRun) => entity.status === 'completed',
    },
    {
      label: 'Export to Payroll Provider',
      icon: Send,
      onClick: (entity: PayRun) => {
        console.log('Export to provider:', entity.id)
      },
      isVisible: (entity: PayRun) => entity.status === 'approved',
    },
    {
      separator: true,
      label: '',
    },
    {
      label: 'Recalculate',
      icon: Calculator,
      onClick: (entity: PayRun) => {
        console.log('Recalculate:', entity.id)
      },
      isVisible: (entity: PayRun) => ['draft', 'calculating'].includes(entity.status),
    },
    {
      label: 'Void Pay Run',
      icon: Ban,
      variant: 'destructive',
      onClick: (entity: PayRun) => {
        console.log('Void pay run:', entity.id)
      },
      isVisible: (entity: PayRun) => !['void'].includes(entity.status),
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (entity: PayRun) => {
        console.log('Delete pay run:', entity.id)
      },
      isVisible: (entity: PayRun) => entity.status === 'draft',
    },
  ],

  // Data hooks
  useEntityQuery: (id: string) => {
    return trpc.payroll.getById.useQuery({ id })
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPayRunStatusLabel(status: PayRunStatus): string {
  return PAY_RUN_STATUS_CONFIG[status]?.label || status
}

export function getPayRunStatusColor(status: PayRunStatus): string {
  return PAY_RUN_STATUS_CONFIG[status]?.color || 'bg-charcoal-200'
}

export function getPayRunTypeLabel(type: PayRunType): string {
  return PAY_RUN_TYPE_CONFIG[type]?.label || type
}

export function getWorkerTypeLabel(type: WorkerType): string {
  return WORKER_TYPE_CONFIG[type]?.label || type
}

export function getPeriodTypeLabel(type: PeriodType): string {
  return PERIOD_TYPE_CONFIG[type]?.label || type
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} - ${endStr}`
}

export function calculateTotalWorkers(payRun: PayRun): number {
  return payRun.employeeCount + payRun.consultantCount + payRun.contractorCount
}
