import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  FileText,
  Briefcase,
  Star,
  Activity,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Target,
  Settings,
  Package,
  AlertCircle,
  DollarSign,
  Shield,
} from 'lucide-react'
import { ListViewConfig, DetailViewConfig, StatusConfig } from './types'
import { trpc } from '@/lib/trpc/client'
import { AccountDraftsTabContent } from '@/components/pcf/list-view/AccountDraftsTabContent'
// PCF Section Adapters
import {
  CompanyOverviewSectionPCF,
  CompanyContactsSectionPCF,
  CompanyJobsSectionPCF,
  CompanyPlacementsSectionPCF,
  CompanyDocumentsSectionPCF,
  CompanyActivitiesSectionPCF,
  CompanyNotesSectionPCF,
  CompanyTeamSectionPCF,
  CompanyComplianceSectionPCF,
} from './sections/companies.sections'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type CompanyCategory = 'client' | 'vendor' | 'partner' | 'prospect'
export type CompanyStatus = 'active' | 'inactive' | 'on_hold' | 'churned' | 'do_not_use' | 'pending_approval'
export type CompanyTier = 'strategic' | 'preferred' | 'standard' | 'transactional'
export type CompanySegment = 'enterprise' | 'mid_market' | 'smb' | 'startup'
export type CompanyVendorType = 'direct_client' | 'prime_vendor' | 'sub_vendor' | 'msp' | 'vms_provider' | 'talent_supplier' | 'referral_source'
export type CompanyHealthStatus = 'healthy' | 'attention' | 'at_risk'

export interface CompanyClientDetails {
  company_id: string
  billing_email?: string | null
  billing_entity_name?: string | null
  po_required?: boolean
  current_po_number?: string | null
  qbr_frequency?: string | null
  wallet_share_percentage?: number | null
}

export interface CompanyVendorDetails {
  company_id: string
  vendor_type?: CompanyVendorType | null
  industry_focus?: string[] | null
  geographic_focus?: string[] | null
  skill_focus?: string[] | null
  payment_terms_to_us?: string | null
  typical_markup_to_client?: number | null
  is_blacklisted?: boolean
  blacklist_reason?: string | null
  supplies_talent?: boolean
}

export interface Company extends Record<string, unknown> {
  id: string
  org_id: string
  category: CompanyCategory
  name: string
  legal_name?: string | null
  industry?: string | null
  sub_industry?: string | null
  status: CompanyStatus
  tier?: CompanyTier | null
  segment?: CompanySegment | null
  relationship_type?: string | null
  website?: string | null
  phone?: string | null
  linkedin_url?: string | null
  headquarters_city?: string | null
  headquarters_state?: string | null
  headquarters_country?: string | null
  timezone?: string | null
  employee_count?: number | null
  annual_revenue?: number | null
  founded_year?: number | null
  // Health & Scoring
  health_score?: number | null
  health_status?: CompanyHealthStatus | null
  nps_score?: number | null
  churn_risk?: number | null
  // Activity tracking
  last_contacted_date?: string | null
  next_scheduled_contact?: string | null
  // Revenue
  lifetime_revenue?: number | null
  revenue_ytd?: number | null
  lifetime_placements?: number | null
  // MSP/VMS
  is_msp_program?: boolean
  vms_platform?: string | null
  our_msp_tier?: number | null
  // Relationships
  owner?: { id: string; full_name: string; avatar_url?: string | null } | null
  owner_id?: string | null
  account_manager?: { id: string; full_name: string; avatar_url?: string | null } | null
  account_manager_id?: string | null
  primary_contact?: { id: string; first_name: string; last_name: string; email?: string | null } | null
  primary_contact_id?: string | null
  parent_company_id?: string | null
  // Extension data (joined from extension tables)
  client_details?: CompanyClientDetails | null
  vendor_details?: CompanyVendorDetails | null
  // Counts (computed)
  active_jobs_count?: number
  active_placements_count?: number
  total_contacts_count?: number
  // Location helper (computed)
  location?: string | null
  // Timestamps
  created_at: string
  updated_at?: string | null
  tags?: string[] | null
}

// ============================================
// STATUS CONFIGURATIONS
// ============================================

export const COMPANY_STATUS_CONFIG: Record<string, StatusConfig> = {
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
    icon: Minus,
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: AlertTriangle,
  },
  churned: {
    label: 'Churned',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: TrendingDown,
  },
  do_not_use: {
    label: 'Do Not Use',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: AlertCircle,
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Target,
  },
}

