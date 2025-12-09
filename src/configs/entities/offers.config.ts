import {
  Gift,
  Plus,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  DollarSign,
  Target,
  FileText,
  User,
  AlertCircle,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// Type definition for Offer entity
export interface Offer extends Record<string, unknown> {
  id: string
  status: string
  pay_rate?: number | null
  bill_rate?: number | null
  rate_type?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual' | null
  overtime_rate?: number | null
  start_date?: string | null
  end_date?: string | null
  duration_months?: number | null
  expires_at?: string | null
  employment_type?: 'w2' | 'c2c' | '1099' | 'fulltime' | null
  pto_days?: number | null
  sick_days?: number | null
  health_insurance?: boolean
  has_401k?: boolean
  work_location?: 'remote' | 'hybrid' | 'onsite' | null
  standard_hours_per_week?: number | null
  internal_notes?: string | null
  submission_id: string
  job_id?: string
  candidate_id?: string
  submission?: {
    id: string
    candidate?: {
      id: string
      first_name: string
      last_name: string
      email?: string
    }
    job?: {
      id: string
      title: string
      account?: {
        id: string
        name: string
      }
    }
  } | null
  created_by?: string
  created_by_user?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  sent_by?: string
  sent_at?: string | null
  accepted_at?: string | null
  declined_at?: string | null
  created_at: string
  updated_at?: string
}

// Offer status configuration
export const OFFER_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: FileText,
  },
  sent: {
    label: 'Sent',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Send,
  },
  pending_response: {
    label: 'Pending Response',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
  negotiating: {
    label: 'Negotiating',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: TrendingUp,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-600 text-white',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    icon: CheckCircle2,
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-charcoal-200 text-charcoal-600',
    bgColor: 'bg-charcoal-200',
    textColor: 'text-charcoal-600',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    color: 'bg-orange-100 text-orange-800',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: AlertCircle,
  },
}

// Employment type configuration
export const OFFER_EMPLOYMENT_TYPE_CONFIG: Record<string, StatusConfig> = {
  w2: {
    label: 'W-2',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: User,
  },
  c2c: {
    label: 'Corp-to-Corp',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Building2,
  },
  '1099': {
    label: '1099',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: FileText,
  },
  fulltime: {
    label: 'Full-Time',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle2,
  },
}

// Helper to check if offer is expiring soon
function isExpiringSoon(offer: Offer): boolean {
  if (!offer.expires_at) return false
  const expires = new Date(offer.expires_at)
  const now = new Date()
  const daysUntilExpiry = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= 3 && daysUntilExpiry >= 0
}

