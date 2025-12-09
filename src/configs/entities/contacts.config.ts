import {
  User,
  Plus,
  Building2,
  Phone,
  Mail,
  Linkedin,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  FileText,
  Star,
  Calendar,
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
  is_primary?: boolean
  is_decision_maker?: boolean
  company_id?: string | null
  account?: {
    id: string
    name: string
  } | null
  linkedin_url?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  notes?: string | null
  preferred_contact_method?: string | null
  last_contact_date?: string | null
  created_at: string
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
      key: 'isPrimary',
      type: 'toggle',
      label: 'Primary Only',
    },
  ],

  columns: [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, entity) => {
        const contact = entity as Contact
        return `${contact.first_name} ${contact.last_name}`.trim() || '—'
      },
    },
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'account',
      label: 'Account',
      icon: Building2,
      render: (value) => {
        const account = value as Contact['account']
        return account?.name || '—'
      },
    },
    {
      key: 'email',
      label: 'Email',
      icon: Mail,
    },
    {
      key: 'phone',
      label: 'Phone',
      icon: Phone,
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'is_primary',
      label: 'Primary',
      render: (value) => {
        return value ? 'Yes' : '—'
      },
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

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined

    return trpc.crm.contacts.list.useQuery({
      search: filters.search as string | undefined,
      status: statusValue !== 'all' ? statusValue : undefined,
      isPrimary: filters.isPrimary as boolean | undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
    })
  },
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

  useEntityQuery: (entityId) => trpc.crm.contacts.getById.useQuery({ id: entityId }),
}
