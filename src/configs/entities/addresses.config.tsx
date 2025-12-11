import {
  MapPin,
  Plus,
  Building2,
  User,
  Briefcase,
  Users,
  Home,
  Check,
  Calendar,
  Clock,
} from 'lucide-react'
import { ListViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Address extends Record<string, unknown> {
  id: string
  entityType: string
  entityId: string
  addressType: string
  addressLine1?: string | null
  addressLine2?: string | null
  addressLine3?: string | null
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  countryCode: string
  county?: string | null
  latitude?: number | null
  longitude?: number | null
  isVerified: boolean
  verifiedAt?: string | null
  verificationSource?: string | null
  isPrimary: boolean
  effectiveFrom?: string | null
  effectiveTo?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
}

// ============================================
// STATUS/TYPE CONFIGURATIONS
// ============================================

export const ADDRESS_TYPE_CONFIG: Record<string, StatusConfig> = {
  current: {
    label: 'Current',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Home,
  },
  permanent: {
    label: 'Permanent',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Home,
  },
  mailing: {
    label: 'Mailing',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: MapPin,
  },
  work: {
    label: 'Work',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Briefcase,
  },
  billing: {
    label: 'Billing',
    color: 'bg-cyan-100 text-cyan-800',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
  },
  shipping: {
    label: 'Shipping',
    color: 'bg-indigo-100 text-indigo-800',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
  },
  headquarters: {
    label: 'Headquarters',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Building2,
  },
  office: {
    label: 'Office',
    color: 'bg-charcoal-100 text-charcoal-800',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-800',
    icon: Building2,
  },
  job_location: {
    label: 'Job Location',
    color: 'bg-teal-100 text-teal-800',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    icon: Briefcase,
  },
  meeting: {
    label: 'Meeting',
    color: 'bg-rose-100 text-rose-800',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-800',
    icon: Calendar,
  },
  first_day: {
    label: 'First Day',
    color: 'bg-lime-100 text-lime-800',
    bgColor: 'bg-lime-100',
    textColor: 'text-lime-800',
    icon: Clock,
  },
}

export const ENTITY_TYPE_CONFIG: Record<string, { label: string; icon: typeof Building2 }> = {
  account: { label: 'Account', icon: Building2 },
  contact: { label: 'Contact', icon: User },
  candidate: { label: 'Candidate', icon: User },
  job: { label: 'Job', icon: Briefcase },
  employee: { label: 'Employee', icon: Users },
  vendor: { label: 'Vendor', icon: Building2 },
  lead: { label: 'Lead', icon: User },
  organization: { label: 'Organization', icon: Building2 },
  interview: { label: 'Interview', icon: Calendar },
  placement: { label: 'Placement', icon: Briefcase },
}

// ============================================
// LIST VIEW CONFIGURATION
// ============================================

export const addressesListConfig: ListViewConfig<Address> = {
  entityType: 'address',
  entityName: { singular: 'Address', plural: 'Addresses' },
  baseRoute: '/employee/admin/addresses',

  title: 'Addresses',
  description: 'Manage all addresses across your organization',
  icon: MapPin,

  primaryAction: {
    label: 'New Address',
    icon: Plus,
    href: '/employee/admin/addresses/new',
  },

  // Stats cards for dashboard
  statsCards: [
    {
      key: 'total',
      label: 'Total Addresses',
      icon: MapPin,
    },
    {
      key: 'accounts',
      label: 'Account Addresses',
      icon: Building2,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      key: 'contacts',
      label: 'Contact Addresses',
      icon: User,
      color: 'bg-green-100 text-green-800',
    },
    {
      key: 'jobs',
      label: 'Job Locations',
      icon: Briefcase,
      color: 'bg-amber-100 text-amber-800',
    },
  ],

  // Filters
  filters: [
    {
      key: 'entityType',
      label: 'Entity Type',
      type: 'select',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'account', label: 'Account' },
        { value: 'contact', label: 'Contact' },
        { value: 'candidate', label: 'Candidate' },
        { value: 'job', label: 'Job' },
        { value: 'employee', label: 'Employee' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'lead', label: 'Lead' },
        { value: 'interview', label: 'Interview' },
        { value: 'placement', label: 'Placement' },
      ],
    },
    {
      key: 'addressType',
      label: 'Address Type',
      type: 'select',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'current', label: 'Current' },
        { value: 'permanent', label: 'Permanent' },
        { value: 'mailing', label: 'Mailing' },
        { value: 'work', label: 'Work' },
        { value: 'billing', label: 'Billing' },
        { value: 'shipping', label: 'Shipping' },
        { value: 'headquarters', label: 'Headquarters' },
        { value: 'office', label: 'Office' },
        { value: 'job_location', label: 'Job Location' },
        { value: 'meeting', label: 'Meeting' },
        { value: 'first_day', label: 'First Day' },
      ],
    },
    {
      key: 'stateProvince',
      label: 'State',
      type: 'select',
      options: [
        { value: 'all', label: 'All States' },
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' },
        { value: 'TX', label: 'Texas' },
        { value: 'FL', label: 'Florida' },
        { value: 'IL', label: 'Illinois' },
        // Add more states as needed
      ],
    },
  ],

  // Columns
  columns: [
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      width: 'min-w-[200px]',
      render: (value, entity) => {
        const address = entity as Address
        const parts: string[] = []
        if (address.city) parts.push(address.city)
        if (address.stateProvince) parts.push(address.stateProvince)
        return parts.join(', ') || address.addressLine1 || '—'
      },
    },
    {
      key: 'entityType',
      header: 'Entity Type',
      sortable: true,
      width: 'w-[120px]',
      render: (value, _entity) => {
        const config = ENTITY_TYPE_CONFIG[value as string]
        return config?.label || String(value) || '—'
      },
    },
    {
      key: 'addressType',
      header: 'Type',
      sortable: true,
      width: 'w-[100px]',
      render: (value, _entity) => {
        const config = ADDRESS_TYPE_CONFIG[value as string]
        if (!config) return String(value) || '—'
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'addressLine1',
      header: 'Street Address',
      width: 'w-[200px]',
      render: (value, entity) => {
        const address = entity as Address
        return address.addressLine1 || '—'
      },
    },
    {
      key: 'postalCode',
      header: 'ZIP',
      width: 'w-[80px]',
    },
    {
      key: 'countryCode',
      header: 'Country',
      width: 'w-[80px]',
    },
    {
      key: 'isPrimary',
      header: 'Primary',
      width: 'w-[80px]',
      align: 'center' as const,
      render: (value) => {
        if (value) {
          return <Check className="w-4 h-4 text-green-600 mx-auto" />
        }
        return '—'
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      width: 'w-[100px]',
      format: 'relative-date' as const,
    },
  ],

  // Render mode
  renderMode: 'table',
  pageSize: 50,

  // Empty state
  emptyState: {
    icon: MapPin,
    title: 'No addresses found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Addresses will appear here as they are added to entities',
    action: {
      label: 'Add Address',
      href: '/employee/admin/addresses/new',
    },
  },

  // Data hooks
  useListQuery: (filters) => {
    const entityTypeValue = filters.entityType as string | undefined
    const addressTypeValue = filters.addressType as string | undefined
    const stateValue = filters.stateProvince as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    // Map frontend column keys to backend fields
    const sortFieldMap: Record<string, string> = {
      location: 'city',
      entityType: 'entity_type',
      addressType: 'address_type',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    return trpc.addresses.list.useQuery({
      search: filters.search as string | undefined,
      entityType: entityTypeValue && entityTypeValue !== 'all'
        ? entityTypeValue as 'candidate' | 'account' | 'contact' | 'vendor' | 'organization' | 'lead' | 'job' | 'interview' | 'employee' | 'placement'
        : undefined,
      addressType: addressTypeValue && addressTypeValue !== 'all'
        ? addressTypeValue as 'current' | 'permanent' | 'mailing' | 'work' | 'billing' | 'shipping' | 'headquarters' | 'office' | 'job_location' | 'meeting' | 'first_day'
        : undefined,
      stateProvince: stateValue && stateValue !== 'all' ? stateValue : undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy as 'city' | 'state_province' | 'country_code' | 'entity_type' | 'address_type' | 'created_at' | 'updated_at',
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc'
        ? sortOrderValue
        : 'desc'),
    })
  },

  useStatsQuery: () => {
    return trpc.addresses.stats.useQuery()
  },
}
