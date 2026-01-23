import {
  Megaphone,
  Plus,
  Users,
  Target,
  Calendar,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  Pause,
  Play,
  TrendingUp,
  TrendingDown,
  Mail,
  BarChart3,
  UserPlus,
  MessageSquare,
  Workflow,
  History,
  StickyNote,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import { CampaignDraftsTabContent } from '@/components/pcf/list-view/CampaignDraftsTabContent'
import {
  CampaignOverviewSectionPCF,
  CampaignProspectsSectionPCF,
  CampaignLeadsSectionPCF,
  CampaignFunnelSectionPCF,
  CampaignSequenceSectionPCF,
  CampaignAnalyticsSectionPCF,
  CampaignActivitiesSectionPCF,
  CampaignNotesSectionPCF,
  CampaignDocumentsSectionPCF,
  CampaignHistorySectionPCF,
} from './sections/campaigns.sections'
import {
  CampaignSetupStepPCF,
  CampaignAudienceStepPCF,
  CampaignExecuteStepPCF,
  CampaignNurtureStepPCF,
  CampaignCloseStepPCF,
} from './steps/campaigns.steps'
import { Settings, Rocket, Heart, Flag } from 'lucide-react'

// Type definition for Campaign entity
export interface Campaign extends Record<string, unknown> {
  id: string
  name: string
  description?: string
  campaign_type?: string
  campaignType?: string
  goal?: string
  status: string
  start_date?: string
  startDate?: string
  end_date?: string
  endDate?: string
  channels?: string[]
  audience_size?: number
  audienceSize?: number
  prospects_contacted?: number
  prospectsContacted?: number
  prospects_responded?: number
  prospectsResponded?: number
  // Email engagement metrics for funnel
  emails_opened?: number
  emailsOpened?: number
  links_clicked?: number
  linksClicked?: number
  // Lead conversion metrics
  leads_generated?: number
  leadsGenerated?: number
  meetings_booked?: number
  meetingsBooked?: number
  // Targets
  target_leads?: number
  targetLeads?: number
  target_meetings?: number
  targetMeetings?: number
  // Budget
  budget_total?: number
  budgetTotal?: number
  budget_spent?: number
  budgetSpent?: number
  // Owner
  owner_id?: string
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  // Timestamps
  created_at: string
  updated_at?: string
}

// Campaign status configuration
export const CAMPAIGN_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: FileText,
  },
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Clock,
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Play,
  },
  paused: {
    label: 'Paused',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Pause,
  },
  completed: {
    label: 'Completed',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: CheckCircle,
  },
}

// Campaign type configuration
export const CAMPAIGN_TYPE_CONFIG: Record<string, StatusConfig> = {
  lead_generation: {
    label: 'Lead Generation',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: UserPlus,
  },
  re_engagement: {
    label: 'Re-engagement',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: MessageSquare,
  },
  event_promotion: {
    label: 'Event Promotion',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Calendar,
  },
  brand_awareness: {
    label: 'Brand Awareness',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Megaphone,
  },
  candidate_sourcing: {
    label: 'Candidate Sourcing',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    icon: Users,
  },
}

