import {
  User,
  Plus,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  FileText,
  Calendar,
  DollarSign,
  Award,
  Search,
  ClipboardCheck,
  Send,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import {
  CandidateOverviewSectionPCF,
  CandidateScreeningSectionPCF,
  CandidateProfilesSectionPCF,
  CandidateSubmissionsSectionPCF,
  CandidateActivitiesSectionPCF,
} from './sections/candidates.sections'

// Type definition for Candidate entity
export interface Candidate extends Record<string, unknown> {
  id: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  title?: string | null
  location?: string | null
  status: string
  availability?: string | null
  years_experience?: number | null
  visa_status?: string | null
  minimum_rate?: number | null
  desired_rate?: number | null
  is_on_hotlist?: boolean
  lead_source?: string | null
  professional_summary?: string | null
  skills?: Array<{ skill_name: string; years_experience?: number }> | null
  tags?: string[] | null
  sourced_by?: string | null
  created_at: string
  updated_at?: string
}

// Candidate status configuration
export const CANDIDATE_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  screening: {
    label: 'Screening',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Search,
  },
  sourced: {
    label: 'Sourced',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Search,
  },
  placed: {
    label: 'Placed',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Award,
  },
  bench: {
    label: 'On Bench',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: XCircle,
  },
  archived: {
    label: 'Archived',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
}

// Candidate availability configuration
export const CANDIDATE_AVAILABILITY_CONFIG: Record<string, StatusConfig> = {
  immediate: {
    label: 'Immediate',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  one_week: {
    label: '1 Week',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  two_weeks: {
    label: '2 Weeks',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  one_month: {
    label: '1 Month',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  not_available: {
    label: 'Not Available',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
  },
}

// Candidates List View Configuration
export const candidatesListConfig: ListViewConfig<Candidate> = {
  entityType: 'candidate',
  entityName: { singular: 'Candidate', plural: 'Candidates' },
  baseRoute: '/employee/recruiting/candidates',

  title: 'Candidates',
  description: 'Search and manage your candidate database',
  icon: User,

  primaryAction: {
    label: 'Add Candidate',
    icon: Plus,
    href: '/employee/recruiting/candidates/new',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Candidates',
      icon: User,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'hotlist',
      label: 'On Hotlist',
      color: 'bg-gold-100 text-gold-800',
      icon: Star,
    },
    {
      key: 'addedThisWeek',
      label: 'Added This Week',
      color: 'bg-blue-100 text-blue-800',
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Candidates',
      placeholder: 'Search by name, skills, location...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(CANDIDATE_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'availability',
      type: 'select',
      label: 'Availability',
      options: [
        { value: 'all', label: 'All' },
        ...Object.entries(CANDIDATE_AVAILABILITY_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'isOnHotlist',
      type: 'toggle',
      label: 'Hotlist Only',
    },
  ],

  columns: [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, entity) => {
        const candidate = entity as Candidate
        const name = `${candidate.first_name} ${candidate.last_name}`.trim()
        return name || '—'
      },
    },
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'location',
      label: 'Location',
      icon: MapPin,
    },
    {
      key: 'availability',
      label: 'Availability',
      render: (value) => {
        const avail = value as string | null
        return CANDIDATE_AVAILABILITY_CONFIG[avail || '']?.label || avail || '—'
      },
    },
    {
      key: 'years_experience',
      label: 'Experience',
      render: (value) => {
        const years = value as number | null
        if (years === null || years === undefined) return '—'
        return `${years} yrs`
      },
    },
    {
      key: 'desired_rate',
      label: 'Rate',
      type: 'currency',
      render: (value) => {
        const rate = value as number | null
        if (rate === null || rate === undefined) return '—'
        return `$${rate}/hr`
      },
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: CANDIDATE_STATUS_CONFIG,

  pageSize: 25,

  emptyState: {
    icon: User,
    title: 'No candidates found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Add your first candidate to start building your talent database',
    action: {
      label: 'Add Candidate',
      href: '/employee/recruiting/candidates/new',
    },
  },

  // tRPC hooks for data fetching using advancedSearch
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const availabilityValue = filters.availability as string | undefined
    const validStatuses = [
      'active',
      'sourced',
      'screening',
      'bench',
      'placed',
      'inactive',
      'archived',
    ] as const

    return trpc.ats.candidates.advancedSearch.useQuery({
      search: filters.search as string | undefined,
      statuses:
        statusValue && statusValue !== 'all' ? [statusValue as (typeof validStatuses)[number]] : undefined,
      availability: availabilityValue !== 'all' ? (availabilityValue as never) : undefined,
      isOnHotlist: filters.isOnHotlist as boolean | undefined,
      limit: (filters.limit as number) || 25,
      offset: (filters.offset as number) || 0,
      sortBy: 'last_updated',
      sortOrder: 'desc',
    })
  },

  useStatsQuery: () => trpc.ats.candidates.getSourcingStats.useQuery({ period: 'week' }),
}

// Candidates Detail View Configuration
export const candidatesDetailConfig: DetailViewConfig<Candidate> = {
  entityType: 'candidate',
  baseRoute: '/employee/recruiting/candidates',
  titleField: 'first_name',
  statusField: 'status',
  statusConfig: CANDIDATE_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'Recruiting', href: '/employee/recruiting' },
    { label: 'Candidates', href: '/employee/recruiting/candidates' },
  ],

  titleFormatter: (entity) => {
    const candidate = entity as Candidate
    return `${candidate.first_name} ${candidate.last_name}`.trim() || 'Unknown Candidate'
  },

  subtitleFields: [
    { key: 'title' },
    { key: 'location', icon: MapPin },
    { key: 'email', icon: Mail },
    { key: 'phone', icon: Phone },
  ],

  metrics: [
    {
      key: 'experience',
      label: 'Years Exp',
      icon: Briefcase,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const candidate = entity as Candidate
        return candidate.years_experience || 0
      },
      tooltip: 'Years of experience',
    },
    {
      key: 'rate',
      label: 'Desired Rate',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const candidate = entity as Candidate
        return candidate.desired_rate || 0
      },
      format: (value) => `$${Number(value)}/hr`,
      tooltip: 'Desired hourly rate',
    },
    {
      key: 'availability',
      label: 'Availability',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const candidate = entity as Candidate
        const avail = candidate.availability
        return CANDIDATE_AVAILABILITY_CONFIG[avail || '']?.label || avail || 'Unknown'
      },
      tooltip: 'Availability status',
    },
    {
      key: 'hotlist',
      label: 'Hotlist',
      icon: Star,
      iconBg: 'bg-gold-100',
      iconColor: 'text-gold-600',
      getValue: (entity: unknown) => {
        const candidate = entity as Candidate
        return candidate.is_on_hotlist ? 'Yes' : 'No'
      },
      tooltip: 'On hotlist',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: User,
      component: CandidateOverviewSectionPCF,
    },
    {
      id: 'screening',
      label: 'Screening',
      icon: ClipboardCheck,
      showCount: true,
      component: CandidateScreeningSectionPCF,
    },
    {
      id: 'profiles',
      label: 'Profiles',
      icon: FileText,
      showCount: true,
      component: CandidateProfilesSectionPCF,
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: Send,
      showCount: true,
      component: CandidateSubmissionsSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activity',
      icon: Activity,
      component: CandidateActivitiesSectionPCF,
    },
  ],

  journeySteps: [
    {
      id: 'sourced',
      label: 'Sourced',
      icon: Search,
      activeStatuses: ['active'],
      completedStatuses: ['screening', 'interviewing', 'placed', 'bench'],
    },
    {
      id: 'screening',
      label: 'Screening',
      icon: FileText,
      activeStatuses: ['screening'],
      completedStatuses: ['interviewing', 'placed', 'bench'],
    },
    {
      id: 'interviewing',
      label: 'Interviewing',
      icon: Calendar,
      activeStatuses: ['interviewing'],
      completedStatuses: ['placed', 'bench'],
    },
    {
      id: 'placed',
      label: 'Placed',
      icon: Award,
      activeStatuses: ['placed'],
      completedStatuses: [],
    },
  ],

  quickActions: [
    {
      id: 'submit-to-job',
      label: 'Submit to Job',
      icon: Briefcase,
      variant: 'default',
      onClick: (entity: unknown) => {
        const candidate = entity as Candidate
        window.dispatchEvent(
          new CustomEvent('openCandidateDialog', {
            detail: { dialogId: 'submitToJob', candidateId: candidate.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const candidate = entity as Candidate
        return candidate.status === 'active' || candidate.status === 'bench'
      },
    },
    {
      id: 'add-to-hotlist',
      label: 'Add to Hotlist',
      icon: Star,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const candidate = entity as Candidate
        window.dispatchEvent(
          new CustomEvent('openCandidateDialog', {
            detail: { dialogId: 'addToHotlist', candidateId: candidate.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const candidate = entity as Candidate
        return !candidate.is_on_hotlist
      },
    },
    {
      id: 'start-screening',
      label: 'Start Screening',
      icon: FileText,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const candidate = entity as Candidate
        window.location.href = `/employee/recruiting/candidates/${candidate.id}/screening`
      },
      isVisible: (entity: unknown) => {
        const candidate = entity as Candidate
        return candidate.status === 'active'
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Candidate',
      icon: FileText,
      onClick: (entity) => {
        window.location.href = `/employee/recruiting/candidates/${entity.id}/edit`
      },
    },
    {
      label: 'View Resume',
      icon: FileText,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCandidateDialog', {
            detail: { dialogId: 'viewResume', candidateId: entity.id },
          })
        )
      },
    },
    {
      label: 'Log Activity',
      icon: Activity,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCandidateDialog', {
            detail: { dialogId: 'logActivity', candidateId: entity.id },
          })
        )
      },
    },
    { separator: true, label: '' },
    {
      label: 'Mark as Inactive',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCandidateDialog', {
            detail: { dialogId: 'markInactive', candidateId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const candidate = entity as Candidate
        return candidate.status !== 'inactive' && candidate.status !== 'do_not_contact'
      },
    },
  ],

  eventNamespace: 'candidate',

  useEntityQuery: (entityId) => trpc.ats.candidates.getById.useQuery({ id: entityId }),
}
