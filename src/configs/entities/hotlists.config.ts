import {
  ListFilter,
  Plus,
  Users,
  Star,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  Calendar,
  Edit,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
// Note: trpc router for hotlists not implemented yet

// Type definition for Hotlist entity
export interface Hotlist extends Record<string, unknown> {
  id: string
  name: string
  description?: string | null
  status: string
  type?: string
  is_public?: boolean
  owner_id?: string
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  candidate_count?: number
  created_at: string
  updated_at?: string
}

// Hotlist status configuration
export const HOTLIST_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  archived: {
    label: 'Archived',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: Clock,
  },
}

// Hotlist type configuration
export const HOTLIST_TYPE_CONFIG: Record<string, StatusConfig> = {
  talent_pool: {
    label: 'Talent Pool',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Users,
  },
  job_specific: {
    label: 'Job Specific',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: ListFilter,
  },
  featured: {
    label: 'Featured',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Star,
  },
}

// Hotlists List View Configuration
export const hotlistsListConfig: ListViewConfig<Hotlist> = {
  entityType: 'hotlist',
  entityName: { singular: 'Hotlist', plural: 'Hotlists' },
  baseRoute: '/employee/recruiting/hotlists',

  title: 'Hotlists',
  description: 'Manage curated candidate lists',
  icon: ListFilter,

  primaryAction: {
    label: 'New Hotlist',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(
        new CustomEvent('openHotlistDialog', { detail: { dialogId: 'create' } })
      )
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Hotlists',
      icon: ListFilter,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'totalCandidates',
      label: 'Total Candidates',
      icon: Users,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Hotlists',
      placeholder: 'Search hotlists...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(HOTLIST_STATUS_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(HOTLIST_TYPE_CONFIG).map(([value, config]) => ({
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
        return HOTLIST_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'candidate_count',
      label: 'Candidates',
      format: 'number',
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (value) => {
        const owner = value as Hotlist['owner']
        return owner?.full_name || '—'
      },
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      format: 'relative-date',
    },
  ],

  renderMode: 'table',
  statusField: 'status',
  statusConfig: HOTLIST_STATUS_CONFIG,

  pageSize: 20,

  emptyState: {
    icon: ListFilter,
    title: 'No hotlists found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first hotlist to organize candidates',
    action: {
      label: 'Create Hotlist',
      onClick: () => {
        window.dispatchEvent(
          new CustomEvent('openHotlistDialog', { detail: { dialogId: 'create' } })
        )
      },
    },
  },

  useListQuery: () => {
    // TODO: Implement hotlists router
    // For now, return empty data
    return {
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data: { items: [], total: 0 } }),
    } as any
  },
}

// Hotlists Detail View Configuration
export const hotlistsDetailConfig: DetailViewConfig<Hotlist> = {
  entityType: 'hotlist',
  baseRoute: '/employee/recruiting/hotlists',
  titleField: 'name',
  statusField: 'status',
  statusConfig: HOTLIST_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'Recruiting', href: '/employee/recruiting' },
    { label: 'Hotlists', href: '/employee/recruiting/hotlists' },
  ],

  subtitleFields: [
    {
      key: 'type',
      format: (value) => {
        const type = (value as string) || ''
        return HOTLIST_TYPE_CONFIG[type]?.label || type
      },
    },
    {
      key: 'candidate_count',
      icon: Users,
      format: (value) => `${value || 0} candidates`,
    },
  ],

  metrics: [
    {
      key: 'candidates',
      label: 'Candidates',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity) => (entity as Hotlist).candidate_count || 0,
      tooltip: 'Total candidates in this hotlist',
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
      id: 'candidates',
      label: 'Candidates',
      icon: Users,
      showCount: true,
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
      id: 'add-candidate',
      label: 'Add Candidate',
      icon: UserPlus,
      variant: 'default',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openHotlistDialog', {
            detail: { dialogId: 'addCandidate', hotlistId: (entity as Hotlist).id },
          })
        )
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Hotlist',
      icon: Edit,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openHotlistDialog', {
            detail: { dialogId: 'edit', hotlistId: entity.id },
          })
        )
      },
    },
    { separator: true, label: '' },
    {
      label: 'Delete Hotlist',
      icon: Trash2,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openHotlistDialog', {
            detail: { dialogId: 'delete', hotlistId: entity.id },
          })
        )
      },
    },
  ],

  eventNamespace: 'hotlist',

  useEntityQuery: () => {
    // TODO: Implement hotlists router
    // For now, return empty data
    return {
      data: undefined,
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data: undefined }),
    } as any
  },
}

