import {
  Megaphone,
  Plus,
  Users,
  Target,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  Pause,
  Play,
  TrendingUp,
  Mail,
  BarChart3,
  UserPlus,
  MessageSquare,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import {
  CampaignOverviewSectionPCF,
  CampaignProspectsSectionPCF,
  CampaignLeadsSectionPCF,
  CampaignAnalyticsSectionPCF,
  CampaignActivitiesSectionPCF,
  CampaignDocumentsSectionPCF,
} from './sections/campaigns.sections'

// Type definition for Campaign entity
export interface Campaign extends Record<string, unknown> {
  id: string
  name: string
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
  leads_generated?: number
  leadsGenerated?: number
  meetings_booked?: number
  meetingsBooked?: number
  target_leads?: number
  targetLeads?: number
  target_meetings?: number
  targetMeetings?: number
  budget_total?: number
  budgetTotal?: number
  budget_spent?: number
  budgetSpent?: number
  owner_id?: string
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
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
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openCampaignDialog', { detail: { dialogId: 'create' } }))
    },
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
      label: 'Campaign Name',
      sortable: true,
    },
    {
      key: 'campaignType',
      label: 'Type',
      render: (value) => {
        const type = value as string
        return CAMPAIGN_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
    },
    {
      key: 'leadsGenerated',
      label: 'Leads',
      render: (value, entity) => {
        const campaign = entity as Campaign
        const generated = campaign.leadsGenerated || campaign.leads_generated || 0
        const target = campaign.targetLeads || campaign.target_leads
        if (target) {
          return `${generated}/${target}`
        }
        return String(generated)
      },
    },
    {
      key: 'budgetSpent',
      label: 'Budget',
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
      label: 'Owner',
      render: (value) => {
        const owner = value as Campaign['owner']
        return owner?.full_name || '—'
      },
    },
  ],

  renderMode: 'cards',
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
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openCampaignDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const typeValue = filters.type as string | undefined
    const validStatuses = ['draft', 'scheduled', 'active', 'paused', 'completed', 'all'] as const
    const validTypes = [
      'lead_generation',
      're_engagement',
      'event_promotion',
      'brand_awareness',
      'candidate_sourcing',
      'all',
    ] as const
    type CampaignStatus = (typeof validStatuses)[number]
    type CampaignType = (typeof validTypes)[number]

    return trpc.crm.campaigns.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as CampaignStatus)
        ? statusValue
        : 'all') as CampaignStatus,
      type: (typeValue && validTypes.includes(typeValue as CampaignType)
        ? typeValue
        : 'all') as CampaignType,
      limit: (filters.limit as number) || 20,
      offset: (filters.offset as number) || 0,
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
  },
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
        const campaign = entity as Campaign
        return campaign.audienceSize || campaign.audience_size || 0
      },
      tooltip: 'Total prospects in campaign',
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
        const campaign = entity as Campaign
        return campaign.leadsGenerated || campaign.leads_generated || 0
      },
      getTotal: (entity: unknown) => {
        const campaign = entity as Campaign
        return campaign.targetLeads || campaign.target_leads || undefined
      },
      tooltip: 'Leads generated',
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
  navigationMode: 'sections',
  defaultSection: 'dashboard',

  // Sections match the sidebar structure (main + tools)
  // Note: Sidebar navigation is primary - these define content components
  sections: [
    // Main sections
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FileText,
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
      icon: FileText,
      showCount: true,
      // Notes component uses standard notes section
      component: CampaignActivitiesSectionPCF, // TODO: Add CampaignNotesSectionPCF
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      showCount: true,
      component: CampaignDocumentsSectionPCF,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: CampaignAnalyticsSectionPCF,
    },
    {
      id: 'history',
      label: 'History',
      icon: Clock,
      // History component shows audit trail
      component: CampaignActivitiesSectionPCF, // TODO: Add CampaignHistorySectionPCF
    },
  ],

  quickActions: [
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
    },
  ],

  dropdownActions: [
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

  useEntityQuery: (entityId) => trpc.crm.campaigns.getByIdWithCounts.useQuery({ id: entityId }),
}
