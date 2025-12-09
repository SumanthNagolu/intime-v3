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
  rate?: number | null
  pay_rate?: number | null
  match_score?: number | null
  client_feedback?: string | null
  internal_notes?: string | null
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
  } | null
  rejection_reason?: string | null
  client_viewed_at?: string | null
  created_at: string
  updated_at?: string
}

// Submission status configuration
export const SUBMISSION_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending_review: {
    label: 'Pending Review',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: Clock,
  },
  client_review: {
    label: 'Client Review',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Eye,
  },
  interview_requested: {
    label: 'Interview Requested',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Calendar,
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Calendar,
  },
  offer_pending: {
    label: 'Offer Pending',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: ThumbsUp,
  },
  offer_extended: {
    label: 'Offer Extended',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Send,
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
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(SUBMISSION_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'candidate',
      label: 'Candidate',
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
      render: (value) => {
        const job = value as Submission['job']
        return job?.title || '—'
      },
    },
    {
      key: 'job.account',
      label: 'Account',
      icon: Building2,
      render: (value, entity) => {
        const submission = entity as Submission
        return submission.job?.account?.name || '—'
      },
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'rate',
      label: 'Bill Rate',
      type: 'currency',
      render: (value) => {
        const rate = value as number | null
        return rate ? `$${rate}/hr` : '—'
      },
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      type: 'date',
    },
    {
      key: 'submitted_by_user',
      label: 'Submitted By',
      render: (value) => {
        const user = value as Submission['submitted_by_user']
        return user?.full_name || '—'
      },
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: SUBMISSION_STATUS_CONFIG,

  pageSize: 50,

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
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
    })
  },
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
