import {
  Building2,
  Plus,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Briefcase,
  Star,
  Activity,
  Settings,
  Package,
  Target,
  TrendingUp,
  Mail,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
// PCF Section Adapters
import {
  VendorOverviewSectionPCF,
  VendorConsultantsSectionPCF,
  VendorActivitiesSectionPCF,
  VendorDocumentsSectionPCF,
} from './sections/vendors.sections'

// Type definition for Vendor entity
export interface Vendor extends Record<string, unknown> {
  id: string
  name: string
  type: string
  status: string
  tier?: string | null
  website?: string | null
  industry_focus?: string[] | null
  geographic_focus?: string[] | null
  notes?: string | null
  created_at: string
  updated_at?: string
  primary_contact?: Array<{
    id: string
    name: string
    email: string
    phone?: string | null
    is_primary: boolean
  }> | null
}

// Vendor status configuration
export const VENDOR_STATUS_CONFIG: Record<string, StatusConfig> = {
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
    icon: AlertCircle,
  },
}

// Vendor type configuration
export const VENDOR_TYPE_CONFIG: Record<string, StatusConfig> = {
  direct_client: {
    label: 'Direct Client',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Building2,
  },
  prime_vendor: {
    label: 'Prime Vendor',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Star,
  },
  sub_vendor: {
    label: 'Sub Vendor',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Package,
  },
  msp: {
    label: 'MSP',
    color: 'bg-teal-100 text-teal-800',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    icon: Target,
  },
  vms: {
    label: 'VMS',
    color: 'bg-indigo-100 text-indigo-800',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    icon: Settings,
  },
}

// Vendor tier configuration
export const VENDOR_TIER_CONFIG: Record<string, StatusConfig> = {
  preferred: {
    label: 'Preferred',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Star,
  },
  standard: {
    label: 'Standard',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
  },
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
}