// Campaigns List View Configuration
export const campaignsListConfig: ListViewConfig<Campaign> = {
  entityType: 'campaign',
  entityName: { singular: 'Campaign', plural: 'Campaigns' },
  baseRoute: '/employee/crm/campaigns',

  title: 'Campaigns',
  description: 'Manage outreach campaigns and track performance',
  icon: Megaphone,

  primaryAction: {
    label: 'New Campaign',
    icon: Plus,
    href: '/employee/crm/campaigns/new',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Campaigns',
      icon: Megaphone,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: Play,
    },
    {
      key: 'leadsGenerated',
      label: 'Leads Generated',
      color: 'bg-blue-100 text-blue-800',
      icon: UserPlus,
    },
    {
      key: 'conversionRate',
      label: 'Avg Conversion',
      color: 'bg-purple-100 text-purple-800',
      format: (value: number) => `${value.toFixed(1)}%`,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Campaigns',
      placeholder: 'Search campaigns...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(CAMPAIGN_STATUS_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(CAMPAIGN_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      header: 'Campaign Name',
      label: 'Campaign Name',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'campaignType',
      header: 'Type',
      label: 'Type',
      sortable: true,
      width: 'w-[140px]',
      render: (value) => {
        const type = value as string
        return CAMPAIGN_TYPE_CONFIG[type]?.label || type
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
      key: 'channels',
      header: 'Channels',
      label: 'Channels',
      width: 'w-[150px]',
      render: (value) => {
        const channels = value as string[] | undefined
        if (!channels?.length) return '—'
        return channels.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')
      },
    },
    {
      key: 'startDate',
      header: 'Start Date',
      label: 'Start Date',
      sortable: true,
      width: 'w-[110px]',
      format: 'date' as const,
    },
    {
      key: 'endDate',
      header: 'End Date',
      label: 'End Date',
      sortable: true,
      width: 'w-[110px]',
      format: 'date' as const,
    },
    {
      key: 'audienceSize',
      header: 'Audience',
      label: 'Audience',
      sortable: true,
      width: 'w-[90px]',
      align: 'right' as const,
      render: (value) => {
        const size = value as number | undefined
        return size ? size.toLocaleString() : '—'
      },
    },
    {
      key: 'prospectsContacted',
      header: 'Contacted',
      label: 'Contacted',
      sortable: true,
      width: 'w-[90px]',
      align: 'right' as const,
      render: (value) => {
        const count = value as number | undefined
        return count ? count.toLocaleString() : '0'
      },
    },
    {
      key: 'leadsGenerated',
      header: 'Leads',
      label: 'Leads',
      sortable: true,
      width: 'w-[100px]',
      align: 'right' as const,
      render: (value, entity) => {
        const campaign = entity as Campaign
        const generated = campaign.leadsGenerated || campaign.leads_generated || 0
        const target = campaign.targetLeads || campaign.target_leads
        if (target) {
          return `${generated} / ${target}`
        }
        return String(generated)
      },
    },
    {
      key: 'budgetSpent',
      header: 'Budget',
      label: 'Budget',
      sortable: true,
      width: 'w-[140px]',
      align: 'right' as const,
      render: (value, entity) => {
        const campaign = entity as Campaign
        const spent = campaign.budgetSpent || campaign.budget_spent || 0
        const total = campaign.budgetTotal || campaign.budget_total
        if (total) {
          return `$${spent.toLocaleString()} / $${total.toLocaleString()}`
        }
        return spent > 0 ? `$${spent.toLocaleString()}` : '—'
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      label: 'Owner',
      sortable: true,
      width: 'w-[140px]',
      render: (value) => {
        const owner = value as Campaign['owner']
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
  statusConfig: CAMPAIGN_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Megaphone,
    title: 'No campaigns found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first campaign to start generating leads',
    action: {
      label: 'Create Campaign',
      href: '/employee/crm/campaigns/new',
    },
  },

  // tRPC hooks for data fetching (ONE database call pattern)
  // Uses listWithStats which returns items, total, AND stats in a single query
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const typeValue = filters.type as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['draft', 'scheduled', 'active', 'paused', 'completed', 'all'] as const
    const validTypes = [
      'lead_generation',
      're_engagement',
      'event_promotion',
      'brand_awareness',
      'candidate_sourcing',
      'all',
    ] as const
    const _validSortFields = ['created_at', 'start_date', 'end_date', 'name', 'leads_generated', 'audience_size', 'prospects_contacted', 'budget_spent', 'status', 'campaign_type'] as const

    type CampaignStatus = (typeof validStatuses)[number]
    type CampaignType = (typeof validTypes)[number]
    type SortField = (typeof _validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      campaignType: 'campaign_type',
      status: 'status',
      startDate: 'start_date',
      endDate: 'end_date',
      audienceSize: 'audience_size',
      prospectsContacted: 'prospects_contacted',
      leadsGenerated: 'leads_generated',
      budgetSpent: 'budget_spent',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    return trpc.crm.campaigns.listWithStats.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as CampaignStatus)
        ? statusValue
        : 'all') as CampaignStatus,
      type: (typeValue && validTypes.includes(typeValue as CampaignType)
        ? typeValue
        : 'all') as CampaignType,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  // Stats are now included in useListQuery response (ONE database call pattern)
  // useStatsQuery is no longer needed

  // Tabs configuration - "Campaigns" and "Drafts" tabs (like Accounts)
  tabs: [
    {
      id: 'campaigns',
      label: 'Campaigns',
      showFilters: true,
      useQuery: (filters) => {
        const statusValue = filters.status as string | undefined
        const typeValue = filters.type as string | undefined
        const sortByValue = filters.sortBy as string | undefined
        const sortOrderValue = filters.sortOrder as string | undefined

        const validStatuses = ['draft', 'scheduled', 'active', 'paused', 'completed', 'all'] as const
        const validTypes = [
          'lead_generation',
          're_engagement',
          'event_promotion',
          'brand_awareness',
          'candidate_sourcing',
          'all',
        ] as const
        const validSortFields = ['created_at', 'start_date', 'end_date', 'name', 'leads_generated', 'audience_size', 'prospects_contacted', 'budget_spent', 'status', 'campaign_type'] as const

        type CampaignStatus = (typeof validStatuses)[number]
        type CampaignType = (typeof validTypes)[number]
        type SortField = (typeof validSortFields)[number]

        const sortFieldMap: Record<string, SortField> = {
          name: 'name',
          campaignType: 'campaign_type',
          status: 'status',
          startDate: 'start_date',
          endDate: 'end_date',
          audienceSize: 'audience_size',
          prospectsContacted: 'prospects_contacted',
          leadsGenerated: 'leads_generated',
          budgetSpent: 'budget_spent',
          createdAt: 'created_at',
        }

        const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
          ? sortFieldMap[sortByValue]
          : 'created_at'

        // Exclude drafts from main campaigns tab - drafts are in separate tab
        const effectiveStatus = statusValue && statusValue !== 'all' && statusValue !== 'draft'
          ? statusValue as CampaignStatus
          : 'all'

        return trpc.crm.campaigns.listWithStats.useQuery({
          search: filters.search as string | undefined,
          status: effectiveStatus,
          type: (typeValue && validTypes.includes(typeValue as CampaignType)
            ? typeValue
            : 'all') as CampaignType,
          limit: (filters.limit as number) || 20,
          offset: (filters.offset as number) || 0,
          sortBy: mappedSortBy,
          sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
        })
      },
      emptyState: {
        icon: Megaphone,
        title: 'No campaigns found',
        description: (filters) =>
          filters.search
            ? 'Try adjusting your search or filters'
            : 'Create your first campaign to start generating leads',
        action: {
          label: 'Create Campaign',
          href: '/employee/crm/campaigns/new',
        },
      },
    },
    {
      id: 'drafts',
      label: 'Drafts',
      showFilters: false,
      useQuery: () => {
        // Query user's draft campaigns using dedicated listMyDrafts procedure
        const draftsQuery = trpc.crm.campaigns.listMyDrafts.useQuery()

        return {
          data: draftsQuery.data ? {
            items: draftsQuery.data as unknown as Campaign[],
            total: draftsQuery.data.length,
          } : undefined,
          isLoading: draftsQuery.isLoading,
          error: draftsQuery.error,
        }
      },
      // Use custom component that renders draft cards with Edit action
      customComponent: CampaignDraftsTabContent,
      emptyState: {
        icon: FileText,
        title: 'No drafts',
        description: "You don't have any campaigns in draft. Start creating a new one!",
        action: {
          label: 'New Campaign',
          href: '/employee/crm/campaigns/new',
        },
      },
    },
  ],
  defaultTab: 'campaigns',
}

// Campaigns Detail View Configuration
export const campaignsDetailConfig: DetailViewConfig<Campaign> = {
  entityType: 'campaign',
  baseRoute: '/employee/crm/campaigns',
  titleField: 'name',
  statusField: 'status',
  statusConfig: CAMPAIGN_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'CRM', href: '/employee/crm' },
    { label: 'Campaigns', href: '/employee/crm/campaigns' },
  ],

  subtitleFields: [
    {
      key: 'campaignType',
      format: (value) => {
        const type = (value as string) || ''
        return CAMPAIGN_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'startDate',
      icon: Calendar,
      format: (value) => {
        if (!value) return ''
        return new Date(value as string).toLocaleDateString()
      },
    },
    {
      key: 'channels',
      format: (value) => {
        const channels = value as string[] | undefined
        if (!channels?.length) return ''
        return channels.join(', ')
      },
    },
  ],

  metrics: [
    {
      key: 'prospects',
      label: 'Prospects',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const campaign = entity as Campaign & { sections?: { prospects?: { total?: number } } }
        // Use actual prospect count from sections (excludes converted), fall back to audienceSize
        return campaign.sections?.prospects?.total ?? campaign.audienceSize ?? campaign.audience_size ?? 0
      },
      tooltip: 'Active prospects in campaign (excludes converted)',
    },
    {
      key: 'contacted',
      label: 'Contacted',
      icon: Mail,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.prospectsContacted || campaign.prospects_contacted || 0
      },
      tooltip: 'Prospects contacted',
    },
    {
      key: 'leads',
      label: 'Leads',
      icon: Target,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const campaign = entity as Campaign & { sections?: { leads?: { total?: number } } }
        // Use actual leads count from sections, fall back to leadsGenerated
        return campaign.sections?.leads?.total ?? campaign.leadsGenerated ?? campaign.leads_generated ?? 0
      },
      getTotal: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.targetLeads || campaign.target_leads || undefined
      },
      tooltip: 'Leads generated from this campaign',
    },
    {
      key: 'meetings',
      label: 'Meetings',
      icon: Calendar,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.meetingsBooked || campaign.meetings_booked || 0
      },
      getTotal: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.targetMeetings || campaign.target_meetings || undefined
      },
      tooltip: 'Meetings booked',
    },
  ],

  showProgressBar: {
    label: 'Lead Generation Progress',
    getValue: (entity) => {
      const campaign = entity as Campaign
      return campaign.leadsGenerated || campaign.leads_generated || 0
    },
    getMax: (entity) => {
      const campaign = entity as Campaign
      return campaign.targetLeads || campaign.target_leads || 100
    },
  },

  // Sidebar handles all navigation - sections here are for content rendering only
  // Campaign uses dual-mode navigation (Journey + Sections) via CampaignEntitySidebar
  navigationMode: 'sections',
  defaultSection: 'overview',

  // Sections match the enhanced campaign workspace structure:
  // - Main: Overview, Prospects, Leads, Funnel
  // - Automation: Sequence, Analytics
  // - Tools: Activities, Notes, Documents, History
  sections: [
    // Main sections - Core campaign management
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      component: CampaignOverviewSectionPCF,
    },
    {
      id: 'prospects',
      label: 'Prospects',
      icon: Users,
      showCount: true,
      component: CampaignProspectsSectionPCF,
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Target,
      showCount: true,
      component: CampaignLeadsSectionPCF,
    },
    {
      id: 'funnel',
      label: 'Funnel',
      icon: TrendingDown,
      component: CampaignFunnelSectionPCF,
    },
    // Automation sections
    {
      id: 'sequence',
      label: 'Sequence',
      icon: Workflow,
      component: CampaignSequenceSectionPCF,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: CampaignAnalyticsSectionPCF,
    },
    // Tool sections
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      showCount: true,
      component: CampaignActivitiesSectionPCF,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: StickyNote,
      showCount: true,
      component: CampaignNotesSectionPCF,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      showCount: true,
      component: CampaignDocumentsSectionPCF,
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      component: CampaignHistorySectionPCF,
    },
  ],

  // Journey steps for campaign workflow (Setup → Audience → Execute → Nurture → Close)
  journeySteps: [
    {
      id: 'setup',
      label: 'Setup',
      icon: Settings,
      activeStatuses: ['draft'],
      completedStatuses: ['scheduled', 'active', 'paused', 'completed'],
      component: CampaignSetupStepPCF,
    },
    {
      id: 'audience',
      label: 'Audience',
      icon: UserPlus,
      activeStatuses: ['draft', 'scheduled'],
      completedStatuses: ['active', 'paused', 'completed'],
      component: CampaignAudienceStepPCF,
    },
    {
      id: 'execute',
      label: 'Execute',
      icon: Rocket,
      activeStatuses: ['active'],
      completedStatuses: ['paused', 'completed'],
      component: CampaignExecuteStepPCF,
    },
    {
      id: 'nurture',
      label: 'Nurture',
      icon: Heart,
      activeStatuses: ['active'],
      completedStatuses: ['completed'],
      component: CampaignNurtureStepPCF,
    },
    {
      id: 'close',
      label: 'Close',
      icon: Flag,
      activeStatuses: ['completed'],
      completedStatuses: [],
      component: CampaignCloseStepPCF,
    },
  ],

  quickActions: [
    {
      id: 'resume-campaign',
      label: 'Resume Campaign',
      icon: Play,
      variant: 'default',
      onClick: (entity: unknown) => {
        const campaign = entity as Campaign
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'resume', campaignId: campaign.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.status === 'paused'
      },
    },
    {
      id: 'add-prospect',
      label: 'Add Prospect',
      icon: UserPlus,
      variant: 'default',
      onClick: (entity: unknown) => {
        const campaign = entity as Campaign
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'addProspect', campaignId: campaign.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.status === 'draft' || campaign.status === 'active'
      },
    },
    {
      id: 'start-campaign',
      label: 'Start Campaign',
      icon: Play,
      variant: 'default',
      onClick: (entity: unknown) => {
        const campaign = entity as Campaign
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'start', campaignId: campaign.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.status === 'draft' || campaign.status === 'scheduled'
      },
    },
    {
      id: 'pause-campaign',
      label: 'Pause',
      icon: Pause,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const campaign = entity as Campaign
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'pause', campaignId: campaign.id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.status === 'active'
      },
    },
    {
      id: 'view-analytics',
      label: 'Analytics',
      icon: TrendingUp,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const campaign = entity as Campaign
        window.location.href = `/employee/crm/campaigns/${campaign.id}?section=analytics`
      },
      isVisible: (entity: unknown) => {
        const campaign = entity as Campaign
        // Hide analytics when paused - only show Resume as primary action
        return campaign.status !== 'paused'
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Resume Campaign',
      icon: Play,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'resume', campaignId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const campaign = entity as Campaign
        return campaign.status === 'paused'
      },
    },
    {
      label: 'Edit Campaign',
      icon: FileText,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'edit', campaignId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const campaign = entity as Campaign
        // Hide edit when paused - must resume first
        return campaign.status !== 'paused'
      },
    },
    {
      label: 'Duplicate Campaign',
      icon: FileText,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'duplicate', campaignId: entity.id },
          })
        )
      },
    },
    {
      label: 'Export Report',
      icon: BarChart3,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'exportReport', campaignId: entity.id },
          })
        )
      },
    },
    { separator: true, label: '' },
    {
      label: 'Complete Campaign',
      icon: CheckCircle,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'complete', campaignId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const campaign = entity as Campaign
        return campaign.status === 'active' || campaign.status === 'paused'
      },
    },
  ],

  eventNamespace: 'campaign',

  /**
   * ONE database call pattern: Use getFullEntity which returns
   * entity data + ALL section data in a single query.
   *
   * This eliminates N+1 queries when users navigate between sections.
   * Section components receive their data via the sectionData prop.
   */
  useEntityQuery: (entityId, options) => trpc.crm.campaigns.getFullEntity.useQuery(
    { id: entityId },
    {
      staleTime: 60_000, // Data considered fresh for 60 seconds
      refetchOnWindowFocus: false, // Don't refetch when tab regains focus
      // ONE DATABASE CALL PATTERN: Skip query when entity data already provided from server
      enabled: options?.enabled ?? true,
    }
  ),
}