// Offers List View Configuration
export const offersListConfig: ListViewConfig<Offer> = {
  entityType: 'offer',
  entityName: { singular: 'Offer', plural: 'Offers' },
  baseRoute: '/employee/recruiting/offers',

  title: 'Offers',
  description: 'Manage job offers and track responses',
  icon: Gift,

  primaryAction: {
    label: 'Create Offer',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openOfferDialog', { detail: { dialogId: 'create' } }))
    },
  },

  // Enterprise-grade stats cards (4)
  statsCards: [
    {
      key: 'total',
      label: 'Total Offers',
      icon: Gift,
    },
    {
      key: 'pending',
      label: 'Pending',
      icon: Clock,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      key: 'acceptedThisMonth',
      label: 'Accepted (Month)',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-800',
    },
    {
      key: 'acceptRate',
      label: 'Accept Rate',
      icon: Target,
      color: 'bg-blue-100 text-blue-800',
      format: (value) => `${value || 0}%`,
    },
  ],

  // Enterprise-grade filters (5)
  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Offers',
      placeholder: 'Search by candidate or job...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(OFFER_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'accountId',
      type: 'select',
      label: 'Account',
      options: [], // Populated dynamically
      dynamic: true,
    },
    {
      key: 'jobId',
      type: 'select',
      label: 'Job',
      options: [], // Populated dynamically
      dynamic: true,
    },
    {
      key: 'expiringSoon',
      type: 'toggle',
      label: 'Expiring Soon',
    },
  ],

  // Enterprise-grade columns (10)
  columns: [
    {
      key: 'candidate',
      label: 'Candidate',
      sortable: true,
      render: (_value, entity) => {
        const offer = entity as Offer
        const candidate = offer.submission?.candidate
        if (!candidate) return '—'
        return `${candidate.first_name} ${candidate.last_name}`.trim()
      },
    },
    {
      key: 'job',
      label: 'Job',
      icon: Briefcase,
      sortable: true,
      render: (_value, entity) => {
        const offer = entity as Offer
        return offer.submission?.job?.title || '—'
      },
    },
    {
      key: 'account',
      label: 'Account',
      icon: Building2,
      sortable: true,
      render: (_value, entity) => {
        const offer = entity as Offer
        return offer.submission?.job?.account?.name || '—'
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
    },
    {
      key: 'bill_rate',
      label: 'Bill Rate',
      type: 'currency',
      sortable: true,
      render: (value, entity) => {
        const offer = entity as Offer
        const rate = value as number | null
        if (!rate) return '—'
        const suffix = offer.rate_type === 'hourly' ? '/hr' : offer.rate_type === 'annual' ? '/yr' : ''
        return `$${rate.toLocaleString()}${suffix}`
      },
    },
    {
      key: 'pay_rate',
      label: 'Pay Rate',
      type: 'currency',
      sortable: true,
      render: (value, entity) => {
        const offer = entity as Offer
        const rate = value as number | null
        if (!rate) return '—'
        const suffix = offer.rate_type === 'hourly' ? '/hr' : offer.rate_type === 'annual' ? '/yr' : ''
        return `$${rate.toLocaleString()}${suffix}`
      },
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'date',
      sortable: true,
    },
    {
      key: 'expires_at',
      label: 'Expires',
      type: 'date',
      sortable: true,
      render: (value, entity) => {
        const offer = entity as Offer
        if (!value) return '—'
        const expiring = isExpiringSoon(offer)
        const date = new Date(value as string).toLocaleDateString()
        return expiring ? `${date} ⚠️` : date
      },
    },
    {
      key: 'sent_at',
      label: 'Sent',
      type: 'date',
      sortable: true,
    },
    {
      key: 'created_at',
      label: 'Created',
      type: 'date',
      sortable: true,
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: OFFER_STATUS_CONFIG,

  pageSize: 50,

  // Sort field mapping for backend
  sortFieldMap: {
    candidate: 'submission.candidate.last_name',
    job: 'submission.job.title',
    account: 'submission.job.account.name',
    status: 'status',
    bill_rate: 'bill_rate',
    pay_rate: 'pay_rate',
    start_date: 'start_date',
    expires_at: 'expires_at',
    sent_at: 'sent_at',
    created_at: 'created_at',
  },

  emptyState: {
    icon: Gift,
    title: 'No offers found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first offer to get started',
    action: {
      label: 'Create Offer',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openOfferDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const validStatuses = ['draft', 'sent', 'pending_response', 'negotiating', 'accepted', 'declined', 'withdrawn', 'expired'] as const
    type OfferStatus = (typeof validStatuses)[number]

    return trpc.ats.offers.list.useQuery({
      status: statusValue !== 'all' && validStatuses.includes(statusValue as OfferStatus)
        ? (statusValue as OfferStatus)
        : undefined,
      jobId: filters.jobId as string | undefined,
      limit: (filters.limit as number) || 50,
    })
  },
}

// Offers Detail View Configuration
export const offersDetailConfig: DetailViewConfig<Offer> = {
  entityType: 'offer',
  baseRoute: '/employee/recruiting/offers',
  titleField: 'id',
  statusField: 'status',
  statusConfig: OFFER_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'Recruiting', href: '/employee/recruiting' },
    { label: 'Offers', href: '/employee/recruiting/offers' },
  ],

  titleFormatter: (entity) => {
    const offer = entity as Offer
    if (offer.submission?.candidate && offer.submission?.job) {
      return `${offer.submission.candidate.first_name} ${offer.submission.candidate.last_name} - ${offer.submission.job.title}`
    }
    return `Offer #${offer.id.slice(0, 8)}`
  },

  subtitleFields: [
    {
      key: 'submission',
      icon: Briefcase,
      format: (value) => {
        const submission = value as Offer['submission'] | null
        return submission?.job?.title || ''
      },
    },
    {
      key: 'submission',
      icon: Building2,
      format: (value) => {
        const submission = value as Offer['submission'] | null
        return submission?.job?.account?.name || ''
      },
    },
    {
      key: 'start_date',
      icon: Calendar,
      format: (value) => {
        if (!value) return ''
        return `Starts ${new Date(value as string).toLocaleDateString()}`
      },
    },
  ],

  metrics: [
    {
      key: 'billRate',
      label: 'Bill Rate',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const offer = entity as Offer
        return offer.bill_rate || 0
      },
      format: (value) => `$${Number(value)}/hr`,
      tooltip: 'Hourly bill rate',
    },
    {
      key: 'payRate',
      label: 'Pay Rate',
      icon: DollarSign,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const offer = entity as Offer
        return offer.pay_rate || 0
      },
      format: (value) => `$${Number(value)}/hr`,
      tooltip: 'Hourly pay rate',
    },
    {
      key: 'margin',
      label: 'Margin',
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity: unknown) => {
        const offer = entity as Offer
        if (!offer.bill_rate || !offer.pay_rate) return 0
        return Math.round(((offer.bill_rate - offer.pay_rate) / offer.bill_rate) * 100)
      },
      format: (value) => `${value}%`,
      tooltip: 'Gross margin percentage',
    },
    {
      key: 'daysUntilExpiry',
      label: 'Days to Expiry',
      icon: Timer,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const offer = entity as Offer
        if (!offer.expires_at) return '—'
        const expires = new Date(offer.expires_at)
        const now = new Date()
        const days = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return days < 0 ? 'Expired' : days
      },
      tooltip: 'Days until offer expires',
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
      id: 'negotiations',
      label: 'Negotiations',
      icon: TrendingUp,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
    },
  ],

  quickActions: [
    {
      id: 'send-offer',
      label: 'Send Offer',
      icon: Send,
      variant: 'default',
      onClick: (entity: unknown) => {
        const offer = entity as Offer
        window.dispatchEvent(
          new CustomEvent('openOfferDialog', {
            detail: { dialogId: 'send', offerId: offer.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const offer = entity as Offer
        return offer.status === 'draft'
      },
    },
    {
      id: 'accept-offer',
      label: 'Mark Accepted',
      icon: CheckCircle2,
      variant: 'default',
      onClick: (entity: unknown) => {
        const offer = entity as Offer
        window.dispatchEvent(
          new CustomEvent('openOfferDialog', {
            detail: { dialogId: 'accept', offerId: offer.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const offer = entity as Offer
        return ['sent', 'pending_response', 'negotiating'].includes(offer.status)
      },
    },
  ],

  dropdownActions: [
    {
      label: 'View Submission',
      icon: FileText,
      onClick: (entity) => {
        const offer = entity as Offer
        if (offer.submission_id) {
          window.location.href = `/employee/recruiting/submissions/${offer.submission_id}`
        }
      },
    },
    {
      label: 'View Candidate',
      icon: User,
      onClick: (entity) => {
        const offer = entity as Offer
        if (offer.submission?.candidate?.id) {
          window.location.href = `/employee/recruiting/candidates/${offer.submission.candidate.id}`
        }
      },
    },
    { separator: true, label: '' },
    {
      label: 'Withdraw Offer',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openOfferDialog', {
            detail: { dialogId: 'withdraw', offerId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const offer = entity as Offer
        return !['accepted', 'declined', 'withdrawn', 'expired'].includes(offer.status)
      },
    },
  ],

  eventNamespace: 'offer',

  useEntityQuery: (entityId) => trpc.ats.offers.getById.useQuery({ offerId: entityId }),
}