// Vendors List View Configuration
export const vendorsListConfig: ListViewConfig<Vendor> = {
  entityType: 'vendor',
  entityName: { singular: 'Vendor', plural: 'Vendors' },
  baseRoute: '/employee/bench/vendors',

  title: 'Vendors',
  description: 'Manage vendor relationships and partnerships',
  icon: Building2,

  primaryAction: {
    label: 'New Vendor',
    icon: Plus,
    href: '/employee/bench/vendors/new',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Vendors',
      icon: Building2,
    },
    {
      key: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'preferred',
      label: 'Preferred',
      color: 'bg-gold-100 text-gold-800',
      icon: Star,
    },
    {
      key: 'jobOrders',
      label: 'Active Job Orders',
      color: 'bg-blue-100 text-blue-800',
      icon: Briefcase,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Vendors',
      placeholder: 'Search by vendor name...',
    },
    {
      key: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(VENDOR_TYPE_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'tier',
      type: 'select',
      label: 'Tier',
      options: [
        { value: 'all', label: 'All Tiers' },
        ...Object.entries(VENDOR_TIER_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        ...Object.entries(VENDOR_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      header: 'Vendor Name',
      label: 'Vendor Name',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'type',
      header: 'Type',
      label: 'Type',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => {
        const config = VENDOR_TYPE_CONFIG[value as string]
        return config?.label || (value as string) || '—'
      },
    },
    {
      key: 'tier',
      header: 'Tier',
      label: 'Tier',
      sortable: true,
      width: 'w-[80px]',
      align: 'center' as const,
      render: (value) => {
        if (!value) return '—'
        const config = VENDOR_TIER_CONFIG[value as string]
        return config?.label || (value as string)
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
      key: 'primary_contact',
      header: 'Contact',
      label: 'Contact',
      width: 'w-[130px]',
      render: (value) => {
        const contacts = value as Vendor['primary_contact']
        const primary = contacts?.find(c => c.is_primary)
        return primary?.name || '—'
      },
    },
    {
      key: 'primary_contact',
      header: 'Email',
      label: 'Email',
      icon: Mail,
      width: 'w-[180px]',
      render: (value) => {
        const contacts = value as Vendor['primary_contact']
        const primary = contacts?.find(c => c.is_primary)
        return primary?.email || '—'
      },
    },
    {
      key: 'primary_contact',
      header: 'Phone',
      label: 'Phone',
      icon: Phone,
      width: 'w-[120px]',
      render: (value) => {
        const contacts = value as Vendor['primary_contact']
        const primary = contacts?.find(c => c.is_primary)
        return primary?.phone || '—'
      },
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
  statusField: 'status',
  statusConfig: VENDOR_STATUS_CONFIG,

  pageSize: 50,

  emptyState: {
    icon: Building2,
    title: 'No vendors found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first vendor to start managing partnerships',
    action: {
      label: 'Create Vendor',
      href: '/employee/bench/vendors/new',
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const typeValue = filters.type as string | undefined
    const tierValue = filters.tier as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['active', 'inactive', 'all'] as const
    const validTypes = ['direct_client', 'prime_vendor', 'sub_vendor', 'msp', 'vms', 'all'] as const
    const validTiers = ['preferred', 'standard', 'new', 'all'] as const
    const _validSortFields = ['name', 'type', 'tier', 'status', 'created_at'] as const

    type VendorStatus = (typeof validStatuses)[number]
    type VendorType = (typeof validTypes)[number]
    type VendorTier = (typeof validTiers)[number]
    type SortField = (typeof _validSortFields)[number]

    // Map frontend column keys to database columns
    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      type: 'type',
      tier: 'tier',
      status: 'status',
      created_at: 'created_at',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'name'

    return trpc.bench.vendors.list.useQuery({
      search: filters.search as string | undefined,
      status: (statusValue && validStatuses.includes(statusValue as VendorStatus)
        ? statusValue
        : 'active') as VendorStatus,
      type: (typeValue && validTypes.includes(typeValue as VendorType)
        ? typeValue
        : 'all') as VendorType,
      tier: (tierValue && validTiers.includes(tierValue as VendorTier)
        ? tierValue
        : 'all') as VendorTier,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'asc'),
    })
  },

  // Stats query for metrics cards
  useStatsQuery: () => {
    return trpc.bench.vendors.stats.useQuery()
  },
}

// Vendors Detail View Configuration
export const vendorsDetailConfig: DetailViewConfig<Vendor> = {
  entityType: 'vendor',
  baseRoute: '/employee/bench/vendors',
  titleField: 'name',
  statusField: 'status',
  statusConfig: VENDOR_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'My Work', href: '/employee/workspace/dashboard' },
    { label: 'Vendors', href: '/employee/bench/vendors' },
  ],

  subtitleFields: [
    {
      key: 'type',
      format: (value) => {
        const config = VENDOR_TYPE_CONFIG[value as string]
        return config?.label || (value as string) || ''
      },
    },
    {
      key: 'tier',
      format: (value) => {
        if (!value) return ''
        const config = VENDOR_TIER_CONFIG[value as string]
        return config?.label || (value as string)
      },
    },
    {
      key: 'website',
      icon: Globe,
      format: (value) => {
        if (!value) return ''
        return String(value).replace(/^https?:\/\//, '')
      },
    },
  ],

  metrics: [
    {
      key: 'contacts',
      label: 'Contacts',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: () => 0,
      tooltip: 'Total contacts at this vendor',
    },
    {
      key: 'jobOrders',
      label: 'Job Orders',
      icon: Briefcase,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: () => 0,
      tooltip: 'Active job orders from this vendor',
    },
    {
      key: 'submissions',
      label: 'Submissions',
      icon: FileText,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: () => 0,
      tooltip: 'Total submissions to vendor job orders',
    },
    {
      key: 'placements',
      label: 'Placements',
      icon: CheckCircle,
      iconBg: 'bg-gold-100',
      iconColor: 'text-gold-600',
      getValue: () => 0,
      tooltip: 'Total placements through this vendor',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: VendorOverviewSectionPCF,
    },
    {
      id: 'consultants',
      label: 'Consultants',
      icon: Users,
      showCount: true,
      component: VendorConsultantsSectionPCF,
    },
    {
      id: 'job-orders',
      label: 'Job Orders',
      icon: Briefcase,
      showCount: true,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: VendorActivitiesSectionPCF,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      component: VendorDocumentsSectionPCF,
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const vendor = entity as Vendor
        window.dispatchEvent(
          new CustomEvent('openVendorDialog', {
            detail: { dialogId: 'logActivity', vendorId: vendor.id },
          })
        )
      },
    },
    {
      id: 'add-contact',
      label: 'Add Contact',
      icon: Users,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const vendor = entity as Vendor
        window.dispatchEvent(
          new CustomEvent('openVendorDialog', {
            detail: { dialogId: 'addContact', vendorId: vendor.id },
          })
        )
      },
    },
    {
      id: 'create-job-order',
      label: 'Create Job Order',
      icon: Plus,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const vendor = entity as Vendor
        window.location.href = `/employee/bench/job-orders/new?vendorId=${vendor.id}`
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Vendor',
      icon: Settings,
      onClick: (entity) => {
        window.location.href = `/employee/bench/vendors/${entity.id}/edit`
      },
    },
    {
      label: 'Update Terms',
      icon: FileText,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openVendorDialog', {
            detail: { dialogId: 'updateTerms', vendorId: entity.id },
          })
        )
      },
    },
    {
      label: 'View Performance Report',
      icon: TrendingUp,
      onClick: (entity) => {
        window.location.href = `/employee/bench/vendors/${entity.id}/performance`
      },
    },
    { separator: true, label: '' },
    {
      label: 'Deactivate Vendor',
      icon: AlertCircle,
      variant: 'destructive',
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openVendorDialog', {
            detail: { dialogId: 'deactivate', vendorId: entity.id },
          })
        )
      },
      isVisible: (entity) => {
        const vendor = entity as Vendor
        return vendor.status === 'active'
      },
    },
  ],

  eventNamespace: 'vendor',

  useEntityQuery: (entityId) => trpc.bench.vendors.getById.useQuery({ id: entityId }),
}
