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
  Play,
  History,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import { PriorityBadge } from '@/components/recruiting/jobs/PriorityBadge'
import { SLAIndicator } from '@/components/recruiting/jobs/SLAIndicator'
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
  JobAddressesSectionPCF,
  JobHiringTeamSectionPCF,
  JobClientDetailsSectionPCF,
  JobHistorySectionPCF,
} from './sections/jobs.sections'

// Type definition for Job entity
export interface Job extends Record<string, unknown> {
  id: string
  title: string
  status: string
  wizard_state?: {
    currentStep: number
    totalSteps: number
    lastSavedAt: string
  } | null
  account_id?: string
  account?: {
    id: string
    name: string
  }
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  location?: string
  job_type?: string
  type?: string
  billing_rate?: number
  bill_rate_min?: number
  bill_rate_max?: number
  salary_min?: number
  salary_max?: number
  priority?: string
  positions_available?: number
  openings?: number
  positions_filled?: number
  submissions_count?: number
  interviews_count?: number
  description?: string
  requirements?: string
  start_date?: string
  end_date?: string
  due_date?: string
  dueDate?: string
  created_at: string
  createdAt?: string
  updated_at?: string
  created_by?: string
  owner_id?: string
  // JOBS-01: Unified company/contact references
  client_company_id?: string
  client_company?: {
    id: string
    name: string
  }
  end_client_company_id?: string
  end_client_company?: {
    id: string
    name: string
  }
  vendor_company_id?: string
  vendor_company?: {
    id: string
    name: string
  }
  hiring_manager_contact_id?: string
  hiring_manager_contact?: {
    id: string
    full_name: string
  }
  hr_contact_id?: string
  hr_contact?: {
    id: string
    full_name: string
  }
  external_job_id?: string
  priority_rank?: number
  sla_days?: number
  fee_type?: string
  fee_percentage?: number
  fee_flat_amount?: number
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

// Job type configuration
export const JOB_TYPE_CONFIG: Record<string, StatusConfig> = {
  full_time: {
    label: 'Full-Time',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  contract: {
    label: 'Contract',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  contract_to_hire: {
    label: 'Contract-to-Hire',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  part_time: {
    label: 'Part-Time',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
}

// JOBS-01: Priority rank configuration (numeric ranking)
export const JOB_PRIORITY_RANK_CONFIG: Record<number, StatusConfig> = {
  1: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: AlertCircle,
  },
  2: {
    label: 'High',
    color: 'bg-amber-100 text-amber-700',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: AlertCircle,
  },
  3: {
    label: 'Normal',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  4: {
    label: 'Low',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
  },
  0: {
    label: 'Unset',
    color: 'bg-charcoal-50 text-charcoal-500',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-500',
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
      icon: Play,
    },
    {
      key: 'filledThisMonth',
      label: 'Filled This Month',
      color: 'bg-purple-100 text-purple-800',
      icon: CheckCircle,
    },
    {
      key: 'avgTimeToFill',
      label: 'Avg Time to Fill',
      color: 'bg-amber-100 text-amber-800',
      icon: Clock,
      format: (value: number) => `${value} days`,
    },
    {
      key: 'avgSubmissions',
      label: 'Avg Submissions',
      color: 'bg-blue-100 text-blue-800',
      icon: Users,
      format: (value: number) => value.toFixed(1),
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
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(JOB_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(JOB_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'priority',
      type: 'select',
      label: 'Priority',
      options: [
        { value: 'all', label: 'All Priorities' },
        ...Object.entries(JOB_PRIORITY_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'priorityRank',
      type: 'select',
      label: 'Priority Rank',
      options: [
        { value: 'all', label: 'All Ranks' },
        { value: '1', label: 'Critical' },
        { value: '2', label: 'High' },
        { value: '3', label: 'Normal' },
        { value: '4', label: 'Low' },
      ],
    },
  ],

  columns: [
    {
      key: 'title',
      header: 'Job Title',
      label: 'Job Title',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'account',
      header: 'Client',
      label: 'Client',
      sortable: true,
      width: 'w-[150px]',
      render: (value) => {
        const account = value as Job['account']
        return account?.name || '—'
      },
    },
    {
      key: 'location',
      header: 'Location',
      label: 'Location',
      sortable: true,
      width: 'w-[130px]',
    },
    {
      key: 'type',
      header: 'Type',
      label: 'Type',
      sortable: true,
      width: 'w-[100px]',
      render: (value, entity) => {
        const job = entity as Job
        const type = job.type || job.job_type
        return JOB_TYPE_CONFIG[type || '']?.label || type || '—'
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
      key: 'priorityRank',
      header: 'Priority',
      label: 'Priority',
      sortable: true,
      width: 'w-[90px]',
      render: (value, entity) => {
        const job = entity as Job
        return <PriorityBadge rank={job.priority_rank} size="sm" />
      },
    },
    {
      key: 'slaDays',
      header: 'SLA',
      label: 'SLA Days',
      sortable: true,
      width: 'w-[120px]',
      render: (value, entity) => {
        const job = entity as Job
        return (
          <SLAIndicator
            slaDays={job.sla_days}
            createdAt={job.created_at}
            status={job.status}
            size="sm"
          />
        )
      },
    },
    {
      key: 'salaryRange',
      header: 'Salary Range',
      label: 'Salary Range',
      width: 'w-[120px]',
      align: 'right' as const,
      render: (value, entity) => {
        const job = entity as Job
        const min = job.salary_min || job.bill_rate_min
        const max = job.salary_max || job.bill_rate_max
        if (min && max) {
          return `$${(min / 1000).toFixed(0)}k-$${(max / 1000).toFixed(0)}k`
        }
        if (min) return `$${(min / 1000).toFixed(0)}k+`
        if (max) return `Up to $${(max / 1000).toFixed(0)}k`
        return '—'
      },
    },
    {
      key: 'openings',
      header: 'Openings',
      label: 'Openings',
      sortable: true,
      width: 'w-[80px]',
      align: 'right' as const,
      render: (value, entity) => {
        const job = entity as Job
        return (job.openings || job.positions_available || 1).toString()
      },
    },
    {
      key: 'submissions',
      header: 'Submissions',
      label: 'Submissions',
      sortable: true,
      width: 'w-[90px]',
      align: 'right' as const,
      render: (value, entity) => {
        const job = entity as Job
        return (job.submissions_count || 0).toString()
      },
    },
    {
      key: 'interviews',
      header: 'Interviews',
      label: 'Interviews',
      sortable: true,
      width: 'w-[80px]',
      align: 'right' as const,
      render: (value, entity) => {
        const job = entity as Job
        return (job.interviews_count || 0).toString()
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      label: 'Owner',
      sortable: true,
      width: 'w-[130px]',
      render: (value) => {
        const owner = value as Job['owner']
        return owner?.full_name || '—'
      },
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      label: 'Due Date',
      sortable: true,
      width: 'w-[100px]',
      format: 'date' as const,
      render: (value, entity) => {
        const job = entity as Job
        const date = job.dueDate || job.due_date
        if (!date) return '—'
        return new Date(date).toLocaleDateString()
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      label: 'Created',
      sortable: true,
      width: 'w-[100px]',
      format: 'relative-date' as const,
    },
  ],

  renderMode: 'table',
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
    const typeValue = filters.type as string | undefined
    const priorityValue = filters.priority as string | undefined
    const priorityRankValue = filters.priorityRank as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['draft', 'open', 'active', 'on_hold', 'filled', 'cancelled', 'closed', 'all'] as const
    const validTypes = ['full_time', 'contract', 'contract_to_hire', 'part_time'] as const
    const _validSortFields = [
      'title',
      'company_id',
      'location',
      'job_type',
      'status',
      'positions_available',
      'submissions_count',
      'interviews_count',
      'owner_id',
      'due_date',
      'created_at',
      'priority_rank',
      'sla_days',
    ] as const

    type JobStatus = (typeof validStatuses)[number]
    type JobType = (typeof validTypes)[number]
    type SortField = (typeof _validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      title: 'title',
      account: 'company_id',
      location: 'location',
      type: 'job_type',
      status: 'status',
      openings: 'positions_available',
      submissions: 'submissions_count',
      interviews: 'interviews_count',
      owner: 'owner_id',
      dueDate: 'due_date',
      createdAt: 'created_at',
      priorityRank: 'priority_rank',
      slaDays: 'sla_days',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    return trpc.ats.jobs.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as JobStatus) ? statusValue : 'all') as JobStatus,
      type: typeValue && typeValue !== 'all' && validTypes.includes(typeValue as JobType)
        ? typeValue as JobType
        : undefined,
      priority: priorityValue !== 'all' ? priorityValue : undefined,
      priorityRank: priorityRankValue && priorityRankValue !== 'all' ? parseInt(priorityRankValue, 10) : undefined,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  useStatsQuery: () => trpc.ats.jobs.stats.useQuery(),

  // Draft support - shows user's draft jobs at top of list view
  drafts: {
    enabled: true,
    wizardRoute: '/employee/recruiting/jobs/intake',
    displayNameField: 'title',
    useGetMyDraftsQuery: () => trpc.ats.jobs.listMyDrafts.useQuery(),
    useDeleteDraftMutation: () => trpc.ats.jobs.deleteDraft.useMutation(),
  },
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
      id: 'location',
      label: 'Location',
      icon: MapPin,
      component: JobAddressesSectionPCF,
    },
    {
      id: 'team',
      label: 'Hiring Team',
      icon: Users,
      component: JobHiringTeamSectionPCF,
    },
    {
      id: 'client',
      label: 'Client Details',
      icon: Building2,
      component: JobClientDetailsSectionPCF,
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
    {
      id: 'history',
      label: 'History',
      icon: History,
      component: JobHistorySectionPCF,
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

  useEntityQuery: (entityId, options) =>
    trpc.ats.jobs.getFullJob.useQuery(
      { id: entityId },
      { enabled: options?.enabled ?? true }
    ),
}

