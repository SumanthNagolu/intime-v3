import {
  Briefcase,
  Plus,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Target,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Pause,
  AlertCircle,
  Zap,
  Activity,
  Send,
  Kanban,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
// PCF Section Adapters - import from separate file to avoid circular dependencies
import {
  JobOverviewSectionPCF,
  JobRequirementsSectionPCF,
  JobPipelineSectionPCF,
  JobSubmissionsSectionPCF,
  JobInterviewsSectionPCF,
  JobOffersSectionPCF,
  JobActivitiesSectionPCF,
  JobDocumentsSectionPCF,
  JobNotesSectionPCF,
} from './sections/jobs.sections'

// Type definition for Job entity
export interface Job extends Record<string, unknown> {
  id: string
  title: string
  status: string
  account_id?: string
  account?: {
    id: string
    name: string
  }
  location?: string
  job_type?: string
  billing_rate?: number
  bill_rate_min?: number
  bill_rate_max?: number
  priority?: string
  positions_available?: number
  positions_filled?: number
  description?: string
  requirements?: string
  start_date?: string
  end_date?: string
  created_at: string
  updated_at?: string
  created_by?: string
  owner_id?: string
}

// Job status configuration
export const JOB_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: FileText,
  },
  open: {
    label: 'Open',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Target,
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Zap,
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Pause,
  },
  filled: {
    label: 'Filled',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
  closed: {
    label: 'Closed',
    color: 'bg-charcoal-200 text-charcoal-600',
    bgColor: 'bg-charcoal-200',
    textColor: 'text-charcoal-600',
    icon: CheckCircle,
  },
}

// Job priority configuration
export const JOB_PRIORITY_CONFIG: Record<string, StatusConfig> = {
  low: {
    label: 'Low',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
  },
  normal: {
    label: 'Normal',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  high: {
    label: 'High',
    color: 'bg-amber-100 text-amber-700',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: AlertCircle,
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: AlertCircle,
  },
}

// Jobs List View Configuration
export const jobsListConfig: ListViewConfig<Job> = {
  entityType: 'job',
  entityName: { singular: 'Job', plural: 'Jobs' },
  baseRoute: '/employee/recruiting/jobs',

  title: 'Jobs',
  description: 'Manage job requisitions and pipelines',
  icon: Briefcase,

  primaryAction: {
    label: 'New Job',
    icon: Plus,
    href: '/employee/recruiting/jobs/intake',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Jobs',
      icon: Briefcase,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
    },
    {
      key: 'onHold',
      label: 'On Hold',
      color: 'bg-amber-100 text-amber-800',
    },
    {
      key: 'filled',
      label: 'Filled',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      key: 'urgent',
      label: 'Urgent',
      color: 'bg-red-100 text-red-700',
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Jobs',
      placeholder: 'Search jobs by title, account...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: Object.entries(JOB_STATUS_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
      })),
    },
    {
      key: 'priority',
      type: 'select',
      label: 'Priority',
      options: Object.entries(JOB_PRIORITY_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
      })),
    },
  ],

  columns: [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'account',
      label: 'Account',
      render: (value) => {
        const account = value as Job['account']
        return account?.name || '—'
      },
    },
    {
      key: 'location',
      label: 'Location',
      icon: MapPin,
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'billing_rate',
      label: 'Bill Rate',
      type: 'currency',
      icon: DollarSign,
    },
    {
      key: 'positions_available',
      label: 'Positions',
      render: (value, entity) => {
        const job = entity as Job
        return `${job.positions_filled || 0}/${job.positions_available || 1}`
      },
    },
    {
      key: 'created_at',
      label: 'Created',
      type: 'date',
    },
  ],

  renderMode: 'cards',
  statusField: 'status',
  statusConfig: JOB_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Briefcase,
    title: 'No jobs found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first job requisition to get started',
    action: {
      label: 'Create Job',
      href: '/employee/recruiting/jobs/intake',
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const validStatuses = ['draft', 'open', 'active', 'on_hold', 'filled', 'cancelled', 'all'] as const
    type JobStatus = typeof validStatuses[number]

    return trpc.ats.jobs.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as JobStatus) ? statusValue : 'all') as JobStatus,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
    })
  },

  useStatsQuery: () => trpc.ats.jobs.getStats.useQuery({}),
}

