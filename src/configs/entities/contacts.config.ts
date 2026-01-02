import {
  Plus,
  Building2,
  Phone,
  Mail,
  Linkedin,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  FileText,
  Star,
  Calendar,
  User,
  Users,
  Crown,
  MessageCircle,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import {
  ContactOverviewSectionPCF,
  ContactActivitiesSectionPCF,
  ContactNotesSectionPCF,
} from './sections/contacts.sections'

// Type definition for Contact entity
export interface Contact extends Record<string, unknown> {
  id: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  mobile?: string | null
  title?: string | null
  department?: string | null
  status?: string | null
  subtype?: string | null
  type?: string | null // Legacy alias for subtype
  is_primary?: boolean
  is_decision_maker?: boolean
  company_id?: string | null
  account?: {
    id: string
    name: string
  } | null
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  owner_id?: string
  linkedin_url?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  notes?: string | null
  preferred_contact_method?: string | null
  last_contact_date?: string | null
  lastContactDate?: string | null
  created_at: string
  createdAt?: string
  updated_at?: string
}

// Contact status configuration
export const CONTACT_STATUS_CONFIG: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-charcoal-100 text-charcoal-600',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-600',
    icon: Clock,
  },
  do_not_contact: {
    label: 'Do Not Contact',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
  left_company: {
    label: 'Left Company',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
}

// Contact type configuration
export const CONTACT_TYPE_CONFIG: Record<string, StatusConfig> = {
  hiring_manager: {
    label: 'Hiring Manager',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  hr: {
    label: 'HR',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  executive: {
    label: 'Executive',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Crown,
  },
  technical_lead: {
    label: 'Technical Lead',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  procurement: {
    label: 'Procurement',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  client_poc: {
    label: 'Client POC',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
  },
}

// Contacts List View Configuration
export const contactsListConfig: ListViewConfig<Contact> = {
  entityType: 'contact',
  entityName: { singular: 'Contact', plural: 'Contacts' },
  baseRoute: '/employee/contacts',

  title: 'Contacts',
  description: 'Manage your professional contacts',
  icon: User,

  primaryAction: {
    label: 'New Contact',
    icon: Plus,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('openContactDialog', { detail: { dialogId: 'create' } }))
    },
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Contacts',
      icon: Users,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'decisionMakers',
      label: 'Decision Makers',
      color: 'bg-gold-100 text-gold-800',
      icon: Crown,
    },
    {
      key: 'recentlyContacted',
      label: 'Recently Contacted',
      color: 'bg-blue-100 text-blue-800',
      icon: MessageCircle,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Contacts',
      placeholder: 'Search by name, email...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(CONTACT_STATUS_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(CONTACT_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
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
        const contact = entity as Contact
        return `${contact.first_name} ${contact.last_name}`.trim() || '—'
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
      key: 'account',
      header: 'Account',
      label: 'Account',
      sortable: true,
      width: 'w-[150px]',
      render: (value) => {
        const account = value as Contact['account']
        return account?.name || '—'
      },
    },
    {
      key: 'email',
      header: 'Email',
      label: 'Email',
      width: 'w-[180px]',
    },
    {
      key: 'phone',
      header: 'Phone',
      label: 'Phone',
      width: 'w-[120px]',
    },
    {
      key: 'type',
      header: 'Type',
      label: 'Type',
      sortable: true,
      width: 'w-[110px]',
      render: (value, entity) => {
        const contact = entity as Contact
        const type = contact.subtype || contact.type
        return CONTACT_TYPE_CONFIG[type || '']?.label || type || '—'
      },
    },
    {
      key: 'status',
      header: 'Status',
      label: 'Status',
      sortable: true,
      width: 'w-[90px]',
      format: 'status' as const,
    },
    {
      key: 'is_decision_maker',
      header: 'DM',
      label: 'DM',
      width: 'w-[50px]',
      align: 'center' as const,
      render: (value) => {
        return value ? '✓' : '—'
      },
    },
    {
      key: 'lastContactDate',
      header: 'Last Contact',
      label: 'Last Contact',
      sortable: true,
      width: 'w-[110px]',
      render: (value, entity) => {
        const contact = entity as Contact
        const date = contact.lastContactDate || contact.last_contact_date
        if (!date) return '—'
        const d = new Date(date)
        const now = new Date()
        const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`
        return `${Math.floor(days / 30)} months ago`
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      label: 'Owner',
      sortable: true,
      width: 'w-[130px]',
      render: (value) => {
        const owner = value as Contact['owner']
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
  statusConfig: CONTACT_STATUS_CONFIG,

  pageSize: 50,

  emptyState: {
    icon: User,
    title: 'No contacts found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Add your first contact to start building your network',
    action: {
      label: 'Add Contact',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openContactDialog', { detail: { dialogId: 'create' } }))
      },
    },
  },

  // tRPC hooks for data fetching - Using unified contacts router
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const _subtypeValue = filters.type as string | undefined // Maps to subtype in unified router
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    // Valid sort fields in unified contacts router
    const validSortFields = [
      'name',
      'first_name',
      'last_name',
      'title',
      'company_name',
      'status',
      'subtype',
      'email',
      'created_at',
      'updated_at',
    ] as const

    type SortField = (typeof validSortFields)[number]

    // Map frontend column keys to unified contacts database columns
    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      title: 'title',
      account: 'company_name',
      type: 'subtype',
      status: 'status',
      lastContactDate: 'updated_at', // Closest equivalent
      owner: 'updated_at', // Owner sorting not available, fallback
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    return trpc.unifiedContacts.list.useQuery({
      search: filters.search as string | undefined,
      status: statusValue !== 'all' ? statusValue : undefined,
      // Note: 'type' filter is for contact roles (hiring_manager, hr, etc.), not database subtypes
      // The subtype parameter requires database subtype format (person_candidate, person_lead, etc.)
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  // Stats are now included in useListQuery response (ONE database call pattern)
  // useStatsQuery is no longer needed - stats come from list.stats
}

// Contacts Detail View Configuration
export const contactsDetailConfig: DetailViewConfig<Contact> = {
  entityType: 'contact',
  baseRoute: '/employee/contacts',
  titleField: 'first_name',
  statusField: 'status',
  statusConfig: CONTACT_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'My Work', href: '/employee/workspace/dashboard' },
    { label: 'Contacts', href: '/employee/contacts' },
  ],

  titleFormatter: (entity) => {
    const contact = entity as Contact
    return `${contact.first_name} ${contact.last_name}`.trim() || 'Unknown Contact'
  },

  subtitleFields: [
    { key: 'title' },
    {
      key: 'account',
      icon: Building2,
      format: (value) => {
        const account = value as Contact['account'] | null
        return account?.name || ''
      },
    },
    { key: 'email', icon: Mail },
    { key: 'phone', icon: Phone },
  ],

  metrics: [
    {
      key: 'isPrimary',
      label: 'Primary Contact',
      icon: Star,
      iconBg: 'bg-gold-100',
      iconColor: 'text-gold-600',
      getValue: (entity: unknown) => {
        const contact = entity as Contact
        return contact.is_primary ? 'Yes' : 'No'
      },
      tooltip: 'Primary contact for account',
    },
    {
      key: 'decisionMaker',
      label: 'Decision Maker',
      icon: CheckCircle,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity: unknown) => {
        const contact = entity as Contact
        return contact.is_decision_maker ? 'Yes' : 'No'
      },
      tooltip: 'Has decision-making authority',
    },
    {
      key: 'lastContact',
      label: 'Last Contact',
      icon: Calendar,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity: unknown) => {
        const contact = entity as Contact
        if (!contact.last_contact_date) return 'Never'
        const date = new Date(contact.last_contact_date)
        const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
        return `${days} days ago`
      },
      tooltip: 'Days since last contact',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: ContactOverviewSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: ContactActivitiesSectionPCF,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      component: ContactNotesSectionPCF,
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const contact = entity as Contact
        window.dispatchEvent(
          new CustomEvent('openContactDialog', {
            detail: { dialogId: 'logActivity', contactId: contact.id },
          })
        )
      },
    },
    {
      id: 'send-email',
      label: 'Send Email',
      icon: Mail,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const contact = entity as Contact
        if (contact.email) {
          window.location.href = `mailto:${contact.email}`
        }
      },
      isVisible: (entity: unknown) => {
        const contact = entity as Contact
        return !!contact.email
      },
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const contact = entity as Contact
        if (contact.linkedin_url) {
          window.open(contact.linkedin_url, '_blank')
        }
      },
      isVisible: (entity: unknown) => {
        const contact = entity as Contact
        return !!contact.linkedin_url
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Contact',
      icon: FileText,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openContactDialog', {
            detail: { dialogId: 'edit', contactId: entity.id },
          })
        )
      },
    },
    {
      label: 'Mark as Primary',
      icon: Star,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openContactDialog', {
            detail: { dialogId: 'markPrimary', contactId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const contact = entity as Contact
        return !contact.is_primary
      },
    },
    { separator: true, label: '' },
    {
      label: 'Mark as Do Not Contact',
      icon: XCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openContactDialog', {
            detail: { dialogId: 'markDNC', contactId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const contact = entity as Contact
        return contact.status !== 'do_not_contact'
      },
    },
  ],

  eventNamespace: 'contact',

  useEntityQuery: (entityId) => trpc.unifiedContacts.getById.useQuery({ id: entityId }),
}