export const COMPANY_CATEGORY_CONFIG: Record<string, StatusConfig> = {
  client: {
    label: 'Client',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: Building2,
  },
  vendor: {
    label: 'Vendor',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Package,
  },
  partner: {
    label: 'Partner',
    color: 'bg-teal-100 text-teal-800',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    icon: Users,
  },
  prospect: {
    label: 'Prospect',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Target,
  },
}

export const COMPANY_TIER_CONFIG: Record<string, StatusConfig> = {
  strategic: {
    label: 'Strategic',
    color: 'bg-gold-100 text-gold-800',
    bgColor: 'bg-gold-100',
    textColor: 'text-gold-800',
    icon: Star,
  },
  preferred: {
    label: 'Preferred',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: Star,
  },
  standard: {
    label: 'Standard',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
  },
  transactional: {
    label: 'Transactional',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
}

export const COMPANY_SEGMENT_CONFIG: Record<string, StatusConfig> = {
  enterprise: {
    label: 'Enterprise',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  mid_market: {
    label: 'Mid-Market',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  smb: {
    label: 'SMB',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  startup: {
    label: 'Startup',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
}

export const COMPANY_HEALTH_CONFIG: Record<string, StatusConfig> = {
  healthy: {
    label: 'Healthy',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: TrendingUp,
  },
  attention: {
    label: 'Needs Attention',
    color: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Minus,
  },
  at_risk: {
    label: 'At Risk',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: TrendingDown,
  },
}

export const COMPANY_VENDOR_TYPE_CONFIG: Record<string, StatusConfig> = {
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
  vms_provider: {
    label: 'VMS Provider',
    color: 'bg-indigo-100 text-indigo-800',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    icon: Settings,
  },
  talent_supplier: {
    label: 'Talent Supplier',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: Users,
  },
  referral_source: {
    label: 'Referral Source',
    color: 'bg-pink-100 text-pink-800',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
  },
}

// ============================================
// FILTER OPTIONS
// ============================================

export const COMPANY_INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'energy', label: 'Energy' },
  { value: 'government', label: 'Government' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
]

// ============================================
// LIST VIEW CONFIGURATIONS
// ============================================

/**
 * Unified Companies List View - shows all categories
 */
export const companiesListConfig: ListViewConfig<Company> = {
  entityType: 'company',
  entityName: { singular: 'Company', plural: 'Companies' },
  baseRoute: '/employee/companies',

  title: 'Companies',
  description: 'Manage all business relationships',
  icon: Building2,

  primaryAction: {
    label: 'New Company',
    icon: Plus,
    href: '/employee/companies/new',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Companies',
      icon: Building2,
    },
    {
      key: 'byCategory.clients',
      label: 'Clients',
      color: 'bg-blue-100 text-blue-800',
      icon: Building2,
    },
    {
      key: 'byCategory.vendors',
      label: 'Vendors',
      color: 'bg-purple-100 text-purple-800',
      icon: Package,
    },
    {
      key: 'byStatus.active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
  ],

  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Companies',
      placeholder: 'Search by name or industry...',
    },
    {
      key: 'category',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(COMPANY_CATEGORY_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(COMPANY_STATUS_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(COMPANY_TIER_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'industry',
      type: 'select',
      label: 'Industry',
      options: [
        { value: 'all', label: 'All Industries' },
        ...COMPANY_INDUSTRY_OPTIONS,
      ],
    },
  ],

  columns: [
    {
      key: 'name',
      header: 'Company Name',
      label: 'Company Name',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'category',
      header: 'Type',
      label: 'Type',
      sortable: true,
      width: 'w-[90px]',
      render: (value) => {
        const config = COMPANY_CATEGORY_CONFIG[value as string]
        return config?.label || (value as string) || '—'
      },
    },
    {
      key: 'industry',
      header: 'Industry',
      label: 'Industry',
      sortable: true,
      width: 'w-[120px]',
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
      key: 'tier',
      header: 'Tier',
      label: 'Tier',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => {
        if (!value) return '—'
        const config = COMPANY_TIER_CONFIG[value as string]
        return config?.label || (value as string)
      },
    },
    {
      key: 'location',
      header: 'Location',
      label: 'Location',
      width: 'w-[140px]',
      render: (value, entity) => {
        const company = entity as Company
        if (company.headquarters_city && company.headquarters_state) {
          return `${company.headquarters_city}, ${company.headquarters_state}`
        }
        return company.headquarters_city || company.headquarters_state || value as string || '—'
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      label: 'Owner',
      sortable: true,
      width: 'w-[130px]',
      render: (value) => {
        const owner = value as Company['owner']
        return owner?.full_name || '—'
      },
    },
    {
      key: 'health_score',
      header: 'Health',
      label: 'Health',
      sortable: true,
      width: 'w-[80px]',
      align: 'center' as const,
      render: (value, entity) => {
        const company = entity as Company
        const score = company.health_score
        if (score === null || score === undefined) return '—'
        const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'
        return <span className={color}>{score}</span>
      },
    },
    {
      key: 'last_contacted_date',
      header: 'Last Contact',
      label: 'Last Contact',
      sortable: true,
      width: 'w-[110px]',
      format: 'relative-date' as const,
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
  statusConfig: COMPANY_STATUS_CONFIG,
  pageSize: 50,

  emptyState: {
    icon: Building2,
    title: 'No companies found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first company to start building relationships',
    action: {
      label: 'Create Company',
      href: '/employee/companies/new',
    },
  },

  // tRPC hooks for data fetching
  useListQuery: (filters) => {
    const categoryValue = filters.category as string | undefined
    const statusValue = filters.status as string | undefined
    const tierValue = filters.tier as string | undefined
    const industryValue = filters.industry as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validCategories = ['client', 'vendor', 'partner', 'prospect'] as const
    const validStatuses = ['active', 'inactive', 'on_hold', 'churned', 'do_not_use', 'pending_approval'] as const
    const validTiers = ['strategic', 'preferred', 'standard', 'transactional'] as const
    const _validSortFields = [
      'name', 'category', 'industry', 'status', 'tier', 'segment',
      'health_score', 'last_contacted_date', 'revenue_ytd', 'created_at'
    ] as const

    type Category = (typeof validCategories)[number]
    type Status = (typeof validStatuses)[number]
    type Tier = (typeof validTiers)[number]
    type SortField = (typeof _validSortFields)[number]

    // Map frontend column keys to backend fields
    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      category: 'category',
      industry: 'industry',
      status: 'status',
      tier: 'tier',
      segment: 'segment',
      health_score: 'health_score',
      healthScore: 'health_score',
      last_contacted_date: 'last_contacted_date',
      lastContactDate: 'last_contacted_date',
      created_at: 'created_at',
      createdAt: 'created_at',
      revenue_ytd: 'revenue_ytd',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    return trpc.companies.list.useQuery({
      search: filters.search as string | undefined,
      category: categoryValue && categoryValue !== 'all' && validCategories.includes(categoryValue as Category)
        ? categoryValue as Category
        : undefined,
      status: statusValue && statusValue !== 'all' && validStatuses.includes(statusValue as Status)
        ? statusValue as Status
        : undefined,
      tier: tierValue && tierValue !== 'all' && validTiers.includes(tierValue as Tier)
        ? tierValue as Tier
        : undefined,
      industry: industryValue && industryValue !== 'all' ? industryValue : undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  useStatsQuery: () => {
    return trpc.companies.stats.useQuery({})
  },
}

/**
 * Clients List View - filtered to show only clients/prospects (for accounts page)
 */
export const clientsListConfig: ListViewConfig<Company> = {
  ...companiesListConfig,
  entityType: 'client',
  entityName: { singular: 'Account', plural: 'Accounts' },
  baseRoute: '/employee/recruiting/accounts',

  title: 'Accounts',
  description: 'Manage client accounts and relationships',

  primaryAction: {
    label: 'New Account',
    icon: Plus,
    href: '/employee/recruiting/accounts/new',
  },

  statsCards: [
    {
      key: 'total',
      label: 'Total Accounts',
      icon: Building2,
    },
    {
      key: 'byStatus.active',
      label: 'Active Clients',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'byCategory.prospects',
      label: 'Prospects',
      color: 'bg-blue-100 text-blue-800',
      icon: Target,
    },
    {
      key: 'byTier.strategic',
      label: 'Strategic',
      color: 'bg-gold-100 text-gold-800',
      icon: Star,
    },
  ],

  // Remove category filter since it's preset
  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Accounts',
      placeholder: 'Search by name or industry...',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'on_hold', label: 'On Hold' },
      ],
    },
    {
      key: 'segment',
      type: 'select',
      label: 'Segment',
      options: [
        { value: 'all', label: 'All Segments' },
        ...Object.entries(COMPANY_SEGMENT_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(COMPANY_TIER_CONFIG).map(([value, config]) => ({
          value,
          label: config.label,
        })),
      ],
    },
    {
      key: 'industry',
      type: 'select',
      label: 'Industry',
      options: [
        { value: 'all', label: 'All Industries' },
        ...COMPANY_INDUSTRY_OPTIONS,
      ],
    },
  ],

  // Remove category column, adjust others
  columns: [
    {
      key: 'name',
      header: 'Company Name',
      label: 'Company Name',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'industry',
      header: 'Industry',
      label: 'Industry',
      sortable: true,
      width: 'w-[130px]',
    },
    {
      key: 'segment',
      header: 'Segment',
      label: 'Segment',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => {
        if (!value) return '—'
        const config = COMPANY_SEGMENT_CONFIG[value as string]
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
      key: 'tier',
      header: 'Tier',
      label: 'Tier',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => {
        if (!value) return '—'
        const config = COMPANY_TIER_CONFIG[value as string]
        return config?.label || (value as string)
      },
    },
    {
      key: 'location',
      header: 'Location',
      label: 'Location',
      width: 'w-[140px]',
      render: (value, entity) => {
        const company = entity as Company
        if (company.headquarters_city && company.headquarters_state) {
          return `${company.headquarters_city}, ${company.headquarters_state}`
        }
        return company.headquarters_city || company.headquarters_state || '—'
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      label: 'Owner',
      sortable: true,
      width: 'w-[130px]',
      render: (value) => {
        const owner = value as Company['owner']
        return owner?.full_name || '—'
      },
    },
    {
      key: 'health_score',
      header: 'Health',
      label: 'Health',
      sortable: true,
      width: 'w-[80px]',
      align: 'center' as const,
      render: (value, entity) => {
        const company = entity as Company
        const score = company.health_score
        if (score === null || score === undefined) return '—'
        const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'
        return <span className={color}>{score}</span>
      },
    },
    {
      key: 'last_contacted_date',
      header: 'Last Contact',
      label: 'Last Contact',
      sortable: true,
      width: 'w-[110px]',
      format: 'relative-date' as const,
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

  emptyState: {
    icon: Building2,
    title: 'No accounts found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first account to start building relationships',
    action: {
      label: 'Create Account',
      href: '/employee/recruiting/accounts/new',
    },
  },

  // Override useListQuery to preset category filter
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const tierValue = filters.tier as string | undefined
    const segmentValue = filters.segment as string | undefined
    const industryValue = filters.industry as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined
    const ownerValue = filters.owner as string | undefined
    const teamValue = filters.team as string | undefined

    const validStatuses = ['active', 'inactive', 'on_hold', 'churned', 'do_not_use', 'pending_approval'] as const
    const validTiers = ['strategic', 'preferred', 'standard', 'transactional'] as const
    const validSegments = ['enterprise', 'mid_market', 'smb', 'startup'] as const
    const _validSortFields = [
      'name', 'category', 'industry', 'status', 'tier', 'segment',
      'health_score', 'last_contacted_date', 'revenue_ytd', 'created_at'
    ] as const

    type Status = (typeof validStatuses)[number]
    type Tier = (typeof validTiers)[number]
    type Segment = (typeof validSegments)[number]
    type SortField = (typeof _validSortFields)[number]

    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      industry: 'industry',
      status: 'status',
      tier: 'tier',
      segment: 'segment',
      health_score: 'health_score',
      healthScore: 'health_score',
      last_contacted_date: 'last_contacted_date',
      lastContactDate: 'last_contacted_date',
      created_at: 'created_at',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'created_at'

    // Preset to clients and prospects only, exclude drafts (shown in separate section)
    return trpc.companies.list.useQuery({
      search: filters.search as string | undefined,
      categories: ['client', 'prospect'],
      excludeDraft: true, // Drafts are shown in "Your Drafts" section
      ownerIsMe: ownerValue === 'me',
      teamMemberIsMe: teamValue === 'me',
      status: statusValue && statusValue !== 'all' && validStatuses.includes(statusValue as Status)
        ? statusValue as Status
        : undefined,
      tier: tierValue && tierValue !== 'all' && validTiers.includes(tierValue as Tier)
        ? tierValue as Tier
        : undefined,
      segment: segmentValue && segmentValue !== 'all' && validSegments.includes(segmentValue as Segment)
        ? segmentValue as Segment
        : undefined,
      industry: industryValue && industryValue !== 'all' ? industryValue : undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
    })
  },

  useStatsQuery: () => {
    return trpc.companies.stats.useQuery({ categories: ['client', 'prospect'], excludeDraft: true })
  },

  // Tabs configuration - "Drafts" and "Accounts" tabs
  tabs: [
    {
      id: 'accounts',
      label: 'Accounts',
      showFilters: true,
      useQuery: (filters) => {
        const statusValue = filters.status as string | undefined
        const tierValue = filters.tier as string | undefined
        const segmentValue = filters.segment as string | undefined
        const industryValue = filters.industry as string | undefined
        const sortByValue = filters.sortBy as string | undefined
        const sortOrderValue = filters.sortOrder as string | undefined
        const ownerValue = filters.owner as string | undefined
        const teamValue = filters.team as string | undefined

        const validStatuses = ['active', 'inactive', 'on_hold', 'churned', 'do_not_use', 'pending_approval'] as const
        const validTiers = ['strategic', 'preferred', 'standard', 'transactional'] as const
        const validSegments = ['enterprise', 'mid_market', 'smb', 'startup'] as const
        const validSortFields = [
          'name', 'category', 'industry', 'status', 'tier', 'segment',
          'health_score', 'last_contacted_date', 'revenue_ytd', 'created_at'
        ] as const

        type Status = (typeof validStatuses)[number]
        type Tier = (typeof validTiers)[number]
        type Segment = (typeof validSegments)[number]
        type SortField = (typeof validSortFields)[number]

        const sortFieldMap: Record<string, SortField> = {
          name: 'name',
          industry: 'industry',
          status: 'status',
          tier: 'tier',
          segment: 'segment',
          health_score: 'health_score',
          healthScore: 'health_score',
          last_contacted_date: 'last_contacted_date',
          lastContactDate: 'last_contacted_date',
          created_at: 'created_at',
          createdAt: 'created_at',
        }

        const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
          ? sortFieldMap[sortByValue]
          : 'created_at'

        return trpc.companies.list.useQuery({
          search: filters.search as string | undefined,
          categories: ['client', 'prospect'],
          excludeDraft: true,
          ownerIsMe: ownerValue === 'me',
          teamMemberIsMe: teamValue === 'me',
          status: statusValue && statusValue !== 'all' && validStatuses.includes(statusValue as Status)
            ? statusValue as Status
            : undefined,
          tier: tierValue && tierValue !== 'all' && validTiers.includes(tierValue as Tier)
            ? tierValue as Tier
            : undefined,
          segment: segmentValue && segmentValue !== 'all' && validSegments.includes(segmentValue as Segment)
            ? segmentValue as Segment
            : undefined,
          industry: industryValue && industryValue !== 'all' ? industryValue : undefined,
          limit: (filters.limit as number) || 50,
          offset: (filters.offset as number) || 0,
          sortBy: mappedSortBy,
          sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'desc'),
        })
      },
      emptyState: {
        icon: Building2,
        title: 'No accounts found',
        description: (filters) =>
          filters.search
            ? 'Try adjusting your search or filters'
            : 'Create your first account to start building relationships',
        action: {
          label: 'Create Account',
          href: '/employee/recruiting/accounts/new',
        },
      },
    },
    {
      id: 'drafts',
      label: 'Drafts',
      showFilters: false,
      useQuery: () => {
        const draftsQuery = trpc.crm.accounts.listMyDrafts.useQuery()
        // Transform to expected format
        return {
          data: draftsQuery.data ? {
            items: draftsQuery.data as unknown as Company[],
            total: draftsQuery.data.length,
          } : undefined,
          isLoading: draftsQuery.isLoading,
          error: draftsQuery.error,
        }
      },
      // Use custom component that renders draft cards with Resume action
      customComponent: AccountDraftsTabContent,
      emptyState: {
        icon: FileText,
        title: 'No drafts',
        description: "You don't have any accounts in progress. Start creating a new one!",
        action: {
          label: 'Start New Account',
          href: '/employee/recruiting/accounts/new',
        },
      },
    },
  ],
  defaultTab: 'accounts',
}

/**
 * Vendors List View - filtered to show only vendors (for vendors page)
 */
export const vendorsListConfig: ListViewConfig<Company> = {
  ...companiesListConfig,
  entityType: 'vendor',
  entityName: { singular: 'Vendor', plural: 'Vendors' },
  baseRoute: '/employee/bench/vendors',

  title: 'Vendors',
  description: 'Manage vendor relationships and partnerships',

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
      key: 'byStatus.active',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      key: 'byTier.preferred',
      label: 'Preferred',
      color: 'bg-gold-100 text-gold-800',
      icon: Star,
    },
    {
      key: 'byTier.strategic',
      label: 'Strategic',
      color: 'bg-purple-100 text-purple-800',
      icon: Star,
    },
  ],

  // Vendor-specific filters
  filters: [
    {
      key: 'search',
      type: 'search',
      label: 'Vendors',
      placeholder: 'Search by vendor name...',
    },
    {
      key: 'vendorType',
      type: 'select',
      label: 'Vendor Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...Object.entries(COMPANY_VENDOR_TYPE_CONFIG).map(([value, config]) => ({
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
        ...Object.entries(COMPANY_TIER_CONFIG).map(([value, config]) => ({
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
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'do_not_use', label: 'Do Not Use' },
      ],
    },
  ],

  // Vendor-specific columns
  columns: [
    {
      key: 'name',
      header: 'Vendor Name',
      label: 'Vendor Name',
      sortable: true,
      width: 'min-w-[200px]',
    },
    {
      key: 'vendor_details',
      header: 'Type',
      label: 'Type',
      sortable: false,
      width: 'w-[120px]',
      render: (value) => {
        const details = value as CompanyVendorDetails | null
        const vendorType = details?.vendor_type
        if (!vendorType) return '—'
        const config = COMPANY_VENDOR_TYPE_CONFIG[vendorType]
        return config?.label || vendorType
      },
    },
    {
      key: 'tier',
      header: 'Tier',
      label: 'Tier',
      sortable: true,
      width: 'w-[100px]',
      render: (value) => {
        if (!value) return '—'
        const config = COMPANY_TIER_CONFIG[value as string]
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
      key: 'vendor_details',
      header: 'Industry Focus',
      label: 'Industry Focus',
      width: 'w-[150px]',
      render: (value) => {
        const details = value as CompanyVendorDetails | null
        const focus = details?.industry_focus
        if (!focus || focus.length === 0) return '—'
        return focus.slice(0, 2).join(', ') + (focus.length > 2 ? '...' : '')
      },
    },
    {
      key: 'location',
      header: 'Location',
      label: 'Location',
      width: 'w-[140px]',
      render: (value, entity) => {
        const company = entity as Company
        if (company.headquarters_city && company.headquarters_state) {
          return `${company.headquarters_city}, ${company.headquarters_state}`
        }
        return company.headquarters_city || company.headquarters_state || '—'
      },
    },
    {
      key: 'owner',
      header: 'Owner',
      label: 'Owner',
      sortable: true,
      width: 'w-[130px]',
      render: (value) => {
        const owner = value as Company['owner']
        return owner?.full_name || '—'
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

  // Override useListQuery to preset category filter
  useListQuery: (filters) => {
    const statusValue = filters.status as string | undefined
    const tierValue = filters.tier as string | undefined
    const sortByValue = filters.sortBy as string | undefined
    const sortOrderValue = filters.sortOrder as string | undefined

    const validStatuses = ['active', 'inactive', 'on_hold', 'do_not_use'] as const
    const validTiers = ['strategic', 'preferred', 'standard', 'transactional'] as const
    const _validSortFields = [
      'name', 'category', 'industry', 'status', 'tier', 'segment',
      'health_score', 'last_contacted_date', 'revenue_ytd', 'created_at'
    ] as const

    type Status = (typeof validStatuses)[number]
    type Tier = (typeof validTiers)[number]
    type SortField = (typeof _validSortFields)[number]

    const sortFieldMap: Record<string, SortField> = {
      name: 'name',
      status: 'status',
      tier: 'tier',
      created_at: 'created_at',
      createdAt: 'created_at',
    }

    const mappedSortBy = sortByValue && sortFieldMap[sortByValue]
      ? sortFieldMap[sortByValue]
      : 'name'

    // Preset to vendors only
    return trpc.companies.list.useQuery({
      search: filters.search as string | undefined,
      category: 'vendor',
      status: statusValue && statusValue !== 'all' && validStatuses.includes(statusValue as Status)
        ? statusValue as Status
        : undefined,
      tier: tierValue && tierValue !== 'all' && validTiers.includes(tierValue as Tier)
        ? tierValue as Tier
        : undefined,
      limit: (filters.limit as number) || 50,
      offset: (filters.offset as number) || 0,
      sortBy: mappedSortBy,
      sortOrder: (sortOrderValue === 'asc' || sortOrderValue === 'desc' ? sortOrderValue : 'asc'),
    })
  },

  useStatsQuery: () => {
    return trpc.companies.stats.useQuery({ category: 'vendor' })
  },
}

// ============================================
// DETAIL VIEW CONFIGURATIONS
// ============================================

/**
 * Company Detail View - unified for all company types
 */
export const companyDetailConfig: DetailViewConfig<Company> = {
  entityType: 'company',
  baseRoute: '/employee/companies',
  titleField: 'name',
  statusField: 'status',
  statusConfig: COMPANY_STATUS_CONFIG,

  breadcrumbs: [
    { label: 'My Work', href: '/employee/workspace/dashboard' },
    { label: 'Companies', href: '/employee/companies' },
  ],

  subtitleFields: [
    {
      key: 'category',
      format: (value) => {
        const config = COMPANY_CATEGORY_CONFIG[value as string]
        return config?.label || (value as string) || ''
      },
    },
    { key: 'industry' },
    {
      key: 'headquarters_city',
      icon: MapPin,
      format: (value, entity) => {
        const company = entity as unknown as Company
        if (company.headquarters_city && company.headquarters_state) {
          return `${company.headquarters_city}, ${company.headquarters_state}`
        }
        return (company.headquarters_city || company.headquarters_state || '') as string
      },
    },
    { key: 'phone', icon: Phone },
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
      key: 'activeJobs',
      label: 'Active Jobs',
      icon: Briefcase,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: (entity) => {
        const company = entity as Company
        return company.active_jobs_count ?? 0
      },
      tooltip: 'Active job requisitions',
    },
    {
      key: 'placements',
      label: 'Placements',
      icon: Users,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity) => {
        const company = entity as Company
        return company.active_placements_count ?? company.lifetime_placements ?? 0
      },
      tooltip: 'Total active placements',
    },
    {
      key: 'contacts',
      label: 'Contacts',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity) => {
        const company = entity as Company
        return company.total_contacts_count ?? 0
      },
      tooltip: 'Total contacts at this company',
    },
    {
      key: 'health',
      label: 'Health Score',
      icon: Activity,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      getValue: (entity) => {
        const company = entity as Company
        return company.health_score ?? 0
      },
      tooltip: 'Company health score (0-100)',
    },
  ],

  navigationMode: 'sections',
  defaultSection: 'overview',

  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: CompanyOverviewSectionPCF,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      showCount: true,
      component: CompanyContactsSectionPCF,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      showCount: true,
      component: CompanyJobsSectionPCF,
    },
    {
      id: 'placements',
      label: 'Placements',
      icon: CheckCircle,
      showCount: true,
      component: CompanyPlacementsSectionPCF,
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      component: CompanyTeamSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: CompanyActivitiesSectionPCF,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: MessageSquare,
      component: CompanyNotesSectionPCF,
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: Shield,
      component: CompanyComplianceSectionPCF,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      component: CompanyDocumentsSectionPCF,
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const company = entity as Company
        window.dispatchEvent(
          new CustomEvent('openCompanyDialog', {
            detail: { dialogId: 'logActivity', companyId: company.id },
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
        const company = entity as Company
        window.dispatchEvent(
          new CustomEvent('openCompanyDialog', {
            detail: { dialogId: 'addContact', companyId: company.id },
          })
        )
      },
    },
    {
      id: 'create-job',
      label: 'Create Job',
      icon: Plus,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const company = entity as Company
        window.location.href = `/employee/recruiting/jobs/new?companyId=${company.id}`
      },
      isVisible: (entity: unknown) => {
        const company = entity as Company
        return company.category === 'client' || company.category === 'prospect'
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Company',
      icon: FileText,
      onClick: (entity) => {
        window.location.href = `/employee/companies/${entity.id}/edit`
      },
    },
    {
      label: 'View Health Dashboard',
      icon: TrendingUp,
      onClick: (entity) => {
        window.location.href = `/employee/companies/${entity.id}/health`
      },
    },
    { separator: true, label: '' },
    {
      label: 'Manage Team',
      icon: Users,
      onClick: (entity) => {
        window.dispatchEvent(
          new CustomEvent('openCompanyDialog', {
            detail: { dialogId: 'manageTeam', companyId: entity.id },
          })
        )
      },
    },
  ],

  eventNamespace: 'company',

  useEntityQuery: (entityId) => trpc.companies.getById.useQuery({ id: entityId }),
}

/**
 * Client (Account) Detail View - same as company but with client-specific breadcrumbs
 */
export const clientDetailConfig: DetailViewConfig<Company> = {
  ...companyDetailConfig,
  entityType: 'client',
  baseRoute: '/employee/recruiting/accounts',

  breadcrumbs: [
    { label: 'My Work', href: '/employee/workspace/dashboard' },
    { label: 'Accounts', href: '/employee/recruiting/accounts' },
  ],

  // Hide category in subtitle for account pages
  subtitleFields: [
    { key: 'industry' },
    {
      key: 'headquarters_city',
      icon: MapPin,
      format: (value, entity) => {
        const company = entity as unknown as Company
        if (company.headquarters_city && company.headquarters_state) {
          return `${company.headquarters_city}, ${company.headquarters_state}`
        }
        return (company.headquarters_city || company.headquarters_state || '') as string
      },
    },
    { key: 'phone', icon: Phone },
    {
      key: 'website',
      icon: Globe,
      format: (value) => {
        if (!value) return ''
        return String(value).replace(/^https?:\/\//, '')
      },
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const company = entity as Company
        window.dispatchEvent(
          new CustomEvent('openAccountDialog', {
            detail: { dialogId: 'logActivity', accountId: company.id },
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
        const company = entity as Company
        window.dispatchEvent(
          new CustomEvent('openAccountDialog', {
            detail: { dialogId: 'addContact', accountId: company.id },
          })
        )
      },
    },
    {
      id: 'create-job',
      label: 'Create Job',
      icon: Plus,
      variant: 'outline',
      onClick: (entity: unknown) => {
        const company = entity as Company
        window.location.href = `/employee/recruiting/jobs/new?accountId=${company.id}`
      },
    },
  ],

  dropdownActions: [
    {
      label: 'Edit Account',
      icon: FileText,
      onClick: (entity) => {
        window.location.href = `/employee/recruiting/accounts/${entity.id}/edit`
      },
    },
    {
      label: 'View Health Dashboard',
      icon: TrendingUp,
      onClick: (entity) => {
        window.location.href = `/employee/recruiting/accounts/${entity.id}/health`
      },
    },
    { separator: true, label: '' },
    {
      label: 'Start Onboarding',
      icon: Calendar,
      onClick: (entity) => {
        window.location.href = `/employee/recruiting/accounts/${entity.id}/onboarding`
      },
      isVisible: (entity) => entity.category === 'prospect',
    },
  ],

  eventNamespace: 'account',
}

/**
 * Vendor Detail View - same as company but with vendor-specific breadcrumbs
 */
export const vendorDetailConfig: DetailViewConfig<Company> = {
  ...companyDetailConfig,
  entityType: 'vendor',
  baseRoute: '/employee/bench/vendors',

  breadcrumbs: [
    { label: 'My Work', href: '/employee/workspace/dashboard' },
    { label: 'Vendors', href: '/employee/bench/vendors' },
  ],

  // Vendor-specific subtitle
  subtitleFields: [
    {
      key: 'vendor_details',
      format: (value) => {
        const details = value as CompanyVendorDetails | null
        const vendorType = details?.vendor_type
        if (!vendorType) return ''
        const config = COMPANY_VENDOR_TYPE_CONFIG[vendorType]
        return config?.label || vendorType
      },
    },
    {
      key: 'tier',
      format: (value) => {
        if (!value) return ''
        const config = COMPANY_TIER_CONFIG[value as string]
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

  // Vendor-specific metrics
  metrics: [
    {
      key: 'contacts',
      label: 'Contacts',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      getValue: (entity) => {
        const company = entity as Company
        return company.total_contacts_count ?? 0
      },
      tooltip: 'Total contacts at this vendor',
    },
    {
      key: 'jobOrders',
      label: 'Job Orders',
      icon: Briefcase,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      getValue: () => 0, // TODO: implement job orders count
      tooltip: 'Active job orders from this vendor',
    },
    {
      key: 'placements',
      label: 'Placements',
      icon: CheckCircle,
      iconBg: 'bg-gold-100',
      iconColor: 'text-gold-600',
      getValue: (entity) => {
        const company = entity as Company
        return company.lifetime_placements ?? 0
      },
      tooltip: 'Total placements through this vendor',
    },
    {
      key: 'revenue',
      label: 'Revenue YTD',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      getValue: (entity) => {
        const company = entity as Company
        return company.revenue_ytd ?? 0
      },
      format: (value) => `$${(value as number).toLocaleString()}`,
      tooltip: 'Revenue from this vendor year-to-date',
    },
  ],

  // Vendor-specific sections (different order)
  sections: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      component: CompanyOverviewSectionPCF,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      showCount: true,
      component: CompanyContactsSectionPCF,
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      component: CompanyTeamSectionPCF,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      component: CompanyActivitiesSectionPCF,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: MessageSquare,
      component: CompanyNotesSectionPCF,
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: Shield,
      component: CompanyComplianceSectionPCF,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      component: CompanyDocumentsSectionPCF,
    },
  ],

  quickActions: [
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Activity,
      variant: 'default',
      onClick: (entity: unknown) => {
        const company = entity as Company
        window.dispatchEvent(
          new CustomEvent('openVendorDialog', {
            detail: { dialogId: 'logActivity', vendorId: company.id },
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
        const company = entity as Company
        window.dispatchEvent(
          new CustomEvent('openVendorDialog', {
            detail: { dialogId: 'addContact', vendorId: company.id },
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
        const company = entity as Company
        window.location.href = `/employee/bench/job-orders/new?vendorId=${company.id}`
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
      isVisible: (entity) => entity.status === 'active',
    },
  ],

  eventNamespace: 'vendor',
}