// Jobs Detail View Configuration
export const jobsDetailConfig: DetailViewConfig<Job> = {
  entityType: 'job',
  baseRoute: '/employee/recruiting/jobs',
  titleField: 'title',
  statusField: 'status',
  statusConfig: JOB_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'Recruiting', href: '/employee/recruiting' },
    { label: 'Jobs', href: '/employee/recruiting/jobs' },
  ],

  subtitleFields: [
    {
      key: 'account',
      icon: Building2,
      format: (value) => {
        const account = value as Job['account']
        return account?.name || ''
      },
    },
    { key: 'location', icon: MapPin },
    { key: 'job_type' },
  ],

  metrics: [
    {
      key: 'submissions',
      label: 'Submissions',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: () => 0, // Would come from actual data via query
      getTotal: (entity: unknown) => {
        const job = entity as Job
        return job.positions_available || 1
      },
      tooltip: 'Total submissions for this job',
    },
    {
      key: 'interviews',
      label: 'Interviews',
      icon: Calendar,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: () => 0,
      tooltip: 'Scheduled interviews',
    },
    {
      key: 'positions',
      label: 'Positions',
      icon: Target,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const job = entity as Job
        return job.positions_filled || 0
      },
      getTotal: (entity: unknown) => {
        const job = entity as Job
        return job.positions_available || 1
      },
      tooltip: (entity: unknown) => {
        const job = entity as Job
        return `${job.positions_filled || 0} of ${job.positions_available || 1} positions filled`
      },
    },
    {
      key: 'daysOpen',
      label: 'Days Open',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const job = entity as Job
        if (!job.created_at) return 0
        const created = new Date(job.created_at)
        const now = new Date()
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      },
      tooltip: 'Days since job was created',
    },
  ],

  showProgressBar: {
    label: 'Pipeline Progress',
    getValue: (entity) => entity.positions_filled || 0,
    getMax: (entity) => entity.positions_available || 1,
  },

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: JobOverviewSectionPCF,
    },
    {
      id: 'requirements',
      label: 'Requirements',
      icon: Target,
      component: JobRequirementsSectionPCF,
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: Kanban,
      component: JobPipelineSectionPCF,
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: Send,
      showCount: true,
      component: JobSubmissionsSectionPCF,
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: Calendar,
      showCount: true,
      component: JobInterviewsSectionPCF,
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: DollarSign,
      showCount: true,
      component: JobOffersSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: JobActivitiesSectionPCF,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      component: JobDocumentsSectionPCF,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      component: JobNotesSectionPCF,
    },
  ],

  journeySteps: [
    {
      id: 'sourcing',
      label: 'Sourcing',
      icon: Users,
      activeStatuses: ['draft', 'open'],
      completedStatuses: ['active', 'on_hold', 'filled', 'cancelled', 'closed'],
    },
    {
      id: 'screening',
      label: 'Screening',
      icon: FileText,
      activeStatuses: ['active'],
      completedStatuses: ['on_hold', 'filled', 'cancelled', 'closed'],
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: Calendar,
      activeStatuses: ['active'],
      completedStatuses: ['filled', 'cancelled', 'closed'],
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: DollarSign,
      activeStatuses: ['active'],
      completedStatuses: ['filled', 'closed'],
    },
    {
      id: 'placement',
      label: 'Placement',
      icon: CheckCircle,
      activeStatuses: ['filled'],
      completedStatuses: ['closed'],
    },
  ],

  quickActions: [
    {
      id: 'add-submission',
      label: 'Add Submission',
      icon: Plus,
      variant: 'default',
      onClick: (entity: unknown) => {
        const job = entity as Job
        window.location.href = `/employee/recruiting/jobs/${job.id}/submissions/new`
      },
      isVisible: (entity: unknown) => {
        const job = entity as Job
        return job.status === 'active' || job.status === 'open'
      },
    },
    {
      id: 'view-pipeline',
      label: 'View Pipeline',
      icon: Users,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const job = entity as Job
        window.location.href = `/employee/recruiting/jobs/${job.id}?section=pipeline`
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Job',
      icon: FileText,
      onClick: (entity) => {
        window.location.href = `/employee/recruiting/jobs/${entity.id}/edit`
      },
    },
    {
      label: 'Duplicate Job',
      icon: FileText,
      onClick: (entity) => {
        console.log('Duplicate job:', entity.id)
      },
    },
    { separator: true, label: '' },
    {
      label: 'Put On Hold',
      icon: Pause,
      onClick: (entity) => {
        console.log('Put on hold:', entity.id)
      },
    },
    {
      label: 'Cancel Job',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        if (confirm('Are you sure you want to cancel this job?')) {
          console.log('Cancel job:', entity.id)
        }
      },
    },
  ],

  eventNamespace: 'job',

  useEntityQuery: (entityId) =>
    trpc.ats.jobs.getById.useQuery({ id: entityId }),
}

