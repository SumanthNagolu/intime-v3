import {
  Target,
  Plus,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserPlus,
  DollarSign,
  Activity,
  FileText,
  Linkedin,
  Globe,
  Megaphone,
  Calendar,
  ClipboardList,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import { LeadDraftsTabContent } from '@/components/pcf/list-view/LeadDraftsTabContent'
import {
  LeadOverviewSectionPCF,
  LeadBANTSectionPCF,
  LeadActivitiesSectionPCF,
  LeadTasksSectionPCF,
  LeadNotesSectionPCF,
} from './sections/leads.sections'

// Type definition for Lead entity
export interface Lead extends Record<string, unknown> {
  id: string
  company_name?: string | null
  first_name?: string | null
  last_name?: string | null
  title?: string | null
  email?: string | null
  phone?: string | null
  industry?: string | null
  lead_type: string
  status: string
  source: string
  bant_total_score?: number | null
  estimated_value?: number | null
  skills_needed?: string[] | null
  campaign_id?: string | null
  campaign?: {
    id: string
    name: string
  } | null
  business_need?: string | null
  positions_count?: number | null
  owner_id?: string | null
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  created_at?: string | null
  updated_at?: string | null
  qualified_at?: string | null
  converted_at?: string | null
  last_contacted_at?: string | null
}

// Lead status configuration
export const LEAD_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-50 text-charcoal-500',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-500',
    icon: FileText,
  },
  new: {
    label: 'New',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: UserPlus,
  },
  contacted: {
    label: 'Contacted',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Phone,
  },
  qualified: {
    label: 'Qualified',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle2,
  },
  unqualified: {
    label: 'Unqualified',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
  nurture: {
    label: 'Nurture',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
  converted: {
    label: 'Converted',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: ArrowRight,
  },
}

// Lead source configuration
export const LEAD_SOURCE_CONFIG: Record<string, StatusConfig> = {
  linkedin: {
    label: 'LinkedIn',
    color: 'bg-blue-600 text-white',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    icon: Linkedin,
  },
  referral: {
    label: 'Referral',
    color: 'bg-green-600 text-white',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    icon: User,
  },
  cold_outreach: {
    label: 'Cold Outreach',
    color: 'bg-charcoal-600 text-white',
    bgColor: 'bg-charcoal-600',
    textColor: 'text-white',
    icon: Phone,
  },
  inbound: {
    label: 'Inbound',
    color: 'bg-amber-600 text-white',
    bgColor: 'bg-amber-600',
    textColor: 'text-white',
    icon: Mail,
  },
  event: {
    label: 'Event',
    color: 'bg-purple-600 text-white',
    bgColor: 'bg-purple-600',
    textColor: 'text-white',
    icon: Calendar,
  },
  website: {
    label: 'Website',
    color: 'bg-cyan-600 text-white',
    bgColor: 'bg-cyan-600',
    textColor: 'text-white',
    icon: Globe,
  },
  campaign: {
    label: 'Campaign',
    color: 'bg-gold-600 text-white',
    bgColor: 'bg-gold-600',
    textColor: 'text-white',
    icon: Megaphone,
  },
  other: {
    label: 'Other',
    color: 'bg-charcoal-400 text-white',
    bgColor: 'bg-charcoal-400',
    textColor: 'text-white',
  },
}

// Leads List View Configuration
export const leadsListConfig: ListViewConfig<Lead> = {
  entityType: 'lead',
  entityName: { singular: 'Lead', plural: 'Leads' },
  baseRoute: '/employee/crm/leads',

  title: 'Leads',
  description: 'Manage and qualify leads for your pipeline',
  icon: Target,

  primaryAction: {
    label: 'New Lead',
    icon: Plus,
    href: '/employee/crm/leads/new',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Leads',
      icon: Target,
    },
    {
      key: 'new',
      label: 'New This Week',
      color: 'bg-blue-100 text-blue-800',
      icon: UserPlus,
    },
    {
      key: 'qualified',
      label: 'Qualified',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle2,
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      color: 'bg-purple-100 text-purple-800',
      format: (value: number) => `${value.toFixed(1)}%`,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Leads',
      placeholder: 'Search by name, company, email...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(LEAD_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'source',
      type: 'select',
      label: 'Source',
      options: [
        { value: 'all', label: 'All Sources' },
        ...Object.entries(LEAD_SOURCE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'campaignId',
      type: 'select',
      label: 'Campaign',
      options: [
        { value: 'all', label: 'All Campaigns' },
        // Note: Dynamic campaign options would be loaded at runtime
      ],
    },
    {
      key: 'minScore',
      type: 'select',
      label: 'Score Range',
      options: [
        { value: 'all', label: 'All Scores' },
        { value: '80', label: 'Hot (80+)' },
        { value: '60', label: 'Warm (60+)' },
        { value: '40', label: 'Cool (40+)' },
        { value: '0', label: 'Cold (0+)' },
      ],
    },
    {
      key: 'ownerId',
      type: 'select',
      label: 'Assigned To',
      options: [
        { value: 'all', label: 'All Owners' },
        { value: 'me', label: 'Assigned to Me' },
        { value: 'unassigned', label: 'Unassigned' },
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      header: 'Lead Name',
      label: 'Lead Name',
      sortable: true,
      width: 'min-w-[180px]',
      render: (value, entity) => {
        const lead = entity as Lead
        if (lead.lead_type === 'individual') {
          return `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || '—'
        }
        const contactName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
        return contactName || lead.company_name || '—'
      },
    },
    {
      key: 'company_name',
      header: 'Company',
      label: 'Company',
      sortable: true,
      width: 'w-[150px]',
      render: (value, entity) => {
        const lead = entity as Lead
        return lead.company_name || '—'
      },
    },
    {
      key: 'email',
      header: 'Email',
      label: 'Email',
      sortable: false,
      width: 'w-[180px]',
      render: (value, entity) => {
        const lead = entity as Lead
        return lead.email || '—'
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      label: 'Phone',
      sortable: false,
      width: 'w-[120px]',
      render: (value, entity) => {
        const lead = entity as Lead
        return lead.phone || '—'
      },
    },
    {
      key: 'source',
      header: 'Source',
      label: 'Source',
      sortable: true,
      width: 'w-[120px]',
      render: (value) => {
        const source = value as string
        return LEAD_SOURCE_CONFIG[source]?.label || source || '—'
      },
    },
    {
      key: 'lead_status',
      header: 'Status',
      label: 'Status',
      sortable: true,
      width: 'w-[100px]',
      format: 'status' as const,
    },
    {
      key: 'bant_total_score',
      header: 'Score',
      label: 'Score',
      sortable: true,
      width: 'w-[80px]',
      align: 'right' as const,
      render: (value) => {
        const score = value as number | null
        if (!score) return '—'
        return `${score}`
      },
    },
    {
      key: 'campaign',
      header: 'Campaign',
      label: 'Campaign',
      sortable: true,
      width: 'w-[140px]',
      render: (value) => {
        const campaign = value as Lead['campaign']
        return campaign?.name || '—'
      },
    },
    {
      key: 'owner',
      header: 'Assigned To',
      label: 'Assigned To',
      sortable: true,
      width: 'w-[130px]',
      render: (value) => {
        const owner = value as Lead['owner']
        return owner?.full_name || '—'
      },
    },
    {
      key: 'last_contacted_at',
      header: 'Last Activity',
      label: 'Last Activity',
      sortable: true,
      width: 'w-[110px]',
      format: 'relative-date' as const,
    },
    {
      key: 'created_at',
      header: 'Created',
      label: 'Created',
      sortable: true,
      width: 'w-[100px]',
      format: 'relative-date' as const,
    },
  ],

  renderMode: 'table',
  statusField: 'lead_status',
  statusConfig: LEAD_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Target,
    title: 'No leads found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first lead to start building your pipeline',
    action: {
      label: 'Create Lead',
      href: '/employee/crm/leads/new',
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined
    const minScoreValue = filters.minScore as string | undefined
    const ownerIdValue = filters.ownerId as string | undefined

    // Valid status values from the router's LeadStatus enum
    const validStatuses = [
      'new',
      'contacted',
      'warm',
      'hot',
      'cold',
      'qualified',
      'unqualified',
      'converted',
    ] as const
    type LeadStatus = (typeof validStatuses)[number]

    // Valid sort fields from the router's sortBy enum
    const validSortFields = ['name', 'lead_status', 'lead_score', 'lead_estimated_value', 'created_at'] as const
    type SortField = (typeof validSortFields)[number]

    // Map frontend column keys to valid router sort fields
    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      company_name: 'name', // Map to name (sorts by first_name in router)
      status: 'lead_status',
      bant_total_score: 'lead_score',
      created_at: 'created_at',
      // Fallbacks for columns without direct sort support
      source: 'created_at',
      campaign: 'created_at',
      owner: 'created_at',
      last_contacted_at: 'created_at',
    }

    const mappedSortBy: SortField = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    // Handle owner filter
    let ownerIdFilter: string | undefined
    if (ownerIdValue === 'me') {
      ownerIdFilter = undefined // Will be handled specially in the query
    } else if (ownerIdValue === 'unassigned') {
      ownerIdFilter = undefined // Need special handling in backend for null owner
    } else if (ownerIdValue && ownerIdValue !== 'all') {
      ownerIdFilter = ownerIdValue
    }

    // Map frontend status values to router status values
    // 'nurture' is not in router enum, map to undefined (no filter)
    const mappedStatus: LeadStatus | undefined = statusValue && statusValue !== 'all' && statusValue !== 'nurture'
      ? (validStatuses.includes(statusValue as LeadStatus) ? statusValue as LeadStatus : undefined)
      : undefined

    return trpc.unifiedContacts.leads.list.useQuery({
      search: filters.search as string | undefined,
      status: mappedStatus,
      ownerId: ownerIdFilter,
      minScore: minScoreValue && minScoreValue !== 'all' ? parseInt(minScoreValue, 10) : undefined,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  // Stats query for metrics cards
  useStatsQuery: () => {
    return trpc.unifiedContacts.leads.stats.useQuery()
  },

  // Tabs configuration - "Leads" and "Drafts" tabs
  tabs: [
    {
      id: 'leads',
      label: 'Leads',
      showFilters: true,
      useQuery: (filters) => {
        const statusValue = filters.status as string | undefined
        const sortByValue = filters.sortBy as string | undefined
        const sortOrderValue = filters.sortOrder as string | undefined
        const minScoreValue = filters.minScore as string | undefined
        const ownerIdValue = filters.ownerId as string | undefined

        const validStatuses = [
          'new', 'contacted', 'warm', 'hot', 'cold', 'qualified', 'unqualified', 'converted',
        ] as const
        type LeadStatus = (typeof validStatuses)[number]

        const validSortFields = ['name', 'lead_status', 'lead_score', 'lead_estimated_value', 'created_at'] as const
        type SortField = (typeof validSortFields)[number]

        const sortFieldMap: Record<string, SortField> = {
          name: 'name',
          company_name: 'name',
          status: 'lead_status',
          bant_total_score: 'lead_score',
          created_at: 'created_at',
          source: 'created_at',
          campaign: 'created_at',
          owner: 'created_at',
          last_contacted_at: 'created_at',
        }

        const mappedSortBy: SortField = sortByValue && sortFieldMap[sortByValue]
          ? sortFieldMap[sortByValue]
          : 'created_at'

        let ownerIdFilter: string | undefined
        if (ownerIdValue && ownerIdValue !== 'all' && ownerIdValue !== 'me' && ownerIdValue !== 'unassigned') {
          ownerIdFilter = ownerIdValue
        }

        const mappedStatus: LeadStatus | undefined = statusValue && statusValue !== 'all' && statusValue !== 'nurture'
          ? (validStatuses.includes(statusValue as LeadStatus) ? statusValue as LeadStatus : undefined)
          : undefined

        return trpc.unifiedContacts.leads.list.useQuery({
          search: filters.search as string | undefined,
          status: mappedStatus,
          ownerId: ownerIdFilter,
          minScore: minScoreValue && minScoreValue !== 'all' ? parseInt(minScoreValue, 10) : undefined,
          limit: (filters.limit as number) || 20,
          offset: (filters.offset as number) || 0,
          sortBy: mappedSortBy,
          sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
        })
      },
      emptyState: {
        icon: Target,
        title: 'No leads found',
        description: (filters) =>
          filters.search
            ? 'Try adjusting your search or filters'
            : 'Create your first lead to start building your pipeline',
        action: {
          label: 'Create Lead',
          href: '/employee/crm/leads/new',
        },
      },
    },
    {
      id: 'drafts',
      label: 'Drafts',
      showFilters: false,
      useQuery: () => {
        const draftsQuery = trpc.unifiedContacts.leads.listMyDrafts.useQuery()
        return {
          data: draftsQuery.data ? {
            items: draftsQuery.data as unknown as Lead[],
            total: draftsQuery.data.length,
          } : undefined,
          isLoading: draftsQuery.isLoading,
          error: draftsQuery.error,
        }
      },
      customComponent: LeadDraftsTabContent,
      emptyState: {
        icon: FileText,
        title: 'No drafts',
        description: "You don't have any leads in progress. Start creating a new one!",
        action: {
          label: 'Start New Lead',
          href: '/employee/crm/leads/new',
        },
      },
    },
  ],
  defaultTab: 'leads',
}

// Leads Detail View Configuration
export const leadsDetailConfig: DetailViewConfig<Lead> = {
  entityType: 'lead',
  baseRoute: '/employee/crm/leads',
  titleField: 'company_name',
  statusField: 'lead_status',
  statusConfig: LEAD_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'CRM', href: '/employee/crm' },
    { label: 'Leads', href: '/employee/crm/leads' },
  ],

  titleFormatter: (entity) => {
    const lead = entity as Lead
    if (lead.lead_type === 'company') {
      return lead.company_name || 'Unknown Lead'
    }
    return `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown Lead'
  },

  subtitleFields: [
    { key: 'title' },
    { key: 'email', icon: Mail },
    { key: 'phone', icon: Phone },
    {
      key: 'source',
      format: (value) => {
        const source = value as string
        return LEAD_SOURCE_CONFIG[source]?.label || source
      },
    },
  ],

  metrics: [
    {
      key: 'bantScore',
      label: 'BANT Score',
      icon: Target,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const lead = entity as Lead
        return lead.bant_total_score || 0
      },
      getTotal: () => 100,
      tooltip: 'Budget, Authority, Need, Timeline score',
    },
    {
      key: 'estimatedValue',
      label: 'Est. Value',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const lead = entity as Lead
        return lead.estimated_value || 0
      },
      format: (value) => `$${Number(value).toLocaleString()}`,
      tooltip: 'Estimated contract value',
    },
    {
      key: 'positions',
      label: 'Positions',
      icon: User,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity: unknown) => {
        const lead = entity as Lead
        return lead.positions_count || 0
      },
      tooltip: 'Number of positions needed',
    },
    {
      key: 'daysInPipeline',
      label: 'Days in Pipeline',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const lead = entity as Lead
        if (!lead.created_at) return 0
        const created = new Date(lead.created_at)
        const now = new Date()
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      },
      tooltip: 'Days since lead was created',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: LeadOverviewSectionPCF,
    },
    {
      id: 'bant',
      label: 'BANT Scoring',
      icon: Target,
      component: LeadBANTSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: LeadActivitiesSectionPCF,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: ClipboardList,
      showCount: true,
      component: LeadTasksSectionPCF,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      component: LeadNotesSectionPCF,
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: () => {
        // Navigate to activities section where inline logging is available
        const url = new URL(window.location.href)
        url.searchParams.set('section', 'activities')
        window.history.pushState({}, '', url.toString())
        // Dispatch event to trigger section change
        window.dispatchEvent(new Event('popstate'))
      },
    },
    {
      id: 'qualify',
      label: 'Qualify Lead',
      icon: CheckCircle2,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const lead = entity as Lead
        window.dispatchEvent(
          new CustomEvent('openLeadDialog', {
            detail: { dialogId: 'qualify', leadId: lead.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const lead = entity as Lead
        return lead.status === 'new' || lead.status === 'contacted'
      },
    },
    {
      id: 'convert',
      label: 'Convert to Deal',
      icon: ArrowRight,
      variant: 'default',
      onClick: (entity: unknown) => {
        const lead = entity as Lead
        window.dispatchEvent(
          new CustomEvent('openLeadDialog', {
            detail: { dialogId: 'convert', leadId: lead.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const lead = entity as Lead
        return lead.status === 'qualified'
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Lead',
      icon: FileText,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openLeadDialog', {
            detail: { dialogId: 'edit', leadId: entity.id },
          })
        )
      },
    },
    {
      label: 'Send Email',
      icon: Mail,
      onClick: (entity) => {
        const lead = entity as Lead
        if (lead.email) {
          window.location.href = `mailto:${lead.email}`
        }
      },
      isVisible: (entity) => {
        const lead = entity as Lead
        return !!lead.email
      },
    },
    { separator: true, label: '' },
    {
      label: 'Mark as Unqualified',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openLeadDialog', {
            detail: { dialogId: 'disqualify', leadId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const lead = entity as Lead
        return lead.status !== 'unqualified' && lead.status !== 'converted'
      },
    },
  ],

  eventNamespace: 'lead',

  useEntityQuery: (entityId) => trpc.unifiedContacts.leads.getById.useQuery({ id: entityId }),
}
