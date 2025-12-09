import {
  Send,
  Plus,
  Briefcase,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  FileText,
  ArrowRight,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Timer,
  Target,
  DollarSign,
  MessageSquare,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
// PCF Section Adapters
import {
  SubmissionOverviewSectionPCF,
  SubmissionActivitiesSectionPCF,
} from './sections/submissions.sections'

// Type definition for Submission entity
export interface Submission extends Record<string, unknown> {
  id: string
  status: string
  submitted_at: string
  submission_rate?: number | null
  bill_rate?: number | null
  pay_rate?: number | null
  match_score?: number | null
  ai_match_score?: number | null
  recruiter_match_score?: number | null
  client_feedback?: string | null
  internal_notes?: string | null
  submission_notes?: string | null
  job_id: string
  job?: {
    id: string
    title: string
    account?: {
      id: string
      name: string
    }
  } | null
  candidate_id: string
  candidate?: {
    id: string
    first_name: string
    last_name: string
    email?: string
  } | null
  submitted_by?: string | null
  submitted_by_user?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  rejection_reason?: string | null
  client_viewed_at?: string | null
  interview_date?: string | null
  interview_count?: number
  stage_changed_at?: string | null
  created_at: string
  updated_at?: string
}

// Submission status configuration (aligned with plan stages)
export const SUBMISSION_STATUS_CONFIG: Record<string, StatusConfig> = {
  sourced: {
    label: 'Sourced',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: User,
  },
  screening: {
    label: 'Screening',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Eye,
  },
  submission_ready: {
    label: 'Ready to Submit',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Send,
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
  submitted_to_client: {
    label: 'Client Submitted',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Send,
  },
  client_review: {
    label: 'Client Review',
    color: 'bg-blue-200 text-blue-800',
    bgColor: 'bg-blue-200',
    textColor: 'text-blue-800',
    icon: Eye,
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    icon: Calendar,
  },
  client_interview: {
    label: 'Interviewing',
    color: 'bg-purple-200 text-purple-800',
    bgColor: 'bg-purple-200',
    textColor: 'text-purple-800',
    icon: Calendar,
  },
  interviewed: {
    label: 'Interviewed',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: CheckCircle2,
  },
  offer_stage: {
    label: 'Offer Stage',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: ThumbsUp,
  },
  placed: {
    label: 'Placed',
    color: 'bg-green-600 text-white',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: ThumbsDown,
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-charcoal-200 text-charcoal-600',
    bgColor: 'bg-charcoal-200',
    textColor: 'text-charcoal-600',
    icon: XCircle,
  },
}

// Feedback configuration
export const SUBMISSION_FEEDBACK_CONFIG: Record<string, StatusConfig> = {
  positive: {
    label: 'Positive',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: ThumbsUp,
  },
  negative: {
    label: 'Negative',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: ThumbsDown,
  },
  neutral: {
    label: 'Neutral',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: MessageSquare,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
}

// Helper to calculate days in stage
function getDaysInStage(submission: Submission): number {
  const changedAt = submission.stage_changed_at || submission.submitted_at
  if (!changedAt) return 0
  const changed = new Date(changedAt)
  const now = new Date()
  return Math.floor((now.getTime() - changed.getTime()) / (1000 * 60 * 60 * 24))
}

// Submissions List View Configuration
export const submissionsListConfig: ListViewConfig<Submission> = {
  entityType: 'submission',
  entityName: { singular: 'Submission', plural: 'Submissions' },
  baseRoute: '/employee/recruiting/submissions',

  title: 'Submissions',
  description: 'Track candidate submissions to jobs',
  icon: Send,

  primaryAction: {
    label: 'New Submission',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openSubmissionDialog', { detail: { dialogId: 'create' } }))
    },
  },

  // Enterprise-grade stats cards (5)
  statsCards: [
    {
      key: 'total',
      label: 'Total',
      icon: Send,
    },
    {
      key: 'pending',
      label: 'Pending Review',
      icon: Clock,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      key: 'interviewing',
      label: 'Interviewing',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      key: 'offerRate',
      label: 'Offer Rate',
      icon: Target,
      color: 'bg-green-100 text-green-800',
      format: (value) => `${value || 0}%`,
    },
    {
      key: 'avgDaysInStage',
      label: 'Avg Days in Stage',
      icon: Timer,
      color: 'bg-blue-100 text-blue-800',
    },
  ],

  // Enterprise-grade filters (6)
  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Submissions',
      placeholder: 'Search by candidate or job...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Stage',
      options: [
        { value: 'all', label: 'All Stages' },
        ...Object.entries(SUBMISSION_STATUS_CONFIG).map(([value, config]) => ({
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
      key: 'recruiterId',
      type: 'select',
      label: 'Owner',
      options: [], // Populated dynamically
      dynamic: true,
    },
  ],

  // Enterprise-grade columns (11)
  columns: [
    {
      key: 'candidate',
      label: 'Candidate',
      sortable: true,
      render: (value) => {
        const candidate = value as Submission['candidate']
        if (!candidate) return '—'
        return `${candidate.first_name} ${candidate.last_name}`.trim()
      },
    },
    {
      key: 'job',
      label: 'Job',
      icon: Briefcase,
      sortable: true,
      render: (value) => {
        const job = value as Submission['job']
        return job?.title || '—'
      },
    },
    {
      key: 'job.account',
      label: 'Account',
      icon: Building2,
      sortable: true,
      render: (_value, entity) => {
        const submission = entity as Submission
        return submission.job?.account?.name || '—'
      },
    },
    {
      key: 'status',
      label: 'Stage',
      sortable: true,
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      type: 'date',
      sortable: true,
    },
    {
      key: 'interview_date',
      label: 'Interview Date',
      type: 'date',
      sortable: true,
      render: (value) => {
        if (!value) return '—'
        return new Date(value as string).toLocaleDateString()
      },
    },
    {
      key: 'client_feedback',
      label: 'Feedback',
      render: (value, entity) => {
        const submission = entity as Submission
        if (!submission.client_feedback) return '—'
        // Check if feedback exists and return appropriate indicator
        return submission.client_feedback.slice(0, 30) + (submission.client_feedback.length > 30 ? '...' : '')
      },
    },
    {
      key: 'submission_rate',
      label: 'Bill Rate',
      type: 'currency',
      sortable: true,
      render: (value) => {
        const rate = value as number | null
        return rate ? `$${rate}/hr` : '—'
      },
    },
    {
      key: 'pay_rate',
      label: 'Pay Rate',
      type: 'currency',
      sortable: true,
      render: (value) => {
        const rate = value as number | null
        return rate ? `$${rate}/hr` : '—'
      },
    },
    {
      key: 'submitted_by_user',
      label: 'Owner',
      render: (value) => {
        const user = value as Submission['submitted_by_user']
        return user?.full_name || '—'
      },
    },
    {
      key: 'daysInStage',
      label: 'Days in Stage',
      sortable: true,
      render: (_value, entity) => {
        const submission = entity as Submission
        const days = getDaysInStage(submission)
        const isStale = days > 7
        return isStale ? `${days}d ⚠️` : `${days}d`
      },
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: SUBMISSION_STATUS_CONFIG,

  pageSize: 50,

  // Sort field mapping for backend
  sortFieldMap: {
    candidate: 'candidate.last_name',
    job: 'job.title',
    'job.account': 'job.account.name',
    status: 'status',
    submitted_at: 'submitted_at',
    interview_date: 'interview_date',
    submission_rate: 'submission_rate',
    pay_rate: 'pay_rate',
    daysInStage: 'stage_changed_at',
  },

  emptyState: {
    icon: Send,
    title: 'No submissions found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Submit your first candidate to a job',
    action: {
      label: 'Create Submission',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openSubmissionDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined

    return trpc.ats.submissions.list.useQuery({
      status: statusValue !== 'all' ? statusValue : undefined,
      jobId: filters.jobId as string | undefined,
      recruiterId: filters.recruiterId as string | undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
    })
  },

  useStatsQuery: () => trpc.ats.submissions.getStats.useQuery({ period: 'month' }),
}

// Submissions Detail View Configuration
export const submissionsDetailConfig: DetailViewConfig<Submission> = {
  entityType: 'submission',
  baseRoute: '/employee/recruiting/submissions',
  titleField: 'id',
  statusField: 'status',
  statusConfig: SUBMISSION_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'Recruiting', href: '/employee/recruiting' },
    { label: 'Submissions', href: '/employee/recruiting/submissions' },
  ],

  titleFormatter: (entity) => {
    const submission = entity as Submission
    if (submission.candidate && submission.job) {
      return `${submission.candidate.first_name} ${submission.candidate.last_name} → ${submission.job.title}`
    }
    return `Submission #${submission.id.slice(0, 8)}`
  },

  subtitleFields: [
    {
      key: 'job',
      icon: Briefcase,
      format: (value) => {
        const job = value as Submission['job'] | null
        return job?.title || ''
      },
    },
    {
      key: 'job' as keyof Submission,
      icon: Building2,
      format: (_value, entity) => {
        const submission = entity as unknown as Submission
        return submission.job?.account?.name || ''
      },
    },
    {
      key: 'submitted_at',
      icon: Calendar,
      format: (value) => {
        if (!value) return ''
        return new Date(value as string).toLocaleDateString()
      },
    },
  ],

  metrics: [
    {
      key: 'matchScore',
      label: 'Match Score',
      icon: CheckCircle2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const submission = entity as Submission
        return submission.match_score || 0
      },
      format: (value) => `${value}%`,
      tooltip: 'AI-generated match score',
    },
    {
      key: 'billRate',
      label: 'Bill Rate',
      icon: FileText,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const submission = entity as Submission
        return submission.rate || 0
      },
      format: (value) => `$${Number(value)}/hr`,
      tooltip: 'Proposed bill rate',
    },
    {
      key: 'daysInPipeline',
      label: 'Days in Pipeline',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const submission = entity as Submission
        const submitted = new Date(submission.submitted_at)
        const now = new Date()
        return Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
      },
      tooltip: 'Days since submission',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: SubmissionOverviewSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: SubmissionActivitiesSectionPCF,
    },
  ],

  journeySteps: [
    {
      id: 'submitted',
      label: 'Submitted',
      icon: Send,
      activeStatuses: ['pending_review'],
      completedStatuses: [
        'client_review',
        'interview_requested',
        'interview_scheduled',
        'offer_pending',
        'offer_extended',
        'placed',
      ],
    },
    {
      id: 'client_review',
      label: 'Client Review',
      icon: Eye,
      activeStatuses: ['client_review'],
      completedStatuses: [
        'interview_requested',
        'interview_scheduled',
        'offer_pending',
        'offer_extended',
        'placed',
      ],
    },
    {
      id: 'interview',
      label: 'Interview',
      icon: Calendar,
      activeStatuses: ['interview_requested', 'interview_scheduled'],
      completedStatuses: ['offer_pending', 'offer_extended', 'placed'],
    },
    {
      id: 'offer',
      label: 'Offer',
      icon: ThumbsUp,
      activeStatuses: ['offer_pending', 'offer_extended'],
      completedStatuses: ['placed'],
    },
    {
      id: 'placed',
      label: 'Placed',
      icon: CheckCircle2,
      activeStatuses: ['placed'],
      completedStatuses: [],
    },
  ],

  quickActions: [
    {
      id: 'advance',
      label: 'Advance Stage',
      icon: ArrowRight,
      variant: 'default',
      onClick: (entity: unknown) => {
        const submission = entity as Submission
        window.dispatchEvent(
          new CustomEvent('openSubmissionDialog', {
            detail: { dialogId: 'advanceStage', submissionId: submission.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const submission = entity as Submission
        return !['placed', 'rejected', 'withdrawn'].includes(submission.status)
      },
    },
    {
      id: 'schedule-interview',
      label: 'Schedule Interview',
      icon: Calendar,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const submission = entity as Submission
        window.dispatchEvent(
          new CustomEvent('openSubmissionDialog', {
            detail: { dialogId: 'scheduleInterview', submissionId: submission.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const submission = entity as Submission
        return submission.status === 'client_review' || submission.status === 'interview_requested'
      },
    },
  ],

  dropdownActions: [
    {
      label: 'View Candidate',
      icon: User,
      onClick: (entity) => {
        const submission = entity as Submission
        if (submission.candidate_id) {
          window.location.href = `/employee/recruiting/candidates/${submission.candidate_id}`
        }
      },
    },
    {
      label: 'View Job',
      icon: Briefcase,
      onClick: (entity) => {
        const submission = entity as Submission
        if (submission.job_id) {
          window.location.href = `/employee/recruiting/jobs/${submission.job_id}`
        }
      },
    },
    { separator: true, label: '' },
    {
      label: 'Withdraw',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openSubmissionDialog', {
            detail: { dialogId: 'withdraw', submissionId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const submission = entity as Submission
        return !['placed', 'rejected', 'withdrawn'].includes(submission.status)
      },
    },
  ],

  eventNamespace: 'submission',

  useEntityQuery: (entityId) => trpc.ats.submissions.getById.useQuery({ id: entityId }),
}
