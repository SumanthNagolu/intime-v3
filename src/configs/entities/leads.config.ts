import {
  Target,
  Plus,
  Building2,
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
}

// Lead status configuration
export const LEAD_STATUS_CONFIG: Record<string, StatusConfig> = {
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
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openLeadDialog', { detail: { dialogId: 'create' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Leads',
      icon: Target,
    },
    {
      key: 'new',
      label: 'New',
      color: 'bg-charcoal-100 text-charcoal-700',
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
  ],

  columns: [
    {
      key: 'company_name',
      label: 'Company / Name',
      sortable: true,
      render: (value, entity) => {
        const lead = entity as Lead
        if (lead.lead_type === 'company') {
          return lead.company_name || '—'
        }
        return `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || '—'
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
      key: 'source',
      label: 'Source',
    },
    {
      key: 'bant_total_score',
      label: 'Score',
      render: (value) => {
        const score = value as number | null
        if (!score) return '—'
        return `${score}/100`
      },
    },
    {
      key: 'estimated_value',
      label: 'Est. Value',
      type: 'currency',
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (value) => {
        const owner = value as Lead['owner']
        return owner?.full_name || '—'
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
  statusConfig: LEAD_STATUS_CONFIG,

  pageSize: 50,

  emptyState: {
    icon: Target,
    title: 'No leads found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first lead to start building your pipeline',
    action: {
      label: 'Create Lead',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openLeadDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const sourceValue = filters.source as string | undefined
    const validStatuses = [
      'new',
      'contacted',
      'qualified',
      'unqualified',
      'nurture',
      'converted',
      'all',
    ] as const
    type LeadStatus = (typeof validStatuses)[number]

    return trpc.crm.leads.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as LeadStatus)
        ? statusValue
        : 'all') as LeadStatus,
      source: sourceValue !== 'all' ? sourceValue : undefined,
      campaignId: filters.campaignId as string | undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
  },

  useStatsQuery: () => trpc.crm.leads.getStats.useQuery({ period: 'month' }),
}

// Leads Detail View Configuration
export const leadsDetailConfig: DetailViewConfig<Lead> = {
  entityType: 'lead',
  baseRoute: '/employee/crm/leads',
  titleField: 'company_name',
  statusField: 'status',
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
      onClick: (entity: unknown) => {
        const lead = entity as Lead
        window.dispatchEvent(
          new CustomEvent('openLeadDialog', {
            detail: { dialogId: 'logActivity', leadId: lead.id },
          })
        )
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

  useEntityQuery: (entityId) => trpc.crm.leads.getById.useQuery({ id: entityId }),
}
