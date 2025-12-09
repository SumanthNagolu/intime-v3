import {
  Calendar,
  Plus,
  User,
  Briefcase,
  Building2,
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Activity,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
// PCF Section Adapters
import {
  InterviewOverviewSectionPCF,
  InterviewFeedbackSectionPCF,
  InterviewActivitiesSectionPCF,
} from './sections/interviews.sections'

// Type definition for Interview entity
export interface Interview extends Record<string, unknown> {
  id: string
  interview_type: string
  status: string
  scheduled_at: string
  duration_minutes?: number | null
  location?: string | null
  meeting_link?: string | null
  notes?: string | null
  feedback?: string | null
  recommendation?: string | null
  submission_id: string
  submission?: {
    id: string
    candidate?: {
      id: string
      first_name: string
      last_name: string
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
  interviewers?: Array<{
    id: string
    name: string
    email?: string
  }> | null
  created_at: string
  updated_at?: string
  completed_at?: string | null
}

// Interview status configuration
export const INTERVIEW_STATUS_CONFIG: Record<string, StatusConfig> = {
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Calendar,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-600 text-white',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: XCircle,
  },
  no_show: {
    label: 'No Show',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
  rescheduled: {
    label: 'Rescheduled',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Calendar,
  },
}

// Interview type configuration
export const INTERVIEW_TYPE_CONFIG: Record<string, StatusConfig> = {
  phone_screen: {
    label: 'Phone Screen',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Phone,
  },
  video: {
    label: 'Video Interview',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Video,
  },
  onsite: {
    label: 'On-Site',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: MapPin,
  },
  technical: {
    label: 'Technical',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: FileText,
  },
  panel: {
    label: 'Panel',
    color: 'bg-orange-100 text-orange-800',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: User,
  },
  final: {
    label: 'Final Round',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: CheckCircle2,
  },
}

// Interviews List View Configuration
export const interviewsListConfig: ListViewConfig<Interview> = {
  entityType: 'interview',
  entityName: { singular: 'Interview', plural: 'Interviews' },
  baseRoute: '/employee/recruiting/interviews',

  title: 'Interviews',
  description: 'Schedule and track candidate interviews',
  icon: Calendar,

  primaryAction: {
    label: 'Schedule Interview',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openInterviewDialog', { detail: { dialogId: 'create' } }))
    },
  },

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Interviews',
      placeholder: 'Search by candidate or job...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(INTERVIEW_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'interview_type',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(INTERVIEW_TYPE_CONFIG).map(([value, config]) => ({
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
      render: (value, entity) => {
        const interview = entity as Interview
        const candidate = interview.submission?.candidate
        if (!candidate) return '—'
        return `${candidate.first_name} ${candidate.last_name}`.trim()
      },
    },
    {
      key: 'job',
      label: 'Job',
      icon: Briefcase,
      render: (value, entity) => {
        const interview = entity as Interview
        return interview.submission?.job?.title || '—'
      },
    },
    {
      key: 'interview_type',
      label: 'Type',
      render: (value) => {
        const type = value as string
        return INTERVIEW_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'scheduled_at',
      label: 'Scheduled',
      type: 'date',
    },
    {
      key: 'duration_minutes',
      label: 'Duration',
      render: (value) => {
        const mins = value as number | null
        return mins ? `${mins} min` : '—'
      },
    },
    {
      key: 'location',
      label: 'Location',
      render: (value, entity) => {
        const interview = entity as Interview
        return interview.meeting_link ? 'Virtual' : interview.location || '—'
      },
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: INTERVIEW_STATUS_CONFIG,

  pageSize: 50,

  emptyState: {
    icon: Calendar,
    title: 'No interviews found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Schedule your first interview to get started',
    action: {
      label: 'Schedule Interview',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openInterviewDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined

    return trpc.ats.interviews.list.useQuery({
      status: statusValue !== 'all' ? statusValue : undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
    })
  },
}

// Interviews Detail View Configuration
export const interviewsDetailConfig: DetailViewConfig<Interview> = {
  entityType: 'interview',
  baseRoute: '/employee/recruiting/interviews',
  titleField: 'id',
  statusField: 'status',
  statusConfig: INTERVIEW_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'Recruiting', href: '/employee/recruiting' },
    { label: 'Interviews', href: '/employee/recruiting/interviews' },
  ],

  titleFormatter: (entity) => {
    const interview = entity as Interview
    const candidate = interview.submission?.candidate
    if (candidate) {
      return `${candidate.first_name} ${candidate.last_name} - ${INTERVIEW_TYPE_CONFIG[interview.interview_type]?.label || interview.interview_type}`
    }
    return `Interview #${interview.id.slice(0, 8)}`
  },

  subtitleFields: [
    {
      key: 'interview_type',
      format: (value) => {
        const type = value as string
        return INTERVIEW_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'scheduled_at',
      icon: Calendar,
      format: (value) => {
        if (!value) return ''
        return new Date(value as string).toLocaleString()
      },
    },
    {
      key: 'duration_minutes',
      icon: Clock,
      format: (value) => {
        const mins = value as number | null
        return mins ? `${mins} min` : ''
      },
    },
  ],

  metrics: [
    {
      key: 'timeUntil',
      label: 'Time Until',
      icon: Clock,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const interview = entity as Interview
        const scheduled = new Date(interview.scheduled_at)
        const now = new Date()
        const diff = scheduled.getTime() - now.getTime()
        if (diff < 0) return 'Past'
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours < 24) return `${hours}h`
        return `${Math.floor(hours / 24)}d`
      },
      tooltip: 'Time until interview',
    },
    {
      key: 'interviewers',
      label: 'Interviewers',
      icon: User,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity: unknown) => {
        const interview = entity as Interview
        return interview.interviewers?.length || 0
      },
      tooltip: 'Number of interviewers',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: InterviewOverviewSectionPCF,
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: ThumbsUp,
      component: InterviewFeedbackSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: InterviewActivitiesSectionPCF,
    },
  ],

  quickActions: [
    {
      id: 'join-meeting',
      label: 'Join Meeting',
      icon: Video,
      variant: 'default',
      onClick: (entity: unknown) => {
        const interview = entity as Interview
        if (interview.meeting_link) {
          window.open(interview.meeting_link, '_blank')
        }
      },
      isVisible: (entity: unknown) => {
        const interview = entity as Interview
        return !!interview.meeting_link && interview.status !== 'completed'
      },
    },
    {
      id: 'submit-feedback',
      label: 'Submit Feedback',
      icon: ThumbsUp,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const interview = entity as Interview
        window.dispatchEvent(
          new CustomEvent('openInterviewDialog', {
            detail: { dialogId: 'submitFeedback', interviewId: interview.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const interview = entity as Interview
        return interview.status === 'completed' && !interview.feedback
      },
    },
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: Calendar,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const interview = entity as Interview
        window.dispatchEvent(
          new CustomEvent('openInterviewDialog', {
            detail: { dialogId: 'reschedule', interviewId: interview.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const interview = entity as Interview
        return ['scheduled', 'confirmed'].includes(interview.status)
      },
    },
  ],

  dropdownActions: [
    {
      label: 'View Submission',
      icon: FileText,
      onClick: (entity) => {
        const interview = entity as Interview
        if (interview.submission_id) {
          window.location.href = `/employee/recruiting/submissions/${interview.submission_id}`
        }
      },
    },
    {
      label: 'Mark Complete',
      icon: CheckCircle2,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openInterviewDialog', {
            detail: { dialogId: 'markComplete', interviewId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const interview = entity as Interview
        return ['scheduled', 'confirmed', 'in_progress'].includes(interview.status)
      },
    },
    { separator: true, label: '' },
    {
      label: 'Cancel Interview',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openInterviewDialog', {
            detail: { dialogId: 'cancel', interviewId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const interview = entity as Interview
        return ['scheduled', 'confirmed'].includes(interview.status)
      },
    },
  ],

  eventNamespace: 'interview',

  useEntityQuery: (entityId) => trpc.ats.interviews.getById.useQuery({ id: entityId }),
}
