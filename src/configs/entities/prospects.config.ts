import {
  User,
  Plus,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Activity,
  FileText,
  Target,
  TrendingUp,
  AlertCircle,
  Calendar,
  Send,
  Link,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import {
  ProspectOverviewSectionPCF,
  ProspectEngagementSectionPCF,
  ProspectActivitiesSectionPCF,
  ProspectNotesSectionPCF,
} from './sections/prospects.sections'

// Type definition for Prospect entity
export interface Prospect extends Record<string, unknown> {
  id: string
  campaign_id: string
  name: string
  email?: string | null
  company?: string | null
  title?: string | null
  phone?: string | null
  linkedin_url?: string | null
  status: string
  channel?: string | null
  engagement_score?: number | null
  sequence_step?: number | null
  response_type?: string | null
  responded_at?: string | null
  opened_at?: string | null
  clicked_at?: string | null
  contacted_at?: string | null
  converted_lead_id?: string | null
  meeting_booked_at?: string | null
  converted_lead?: {
    id: string
    company_name?: string | null
    first_name?: string | null
    last_name?: string | null
  } | null
  campaign?: {
    id: string
    name: string
    status: string
  } | null
  created_at: string
  updated_at?: string
}

// Prospect status configuration
export const PROSPECT_STATUS_CONFIG: Record<string, StatusConfig> = {
  enrolled: {
    label: 'Enrolled',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: Clock,
  },
  contacted: {
    label: 'Contacted',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Send,
  },
  engaged: {
    label: 'Engaged',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Target,
  },
  responded: {
    label: 'Responded',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: MessageSquare,
  },
  converted: {
    label: 'Converted',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: CheckCircle2,
  },
  unsubscribed: {
    label: 'Unsubscribed',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
  bounced: {
    label: 'Bounced',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: AlertCircle,
  },
}

// Response type configuration
export const RESPONSE_TYPE_CONFIG: Record<string, StatusConfig> = {
  positive: {
    label: 'Positive',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: ThumbsUp,
  },
  neutral: {
    label: 'Neutral',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: MessageSquare,
  },
  negative: {
    label: 'Negative',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: ThumbsDown,
  },
}

// Channel configuration
export const CHANNEL_CONFIG: Record<string, StatusConfig> = {
  email: {
    label: 'Email',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Mail,
  },
  linkedin: {
    label: 'LinkedIn',
    color: 'bg-indigo-100 text-indigo-800',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    icon: Link,
  },
  phone: {
    label: 'Phone',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: MessageSquare,
  },
}

// Prospects List View Configuration
export const prospectsListConfig: ListViewConfig<Prospect> = {
  entityType: 'prospect',
  entityName: { singular: 'Prospect', plural: 'Prospects' },
  baseRoute: '/employee/crm/campaigns',

  title: 'Prospects',
  description: 'Manage campaign prospects and outreach',
  icon: User,

  primaryAction: {
    label: 'Add Prospect',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openCampaignDialog', { detail: { dialogId: 'addProspect' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Prospects',
      icon: User,
    },
    {
      key: 'contacted',
      label: 'Contacted',
      color: 'bg-blue-100 text-blue-800',
      icon: Send,
    },
    {
      key: 'responded',
      label: 'Responded',
      color: 'bg-green-100 text-green-800',
      icon: MessageSquare,
    },
    {
      key: 'converted',
      label: 'Converted',
      color: 'bg-gold-100 text-gold-800',
      icon: CheckCircle2,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Prospects',
      placeholder: 'Search by name, email, company...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(PROSPECT_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'responseType',
      type: 'select',
      label: 'Response',
      options: [
        { value: 'all', label: 'All Responses' },
        ...Object.entries(RESPONSE_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'channel',
      type: 'select',
      label: 'Channel',
      options: [
        { value: 'all', label: 'All Channels' },
        ...Object.entries(CHANNEL_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      icon: Mail,
    },
    {
      key: 'company',
      label: 'Company',
      icon: Building2,
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
      key: 'channel',
      label: 'Channel',
      render: (value) => {
        const config = CHANNEL_CONFIG[value as string]
        return config?.label || (value as string) || '—'
      },
    },
    {
      key: 'engagement_score',
      label: 'Score',
      render: (value) => {
        const score = value as number | null
        return score !== null ? `${score}%` : '—'
      },
    },
    {
      key: 'response_type',
      label: 'Response',
      render: (value) => {
        if (!value) return '—'
        const config = RESPONSE_TYPE_CONFIG[value as string]
        return config?.label || (value as string)
      },
    },
    {
      key: 'contacted_at',
      label: 'Last Contact',
      type: 'date',
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: PROSPECT_STATUS_CONFIG,

  pageSize: 50,

  emptyState: {
    icon: User,
    title: 'No prospects found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Add prospects to start your outreach campaign',
    action: {
      label: 'Add Prospect',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openCampaignDialog', { detail: { dialogId: 'addProspect' } }))
      },
    },
  },

  // tRPC hooks for data fetching - requires campaignId from filters
  useListQuery: (filters) => {
    const campaignId = filters.campaignId as string | undefined
    const statusValue = filters.status as string | undefined
    const responseValue = filters.responseType as string | undefined

    const validStatuses = ['enrolled', 'contacted', 'engaged', 'responded', 'converted', 'unsubscribed', 'bounced', 'all'] as const
    const validResponses = ['positive', 'neutral', 'negative', 'all'] as const

    type ProspectStatus = (typeof validStatuses)[number]
    type ResponseType = (typeof validResponses)[number]

    // Return empty if no campaignId
    if (!campaignId) {
      return {
        data: { items: [], total: 0 },
        isLoading: false,
        error: null,
      }
    }

    return trpc.crm.campaigns.getProspects.useQuery({
      campaignId,
      status: (statusValue && validStatuses.includes(statusValue as ProspectStatus)
        ? statusValue
        : 'all') as ProspectStatus,
      responseType: responseValue && validResponses.includes(responseValue as ResponseType)
        ? (responseValue as ResponseType)
        : undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
    })
  },
}

// Prospects Detail View Configuration
export const prospectsDetailConfig: DetailViewConfig<Prospect> = {
  entityType: 'prospect',
  baseRoute: '/employee/crm/campaigns',
  titleField: 'name',
  statusField: 'status',
  statusConfig: PROSPECT_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'CRM', href: '/employee/crm' },
    { label: 'Campaigns', href: '/employee/crm/campaigns' },
  ],

  subtitleFields: [
    { key: 'company', icon: Building2 },
    { key: 'title' },
    { key: 'email', icon: Mail },
  ],

  metrics: [
    {
      key: 'engagementScore',
      label: 'Engagement Score',
      icon: TrendingUp,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const prospect = entity as Prospect
        return prospect.engagement_score || 0
      },
      format: (value) => `${value}%`,
      tooltip: 'Overall engagement score (0-100)',
    },
    {
      key: 'sequenceStep',
      label: 'Sequence Step',
      icon: Target,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity: unknown) => {
        const prospect = entity as Prospect
        return prospect.sequence_step || 1
      },
      tooltip: 'Current step in outreach sequence',
    },
    {
      key: 'response',
      label: 'Response Status',
      icon: MessageSquare,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity: unknown) => {
        const prospect = entity as Prospect
        if (!prospect.response_type) return 'No Response'
        const config = RESPONSE_TYPE_CONFIG[prospect.response_type]
        return config?.label || prospect.response_type
      },
      tooltip: 'Response sentiment',
    },
    {
      key: 'daysInCampaign',
      label: 'Days in Campaign',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const prospect = entity as Prospect
        const created = new Date(prospect.created_at)
        const now = new Date()
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      },
      tooltip: 'Days since added to campaign',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: ProspectOverviewSectionPCF,
    },
    {
      id: 'engagement',
      label: 'Engagement',
      icon: TrendingUp,
      component: ProspectEngagementSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: ProspectActivitiesSectionPCF,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      component: ProspectNotesSectionPCF,
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const prospect = entity as Prospect
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'logProspectActivity', prospectId: prospect.id, campaignId: prospect.campaign_id },
          })
        )
      },
    },
    {
      id: 'convert-to-lead',
      label: 'Convert to Lead',
      icon: CheckCircle2,
      variant: 'default',
      onClick: (entity: unknown) => {
        const prospect = entity as Prospect
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'convertProspect', prospectId: prospect.id, campaignId: prospect.campaign_id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const prospect = entity as Prospect
        return prospect.status === 'responded' && !prospect.converted_lead_id
      },
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      icon: Calendar,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const prospect = entity as Prospect
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'scheduleMeeting', prospectId: prospect.id, campaignId: prospect.campaign_id },
          })
        )
      },
      isVisible: (entity: unknown) => {
        const prospect = entity as Prospect
        return prospect.status === 'responded' && !prospect.meeting_booked_at && !prospect.converted_lead_id
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Prospect',
      icon: FileText,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'editProspect', prospectId: entity.id, campaignId: entity.campaign_id },
          })
        )
      },
    },
    {
      label: 'Send Email',
      icon: Mail,
      onClick: (entity) => {
        const prospect = entity as Prospect
        if (prospect.email) {
          window.location.href = `mailto:${prospect.email}`
        }
      },
      isVisible: (entity) => {
        const prospect = entity as Prospect
        return !!prospect.email
      },
    },
    {
      label: 'View LinkedIn',
      icon: Link,
      onClick: (entity) => {
        const prospect = entity as Prospect
        if (prospect.linkedin_url) {
          window.open(prospect.linkedin_url, '_blank')
        }
      },
      isVisible: (entity) => {
        const prospect = entity as Prospect
        return !!prospect.linkedin_url
      },
    },
    { separator: true, label: '' },
    {
      label: 'Mark as Unsubscribed',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCampaignDialog', {
            detail: { dialogId: 'unsubscribeProspect', prospectId: entity.id, campaignId: entity.campaign_id },
          })
        )
      },
      isVisible: (entity) => {
        const prospect = entity as Prospect
        return prospect.status !== 'unsubscribed' && prospect.status !== 'converted'
      },
    },
  ],

  eventNamespace: 'campaign',

  useEntityQuery: (entityId) => {
    // Note: This requires both prospectId and campaignId - for now just return the prospectId query
    // In actual usage, the campaignId should come from the route params
    return trpc.crm.campaigns.getProspectById.useQuery({
      prospectId: entityId,
      campaignId: '' // This should be provided by the page context
    })
  },
}
