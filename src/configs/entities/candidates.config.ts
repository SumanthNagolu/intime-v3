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
  TrendingUp,
  Users,
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

// Type definition for Candidate entity (Unified Contact Model)
// Candidates are now stored in the contacts table with subtype='candidate'
export interface Candidate extends Record<string, unknown> {
  id: string
  // Core contact fields
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  mobile?: string | null
  title?: string | null
  linkedin_url?: string | null
  avatar_url?: string | null
  // Subtype (should always be 'candidate' for this entity)
  subtype?: string
  // Legacy fields (for backward compatibility during migration)
  location?: string | null
  status: string
  // Candidate-specific fields (prefixed in contacts table)
  candidate_status?: string | null
  candidate_availability?: string | null
  candidate_skills?: string[] | null
  candidate_experience_years?: number | null
  candidate_current_visa?: string | null
  candidate_visa_expiry?: string | null
  candidate_hourly_rate?: number | null
  candidate_bench_start_date?: string | null
  candidate_location?: string | null
  candidate_willing_to_relocate?: boolean
  candidate_preferred_locations?: string[] | null
  candidate_resume_url?: string | null
  candidate_is_on_hotlist?: boolean
  candidate_hotlist_added_at?: string | null
  candidate_hotlist_notes?: string | null
  candidate_professional_headline?: string | null
  candidate_professional_summary?: string | null
  candidate_recruiter_rating?: number | null
  // Legacy field mappings (for backward compatibility)
  availability?: string | null
  years_experience?: number | null
  experience?: number | null
  visa_status?: string | null
  minimum_rate?: number | null
  desired_rate?: number | null
  salary_expected?: number | null
  is_on_hotlist?: boolean
  lead_source?: string | null
  source?: string | null
  professional_summary?: string | null
  skills?: Array<{ skill_name: string; years_experience?: number }> | string[] | null
  tags?: string[] | null
  sourced_by?: string | null
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  owner_id?: string
  submissions_count?: number
  last_activity_date?: string | null
  lastActivityDate?: string | null
  created_at: string
  createdAt?: string
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

// Candidate source configuration
export const CANDIDATE_SOURCE_CONFIG: Record<string, StatusConfig> = {
  linkedin: {
    label: 'LinkedIn',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  referral: {
    label: 'Referral',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  job_board: {
    label: 'Job Board',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  website: {
    label: 'Website',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  agency: {
    label: 'Agency',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
  },
  other: {
    label: 'Other',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
  },
}

// Experience range options for filters
export const EXPERIENCE_RANGE_OPTIONS = [
  { value: '0-2', label: '0-2 years' },
  { value: '2-5', label: '2-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
]

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
      icon: Users,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'placedThisMonth',
      label: 'Placed This Month',
      color: 'bg-gold-100 text-gold-800',
      icon: Award,
    },
    {
      key: 'avgPlacementRate',
      label: 'Placement Rate',
      color: 'bg-purple-100 text-purple-800',
      icon: TrendingUp,
      format: (value: number) => `${value}%`,
    },
    {
      key: 'newThisWeek',
      label: 'New This Week',
      color: 'bg-blue-100 text-blue-800',
      icon: Plus,
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
      key: 'experienceRange',
      type: 'select',
      label: 'Experience',
      options: [
        { value: 'all', label: 'All Experience' },
        ...EXPERIENCE_RANGE_OPTIONS,
      ],
    },
    {
      key: 'source',
      type: 'select',
      label: 'Source',
      options: [
        { value: 'all', label: 'All Sources' },
        ...Object.entries(CANDIDATE_SOURCE_CONFIG).map(([value, config]) => ({
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
      header: 'Name',
      label: 'Name',
      sortable: true,
      width: 'min-w-[180px]',
      render: (value, entity) => {
        const candidate = entity as Candidate
        const name = `${candidate.first_name} ${candidate.last_name}`.trim()
        return name || '—'
      },
    },
    {
      key: 'title',
      header: 'Title',
      label: 'Title',
      sortable: true,
      width: 'w-[150px]',
    },
    {
      key: 'skills',
      header: 'Skills',
      label: 'Skills',
      width: 'w-[200px]',
      render: (value, entity) => {
        const candidate = entity as Candidate
        // Support both unified model (candidate_skills array) and legacy (skills object array)
        const skills = candidate.candidate_skills ?? candidate.skills
        if (!skills || skills.length === 0) return '—'
        // Handle both string[] and object[] formats
        const skillNames = skills.slice(0, 3).map(s => 
          typeof s === 'string' ? s : (s as { skill_name: string }).skill_name
        )
        return skillNames.join(', ')
      },
    },
    {
      key: 'location',
      header: 'Location',
      label: 'Location',
      sortable: true,
      width: 'w-[130px]',
      render: (value, entity) => {
        const candidate = entity as Candidate
        // Support both unified model and legacy field names
        return candidate.candidate_location ?? candidate.location ?? '—'
      },
    },
    {
      key: 'status',
      header: 'Status',
      label: 'Status',
      sortable: true,
      width: 'w-[90px]',
      format: 'status' as const,
      render: (value, entity) => {
        const candidate = entity as Candidate
        // Prefer candidate_status from unified model, fallback to status
        return candidate.candidate_status ?? candidate.status ?? '—'
      },
    },
    {
      key: 'experience',
      header: 'Exp',
      label: 'Experience',
      sortable: true,
      width: 'w-[80px]',
      align: 'right' as const,
      render: (value, entity) => {
        const candidate = entity as Candidate
        // Support unified model and legacy field names
        const years = candidate.candidate_experience_years ?? candidate.experience ?? candidate.years_experience
        if (years === null || years === undefined) return '—'
        return `${years} yrs`
      },
    },
    {
      key: 'salaryExpected',
      header: 'Rate',
      label: 'Rate',
      width: 'w-[100px]',
      align: 'right' as const,
      render: (value, entity) => {
        const candidate = entity as Candidate
        // Support unified model and legacy field names
        const rate = candidate.candidate_hourly_rate ?? candidate.salary_expected ?? candidate.desired_rate
        if (rate === null || rate === undefined) return '—'
        return `$${rate}/hr`
      },
    },
    {
      key: 'source',
      header: 'Source',
      label: 'Source',
      sortable: true,
      width: 'w-[100px]',
      render: (value, entity) => {
        const candidate = entity as Candidate
        const source = candidate.source ?? candidate.lead_source
        return CANDIDATE_SOURCE_CONFIG[source || '']?.label || source || '—'
      },
    },
    {
      key: 'availability',
      header: 'Availability',
      label: 'Availability',
      sortable: true,
      width: 'w-[100px]',
      render: (value, entity) => {
        const candidate = entity as Candidate
        // Support unified model and legacy field names
        const avail = candidate.candidate_availability ?? candidate.availability
        return CANDIDATE_AVAILABILITY_CONFIG[avail || '']?.label || avail || '—'
      },
    },
    {
      key: 'hotlist',
      header: '★',
      label: 'Hotlist',
      width: 'w-[50px]',
      align: 'center' as const,
      render: (value, entity) => {
        const candidate = entity as Candidate
        // Support unified model and legacy field names
        const isOnHotlist = candidate.candidate_is_on_hotlist ?? candidate.is_on_hotlist
        return isOnHotlist ? '★' : '—'
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      label: 'Owner',
      sortable: true,
      width: 'w-[130px]',
      render: (value) => {
        const owner = value as Candidate['owner']
        return owner?.full_name || '—'
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

  // tRPC hooks for data fetching
  // Uses unified contacts router with subtype='candidate' (Guidewire-inspired model)
  // Falls back to legacy ATS router if unified router unavailable
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const sourceValue = filters.source as string | undefined
    const experienceRangeValue = filters.experienceRange as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    // Map candidate statuses for the unified model
    const candidateStatusMap: Record<string, string> = {
      active: 'active',
      sourced: 'active', // Legacy status maps to active
      screening: 'active', // Screening is an activity, not a status
      bench: 'bench',
      placed: 'placed',
      inactive: 'inactive',
      archived: 'inactive',
    }

    // Map frontend sort keys to unified contacts table columns
    const sortFieldMap: Record<string, string> = {
      name: 'first_name',
      title: 'title',
      location: 'candidate_location',
      status: 'candidate_status',
      experience: 'candidate_experience_years',
      source: 'source',
      owner: 'owner_id',
      lastActivity: 'last_activity_date',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    // Convert experience range to min/max
    let minExperience: number | undefined
    let maxExperience: number | undefined
    if (experienceRangeValue && experienceRangeValue !== 'all') {
      switch (experienceRangeValue) {
        case '0-2':
          minExperience = 0
          maxExperience = 2
          break
        case '2-5':
          minExperience = 2
          maxExperience = 5
          break
        case '5-10':
          minExperience = 5
          maxExperience = 10
          break
        case '10+':
          minExperience = 10
          break
      }
    }

    // Map the status to candidate_status
    const candidateStatus = statusValue && statusValue !== 'all' 
      ? candidateStatusMap[statusValue] as 'active' | 'passive' | 'placed' | 'bench' | 'inactive' | 'blacklisted' | undefined
      : undefined

    // Use unified contacts router with candidate subtype
    return trpc.unifiedContacts.candidates.list.useQuery({
      search: filters.search as string | undefined,
      status: candidateStatus,
      onHotlist: filters.isOnHotlist as boolean | undefined,
      minExperience,
      maxExperience,
      limit: (filters.limit as number) || 25,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy as 'name' | 'candidate_status' | 'candidate_experience_years' | 'candidate_hourly_rate' | 'created_at',
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  // Use unified contacts candidate stats
  useStatsQuery: () => trpc.unifiedContacts.candidates.stats.useQuery(),
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
        // Support unified model and legacy field names
        return candidate.candidate_experience_years ?? candidate.years_experience ?? 0
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
        // Support unified model and legacy field names
        return candidate.candidate_hourly_rate ?? candidate.desired_rate ?? 0
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
        // Support unified model and legacy field names
        const avail = candidate.candidate_availability ?? candidate.availability
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
        // Support unified model and legacy field names
        return (candidate.candidate_is_on_hotlist ?? candidate.is_on_hotlist) ? 'Yes' : 'No'
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

  // Use unified contacts router for candidate details
  useEntityQuery: (entityId) => trpc.unifiedContacts.getById.useQuery({ id: entityId }),
}
