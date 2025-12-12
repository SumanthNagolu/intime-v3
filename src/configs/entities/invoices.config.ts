import { FileText, DollarSign, Clock, CheckCircle, AlertCircle, Send, Eye, XCircle, Pencil, Trash2, Building2, CreditCard, AlertTriangle, Ban } from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig, StatCardConfig, FilterConfig, ColumnConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// ============================================
// INVOICES-01: Invoice Management Config
// PCF configuration for invoices list and detail views
// ============================================

// ============================================
// TYPES
// ============================================

export interface Invoice {
  [key: string]: unknown
  id: string
  orgId: string
  invoiceNumber: string
  referenceNumber: string | null
  accountId: string | null
  companyId: string | null
  billingContactId: string | null
  invoiceType: InvoiceType
  invoiceDate: string
  dueDate: string
  currency: string
  exchangeRate: number
  subtotal: number
  discountAmount: number
  discountPercentage: number | null
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  status: InvoiceStatus
  sentAt: string | null
  sentTo: string[] | null
  viewedAt: string | null
  paymentTermsId: string | null
  paymentInstructions: string | null
  agingBucket: AgingBucket | null
  lastReminderSent: string | null
  reminderCount: number
  isDisputed: boolean
  disputeReason: string | null
  disputeOpenedAt: string | null
  disputeResolvedAt: string | null
  writtenOffAmount: number
  writtenOffAt: string | null
  writtenOffReason: string | null
  internalNotes: string | null
  clientNotes: string | null
  termsAndConditions: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  // Joined relations
  company?: {
    id: string
    name: string
  }
  account?: {
    id: string
    name: string
  }
  billingContact?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  paymentTerms?: {
    id: string
    name: string
    days_until_due: number
  }
  lineItems?: InvoiceLineItem[]
  payments?: InvoicePayment[]
}

export interface InvoiceLineItem {
  id: string
  invoiceId: string
  timesheetId: string | null
  timesheetEntryId: string | null
  placementId: string | null
  lineNumber: number
  description: string
  serviceStartDate: string | null
  serviceEndDate: string | null
  quantity: number
  unitType: string
  unitRate: number
  subtotal: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  glCode: string | null
  costCenter: string | null
  projectCode: string | null
  createdAt: string
}

export interface InvoicePayment {
  id: string
  orgId: string
  invoiceId: string
  paymentDate: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber: string | null
  bankReference: string | null
  depositDate: string | null
  depositAccount: string | null
  notes: string | null
  createdAt: string
  createdBy: string | null
}

export type InvoiceStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'viewed'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'disputed'
  | 'void'
  | 'written_off'

export type InvoiceType = 'standard' | 'fixed_fee' | 'retainer' | 'milestone' | 'credit_note' | 'final'

export type PaymentMethod = 'check' | 'ach' | 'wire' | 'credit_card' | 'other'

export type AgingBucket = 'current' | '1_30' | '31_60' | '61_90' | '90_plus'

// ============================================
// STATUS CONFIGURATION
// ============================================

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, StatusConfig & { icon: typeof Clock }> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-200',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-700',
    icon: Pencil,
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
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: CheckCircle,
  },
  sent: {
    label: 'Sent',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    icon: Send,
  },
  viewed: {
    label: 'Viewed',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: Eye,
  },
  partially_paid: {
    label: 'Partially Paid',
    color: 'bg-teal-500',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    icon: CreditCard,
  },
  paid: {
    label: 'Paid',
    color: 'bg-success-500',
    bgColor: 'bg-success-50',
    textColor: 'text-success-700',
    icon: CheckCircle,
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: AlertCircle,
  },
  disputed: {
    label: 'Disputed',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: AlertTriangle,
  },
  void: {
    label: 'Void',
    color: 'bg-charcoal-500',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: Ban,
  },
  written_off: {
    label: 'Written Off',
    color: 'bg-charcoal-400',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: XCircle,
  },
}

export const INVOICE_TYPE_CONFIG: Record<InvoiceType, { label: string; description: string }> = {
  standard: { label: 'Standard', description: 'Time and materials based on timesheets' },
  fixed_fee: { label: 'Fixed Fee', description: 'Fixed project fee' },
  retainer: { label: 'Retainer', description: 'Monthly retainer fee' },
  milestone: { label: 'Milestone', description: 'Project milestone payment' },
  credit_note: { label: 'Credit Note', description: 'Credit or adjustment' },
  final: { label: 'Final', description: 'Final invoice for contract' },
}

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string }> = {
  check: { label: 'Check' },
  ach: { label: 'ACH Transfer' },
  wire: { label: 'Wire Transfer' },
  credit_card: { label: 'Credit Card' },
  other: { label: 'Other' },
}

