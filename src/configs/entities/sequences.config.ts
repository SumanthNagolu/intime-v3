import {
  Workflow,
  Plus,
  Mail,
  Linkedin,
  Phone,
  CheckCircle,
  Clock,
  Pause,
  FileText,
  Activity,
  BarChart3,
  Edit,
  Trash2,
  Copy,
  Play,
  Settings,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
// Note: trpc router for sequences not implemented yet

// Type definition for Sequence entity
export interface Sequence extends Record<string, unknown> {
  id: string
  name: string
  description?: string | null
  status: string
  type?: string
  channels?: string[]
  steps_count?: number
  enrolled_count?: number
  completed_count?: number
  reply_rate?: number
  is_system?: boolean
  owner_id?: string
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  created_at: string
  updated_at?: string
}

// Sequence status configuration
export const SEQUENCE_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: FileText,
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
  archived: {
    label: 'Archived',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: Clock,
  },
}

// Sequence type configuration
export const SEQUENCE_TYPE_CONFIG: Record<string, StatusConfig> = {
  outreach: {
    label: 'Outreach',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Mail,
  },
  nurture: {
    label: 'Nurture',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Workflow,
  },
  follow_up: {
    label: 'Follow-up',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Phone,
  },
  re_engagement: {
    label: 'Re-engagement',
    color: 'bg-teal-100 text-teal-800',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    icon: Linkedin,
  },
}

// Channel icons
export const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  phone: Phone,
}

// Sequences List View Configuration
export const sequencesListConfig: ListViewConfig<Sequence> = {
  entityType: 'sequence',
  entityName: { singular: 'Sequence', plural: 'Sequences' },
  baseRoute: '/employee/crm/sequences',

  title: 'Sequences',
  description: 'Manage automated outreach sequences',
  icon: Workflow,

  primaryAction: {
    label: 'New Sequence',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(
        new CustomEvent('openSequenceDialog', { detail: { dialogId: 'create' } })
      )
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Sequences',
      icon: Workflow,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: Play,
    },
    {
      key: 'totalEnrolled',
      label: 'Total Enrolled',
      icon: Mail,
    },
    {
      key: 'avgReplyRate',
      label: 'Avg Reply Rate',
      format: (value: number) => `${value.toFixed(1)}%`,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Sequences',
      placeholder: 'Search sequences...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(SEQUENCE_STATUS_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(SEQUENCE_TYPE_CONFIG).map(([value, config]) => ({
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
      key: 'type',
      label: 'Type',
      render: (value) => {
        const type = value as string
        return SEQUENCE_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'steps_count',
      label: 'Steps',
      format: 'number',
    },
    {
      key: 'enrolled_count',
      label: 'Enrolled',
      format: 'number',
    },
    {
      key: 'reply_rate',
      label: 'Reply Rate',
      render: (value) => {
        const rate = value as number
        return rate ? `${rate.toFixed(1)}%` : '—'
      },
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (value) => {
        const owner = value as Sequence['owner']
        return owner?.full_name || '—'
      },
    },
  ],

  renderMode: 'cards',
  statusField: 'status',
  statusConfig: SEQUENCE_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: Workflow,
    title: 'No sequences found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first sequence to automate outreach',
    action: {
      label: 'Create Sequence',
      onClick: () => {
        window.dispatchEvent(
          new CustomEvent('openSequenceDialog', { detail: { dialogId: 'create' } })
        )
      },
    },
  },

  useListQuery: () => {
    // TODO: Implement sequences router
    // For now, return empty data
    return {
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data: { items: [], total: 0 } }),
    } as any
  },
}

// Sequences Detail View Configuration
export const sequencesDetailConfig: DetailViewConfig<Sequence> = {
  entityType: 'sequence',
  baseRoute: '/employee/crm/sequences',
  titleField: 'name',
  statusField: 'status',
  statusConfig: SEQUENCE_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'CRM', href: '/employee/crm' },
    { label: 'Sequences', href: '/employee/crm/sequences' },
  ],

  subtitleFields: [
    {
      key: 'type',
      format: (value) => {
        const type = (value as string) || ''
        return SEQUENCE_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'steps_count',
      format: (value) => `${value || 0} steps`,
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
      key: 'enrolled',
      label: 'Enrolled',
      icon: Mail,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity) => (entity as Sequence).enrolled_count || 0,
      tooltip: 'Total contacts enrolled',
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity) => (entity as Sequence).completed_count || 0,
      tooltip: 'Contacts who completed the sequence',
    },
    {
      key: 'replyRate',
      label: 'Reply Rate',
      icon: BarChart3,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity) => {
        const rate = (entity as Sequence).reply_rate
        return rate ? `${rate.toFixed(1)}%` : '0%'
      },
      tooltip: 'Response rate',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
    },
    {
      id: 'steps',
      label: 'Steps',
      icon: Workflow,
      showCount: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      showCount: true,
    },
  ],

  quickActions: [
    {
      id: 'activate',
      label: 'Activate',
      icon: Play,
      variant: 'default',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openSequenceDialog', {
            detail: { dialogId: 'activate', sequenceId: (entity as Sequence).id },
          })
        )
      },
      isVisible: (entity) => {
        const seq = entity as Sequence
        return seq.status === 'draft' || seq.status === 'paused'
      },
    },
    {
      id: 'pause',
      label: 'Pause',
      icon: Pause,
      variant: 'outline',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openSequenceDialog', {
            detail: { dialogId: 'pause', sequenceId: (entity as Sequence).id },
          })
        )
      },
      isVisible: (entity) => (entity as Sequence).status === 'active',
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Sequence',
      icon: Edit,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openSequenceDialog', {
            detail: { dialogId: 'edit', sequenceId: entity.id },
          })
        )
      },
      isVisible: (entity) => !(entity as Sequence).is_system,
    },
    {
      label: 'Edit Steps',
      icon: Settings,
      onClick: (entity) => {
        window.location.href = `/employee/crm/sequences/${entity.id}/builder`
      },
      isVisible: (entity) => !(entity as Sequence).is_system,
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openSequenceDialog', {
            detail: { dialogId: 'duplicate', sequenceId: entity.id },
          })
        )
      },
    },
    { separator: true, label: '' },
    {
      label: 'Archive',
      icon: Trash2,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openSequenceDialog', {
            detail: { dialogId: 'archive', sequenceId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const seq = entity as Sequence
        return !seq.is_system && seq.status !== 'archived'
      },
    },
  ],

  eventNamespace: 'sequence',

  useEntityQuery: () => {
    // TODO: Implement sequences router
    // For now, return empty data
    return {
      data: undefined,
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data: undefined }),
    } as any
  },
}