export const AGING_BUCKET_CONFIG: Record<AgingBucket, { label: string; color: string; bgColor: string }> = {
  current: { label: 'Current', color: 'text-success-700', bgColor: 'bg-success-50' },
  '1_30': { label: '1-30 Days', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  '31_60': { label: '31-60 Days', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  '61_90': { label: '61-90 Days', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  '90_plus': { label: '90+ Days', color: 'text-red-700', bgColor: 'bg-red-50' },
}

// ============================================
// LIST VIEW CONFIG
// ============================================

const statsCards: StatCardConfig[] = [
  {
    key: 'totalAR',
    label: 'Total AR',
    icon: DollarSign,
    format: 'currency',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    color: 'bg-red-100 text-red-800',
    format: 'currency',
  },
  {
    key: 'draftCount',
    label: 'Drafts',
    color: 'bg-charcoal-100 text-charcoal-800',
  },
  {
    key: 'pendingPayment',
    label: 'Pending Payment',
    color: 'bg-amber-100 text-amber-800',
    format: 'currency',
  },
]

const filters: FilterConfig[] = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search invoices...',
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    placeholder: 'All Statuses',
    options: Object.entries(INVOICE_STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
  {
    key: 'invoiceType',
    type: 'select',
    label: 'Type',
    placeholder: 'All Types',
    options: Object.entries(INVOICE_TYPE_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
  {
    key: 'agingBucket',
    type: 'select',
    label: 'Aging',
    placeholder: 'All Ages',
    options: Object.entries(AGING_BUCKET_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
]

const columns: ColumnConfig<Invoice>[] = [
  {
    key: 'invoiceNumber',
    header: 'Invoice #',
    sortable: true,
    width: 'min-w-[140px]',
  },
  {
    key: 'company',
    header: 'Client',
    width: 'min-w-[200px]',
    render: (_value: unknown, row: Invoice) => {
      if (row.company?.name) return row.company.name
      if (row.account?.name) return row.account.name
      return '-'
    },
  },
  {
    key: 'invoiceDate',
    header: 'Date',
    sortable: true,
    width: 'w-[120px]',
    format: 'date' as const,
  },
  {
    key: 'dueDate',
    header: 'Due Date',
    sortable: true,
    width: 'w-[120px]',
    render: (value: unknown, row: Invoice) => {
      const date = new Date(value as string)
      const now = new Date()
      const isOverdue = date < now && !['paid', 'void', 'written_off'].includes(row.status)
      const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return isOverdue ? `${formatted} ⚠️` : formatted
    },
  },
  {
    key: 'totalAmount',
    header: 'Amount',
    sortable: true,
    align: 'right',
    width: 'w-[120px]',
    render: (value: unknown) => formatCurrency(value as number),
  },
  {
    key: 'balanceDue',
    header: 'Balance Due',
    sortable: true,
    align: 'right',
    width: 'w-[120px]',
    render: (value: unknown, row: Invoice) => {
      const balance = value as number
      if (balance === 0) return '$0.00'
      const isOverdue = row.status === 'overdue' || row.agingBucket === '90_plus'
      const formatted = formatCurrency(balance)
      return isOverdue ? `${formatted} 🔴` : formatted
    },
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
  invoice_number: 'invoice_number',
  invoice_date: 'invoice_date',
  due_date: 'due_date',
  total_amount: 'total_amount',
  balance_due: 'balance_due',
  status: 'status',
  created_at: 'created_at',
}

export const invoicesListConfig: ListViewConfig<Invoice> = {
  entityType: 'invoice',
  entityName: {
    singular: 'Invoice',
    plural: 'Invoices',
  },
  baseRoute: '/employee/finance/invoices',
  title: 'Invoices',
  icon: FileText,

  // Stats
  statsCards,

  // Filters
  filters,

  // Columns
  columns,

  // Render mode
  renderMode: 'table',
  statusField: 'status',
  statusConfig: INVOICE_STATUS_CONFIG,

  // Sort field mapping
  sortFieldMap,

  // Actions
  primaryAction: {
    label: 'New Invoice',
    icon: FileText,
    href: '/employee/finance/invoices/new',
  },

  // Empty state
  emptyState: {
    icon: FileText,
    title: 'No invoices yet',
    description: 'Create your first invoice to start billing clients.',
    action: {
      label: 'New Invoice',
      href: '/employee/finance/invoices/new',
    },
  },

  // Data hooks
  useListQuery: (filters: Record<string, unknown>) => {
    const page = (filters.page as number | undefined) || 1
    const pageSize = (filters.pageSize as number | undefined) || 50
    return trpc.invoices.list.useQuery({
      search: filters.search as string | undefined,
      status: filters.status as InvoiceStatus | undefined,
      invoiceType: filters.invoiceType as InvoiceType | undefined,
      agingBucket: filters.agingBucket as AgingBucket | undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      sortBy: (sortFieldMap[filters.sortBy as string] || 'invoice_date') as 'invoice_number' | 'invoice_date' | 'due_date' | 'total_amount' | 'balance_due' | 'status' | 'created_at',
      sortOrder: (filters.sortOrder as 'asc' | 'desc') || 'desc',
    })
  },

  useStatsQuery: () => {
    return trpc.invoices.stats.useQuery()
  },
}

// ============================================
// DETAIL VIEW CONFIG
// ============================================

export const invoicesDetailConfig: DetailViewConfig<Invoice> = {
  entityType: 'invoice',
  baseRoute: '/employee/finance/invoices',

  // Header configuration
  titleField: 'invoiceNumber',
  subtitleFields: [
    {
      key: 'companyId',
      icon: Building2,
      format: (_value: unknown, entity?: unknown) => {
        const inv = entity as Invoice
        return inv?.company?.name || inv?.account?.name || 'No Client'
      },
    },
    {
      key: 'totalAmount',
      icon: DollarSign,
      format: (value: unknown) => formatCurrency(value as number),
    },
  ],

  // Status configuration
  statusField: 'status',
  statusConfig: INVOICE_STATUS_CONFIG,

  // Navigation mode
  navigationMode: 'sections',
  defaultSection: 'overview',

  // Sections
  sections: [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'lineItems', label: 'Line Items', icon: DollarSign },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'activities', label: 'Activities', icon: Clock },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'history', label: 'History', icon: Clock },
  ],

  // Quick actions (header)
  quickActions: [
    {
      id: 'send',
      label: 'Send',
      icon: Send,
      variant: 'default',
      onClick: (entity: unknown) => {
        console.log('Send invoice:', (entity as Invoice).id)
      },
      isVisible: (entity: unknown) => ['approved'].includes((entity as Invoice).status),
    },
    {
      id: 'approve',
      label: 'Approve',
      icon: CheckCircle,
      variant: 'default',
      onClick: (entity: unknown) => {
        console.log('Approve invoice:', (entity as Invoice).id)
      },
      isVisible: (entity: unknown) => ['draft', 'pending_approval'].includes((entity as Invoice).status),
    },
    {
      id: 'recordPayment',
      label: 'Record Payment',
      icon: CreditCard,
      variant: 'default',
      onClick: (entity: unknown) => {
        console.log('Record payment:', (entity as Invoice).id)
      },
      isVisible: (entity: unknown) => ['sent', 'viewed', 'partially_paid', 'overdue'].includes((entity as Invoice).status),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: (entity: unknown) => {
        console.log('Edit invoice:', (entity as Invoice).id)
      },
      isVisible: (entity: unknown) => ['draft', 'pending_approval'].includes((entity as Invoice).status),
    },
  ],

  // Dropdown actions
  dropdownActions: [
    {
      label: 'Duplicate',
      icon: FileText,
      onClick: (entity: Invoice) => {
        console.log('Duplicate invoice:', entity.id)
      },
    },
    {
      label: 'Send Reminder',
      icon: Send,
      onClick: (entity: Invoice) => {
        console.log('Send reminder:', entity.id)
      },
      isVisible: (entity: Invoice) => ['sent', 'viewed', 'partially_paid', 'overdue'].includes(entity.status),
    },
    {
      separator: true,
      label: '',
    },
    {
      label: 'Mark as Disputed',
      icon: AlertTriangle,
      onClick: (entity: Invoice) => {
        console.log('Mark disputed:', entity.id)
      },
      isVisible: (entity: Invoice) => !entity.isDisputed && !['paid', 'void', 'written_off'].includes(entity.status),
    },
    {
      label: 'Write Off',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity: Invoice) => {
        console.log('Write off invoice:', entity.id)
      },
      isVisible: (entity: Invoice) => ['overdue', 'disputed'].includes(entity.status) && entity.balanceDue > 0,
    },
    {
      label: 'Void Invoice',
      icon: Ban,
      variant: 'destructive',
      onClick: (entity: Invoice) => {
        console.log('Void invoice:', entity.id)
      },
      isVisible: (entity: Invoice) => !['paid', 'void', 'written_off'].includes(entity.status),
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (entity: Invoice) => {
        console.log('Delete invoice:', entity.id)
      },
      isVisible: (entity: Invoice) => entity.status === 'draft',
    },
  ],

  // Data hooks
  useEntityQuery: (id: string) => {
    return trpc.invoices.getById.useQuery({ id })
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_CONFIG[status]?.label || status
}

export function getInvoiceStatusColor(status: InvoiceStatus): string {
  return INVOICE_STATUS_CONFIG[status]?.color || 'bg-charcoal-200'
}

export function getInvoiceTypeLabel(type: InvoiceType): string {
  return INVOICE_TYPE_CONFIG[type]?.label || type
}

export function getAgingBucketLabel(bucket: AgingBucket): string {
  return AGING_BUCKET_CONFIG[bucket]?.label || bucket
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

export function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diff = now.getTime() - due.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (['paid', 'void', 'written_off'].includes(invoice.status)) return false
  const dueDate = new Date(invoice.dueDate)
  return dueDate < new Date()
}
