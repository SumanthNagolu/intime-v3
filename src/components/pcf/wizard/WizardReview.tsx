'use client'

import {
  Edit,
  Building2,
  MapPin,
  CreditCard,
  Users,
  FileText,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Hash,
  Tag,
  Crown,
  Target,
  Calendar,
  DollarSign,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Award,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// Field label mappings for human-readable labels
const FIELD_LABELS: Record<string, string> = {
  name: 'Company Name',
  legalName: 'Legal Name',
  dba: 'DBA (Doing Business As)',
  taxId: 'Tax ID (EIN)',
  email: 'Primary Email',
  phone: 'Primary Phone',
  website: 'Website',
  linkedinUrl: 'LinkedIn',
  description: 'Description',
  industries: 'Industries',
  companyType: 'Company Type',
  tier: 'Partnership Tier',
  segment: 'Market Segment',
  addresses: 'Addresses',
  billingEntityName: 'Billing Entity',
  billingEmail: 'Billing Email',
  billingPhone: 'Billing Phone',
  billingAddress: 'Billing Address',
  billingFrequency: 'Billing Frequency',
  paymentTermsDays: 'Payment Terms',
  currency: 'Currency',
  invoiceFormat: 'Invoice Format',
  poRequired: 'PO Required',
  currentPoNumber: 'PO Number',
  poExpirationDate: 'PO Expiration',
  contacts: 'Contacts',
  contracts: 'Contracts',
  compliance: 'Compliance Requirements',
  team: 'Team Assignment',
}

// Section icons
const SECTION_ICONS: Record<string, LucideIcon> = {
  'Account Identity': Building2,
  'Locations': MapPin,
  'Billing': CreditCard,
  'Contacts': Users,
  'Contracts': FileText,
  'Compliance': ShieldCheck,
  'Team': User,
}

// Value formatters
const VALUE_FORMATTERS: Record<string, string> = {
  direct_client: 'Direct Client',
  implementation_partner: 'Implementation Partner',
  staffing_vendor: 'Staffing Vendor',
  preferred: 'Preferred',
  strategic: 'Strategic',
  exclusive: 'Exclusive',
  enterprise: 'Enterprise',
  mid_market: 'Mid-Market',
  smb: 'SMB',
  startup: 'Startup',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  USD: 'USD - US Dollar',
  CAD: 'CAD - Canadian Dollar',
  EUR: 'EUR - Euro',
  GBP: 'GBP - British Pound',
  standard: 'Standard Detailed',
  consolidated: 'Consolidated',
  summary: 'Summary Only',
}

interface ReviewSection<T> {
  label: string
  fields: (keyof T)[]
  stepNumber?: number
}

interface WizardReviewProps<T> {
  title: string
  sections: ReviewSection<T>[]
  formData: T
  fieldDefinitions?: unknown[]
  onEditStep: (step: number) => void
}

// Helper to format phone values
function formatPhone(phone: { countryCode?: string; number?: string } | null | undefined): string {
  if (!phone || !phone.number) return '—'
  const countryCode = phone.countryCode || 'US'
  return `+1 ${phone.number}` // Simplified - could use intl formatting
}

// Helper to format dates
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return '—'
  }
}

// Render a field value with proper formatting
function renderFieldValue(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-charcoal-400 italic">Not provided</span>
  }

  // Boolean fields
  if (typeof value === 'boolean') {
    return value ? (
      <Badge variant="outline" className="bg-success-50 text-success-700 border-success-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Yes
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-charcoal-50 text-charcoal-500 border-charcoal-200">
        <XCircle className="w-3 h-3 mr-1" />
        No
      </Badge>
    )
  }

  // Phone fields
  if (key.toLowerCase().includes('phone') && typeof value === 'object') {
    const formatted = formatPhone(value as { countryCode?: string; number?: string })
    return formatted !== '—' ? (
      <span className="flex items-center gap-2">
        <Phone className="w-3.5 h-3.5 text-charcoal-400" />
        {formatted}
      </span>
    ) : (
      <span className="text-charcoal-400 italic">Not provided</span>
    )
  }

  // Date fields
  if (key.toLowerCase().includes('date') || key.toLowerCase().includes('expiration')) {
    return formatDate(value as Date | string)
  }

  // Email fields
  if (key.toLowerCase().includes('email')) {
    return (
      <span className="flex items-center gap-2">
        <Mail className="w-3.5 h-3.5 text-charcoal-400" />
        {String(value)}
      </span>
    )
  }

  // Website/URL fields
  if (key.toLowerCase().includes('website') || key.toLowerCase().includes('url')) {
    const url = String(value)
    return (
      <a
        href={url.startsWith('http') ? url : `https://${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-gold-600 hover:text-gold-700 hover:underline"
      >
        {key.toLowerCase().includes('linkedin') ? (
          <Linkedin className="w-3.5 h-3.5" />
        ) : (
          <Globe className="w-3.5 h-3.5" />
        )}
        {url.length > 40 ? url.slice(0, 40) + '...' : url}
      </a>
    )
  }

  // Payment terms
  if (key === 'paymentTermsDays') {
    return <Badge variant="outline" className="bg-charcoal-50">Net {String(value)}</Badge>
  }

  // Industries array
  if (key === 'industries' && Array.isArray(value)) {
    if (value.length === 0) return <span className="text-charcoal-400 italic">None selected</span>
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((ind) => (
          <Badge key={ind} variant="outline" className="bg-charcoal-50 text-charcoal-700 capitalize">
            {ind.replace(/_/g, ' ')}
          </Badge>
        ))}
      </div>
    )
  }

  // Formatted values lookup
  if (typeof value === 'string' && VALUE_FORMATTERS[value]) {
    return VALUE_FORMATTERS[value]
  }

  // Default string/number
  return String(value)
}

// Addresses renderer
function AddressesReview({ addresses }: { addresses: unknown[] }) {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-6 text-charcoal-400">
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No addresses added</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {addresses.map((addr: unknown, idx: number) => {
        const a = addr as Record<string, unknown>
        const typeLabel = String(a.type || 'office').replace(/_/g, ' ')
        return (
          <div
            key={a.id as string || idx}
            className="flex items-start gap-3 p-3 bg-charcoal-50/50 rounded-lg"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <MapPin className="w-4 h-4 text-gold-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-charcoal-900 capitalize">{typeLabel}</span>
                {Boolean(a.isPrimary) && (
                  <Badge className="bg-gold-100 text-gold-700 text-xs">Primary</Badge>
                )}
              </div>
              <p className="text-sm text-charcoal-600">
                {[a.addressLine1, a.addressLine2].filter(Boolean).map(String).join(', ')}
              </p>
              <p className="text-sm text-charcoal-500">
                {[a.city, a.state, a.postalCode, a.country].filter(Boolean).map(String).join(', ')}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Contacts renderer
function ContactsReview({ contacts }: { contacts: unknown[] }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-6 text-charcoal-400">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No contacts added</p>
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    primary: 'Primary Contact',
    billing: 'Billing Contact',
    executive_sponsor: 'Executive Sponsor',
    hiring_manager: 'Hiring Manager',
    hr: 'HR Contact',
    procurement: 'Procurement',
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact: unknown, idx: number) => {
        const c = contact as Record<string, unknown>
        const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed Contact'
        const role = roleLabels[c.role as string] || String(c.role || 'Contact').replace(/_/g, ' ')
        return (
          <div
            key={c.id as string || idx}
            className="flex items-start gap-3 p-3 bg-charcoal-50/50 rounded-lg"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {(c.firstName as string || 'U')[0]}{(c.lastName as string || '')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-charcoal-900">{name}</span>
                {Boolean(c.isPrimary) && (
                  <Badge className="bg-gold-100 text-gold-700 text-xs">Primary</Badge>
                )}
              </div>
              <p className="text-xs text-charcoal-500 mb-1">
                {c.title ? String(c.title) : ''}{c.title && c.department ? ' · ' : ''}{c.department ? String(c.department) : ''}
              </p>
              <div className="flex items-center gap-4 text-xs text-charcoal-600">
                {Boolean(c.email) && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-charcoal-400" />
                    {String(c.email)}
                  </span>
                )}
                {Boolean((c.phone as { number?: string })?.number) && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-charcoal-400" />
                    {String((c.phone as { number: string }).number)}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="mt-2 text-xs capitalize">{String(role)}</Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Contracts renderer
function ContractsReview({ contracts }: { contracts: unknown[] }) {
  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center py-6 text-charcoal-400">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No contracts added</p>
      </div>
    )
  }

  const typeLabels: Record<string, string> = {
    msa: 'Master Services Agreement',
    nda: 'Non-Disclosure Agreement',
    sow: 'Statement of Work',
    rate_agreement: 'Rate Agreement',
    subcontract: 'Subcontract',
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-charcoal-100 text-charcoal-600',
    active: 'bg-success-50 text-success-700',
    pending_signature: 'bg-warning-50 text-warning-700',
  }

  return (
    <div className="space-y-3">
      {contracts.map((contract: unknown, idx: number) => {
        const c = contract as Record<string, unknown>
        const type = typeLabels[c.type as string] || String(c.type || 'Contract').replace(/_/g, ' ')
        return (
          <div
            key={c.id as string || idx}
            className="flex items-start gap-3 p-3 bg-charcoal-50/50 rounded-lg"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <FileText className="w-4 h-4 text-gold-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-charcoal-900">{c.name ? String(c.name) : type}</span>
                <Badge className={cn('text-xs', statusColors[c.status as string] || statusColors.draft)}>
                  {String(c.status || 'draft').replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="text-xs text-charcoal-500">{String(type)}</p>
              {Boolean(c.number) && (
                <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-1">
                  <Hash className="w-3 h-3" /> {String(c.number)}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                {Boolean(c.effectiveDate) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(c.effectiveDate as Date)}
                  </span>
                )}
                {Boolean(c.contractValue) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${Number(c.contractValue).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Compliance renderer
function ComplianceReview({ compliance }: { compliance: unknown }) {
  if (!compliance) {
    return (
      <div className="text-center py-6 text-charcoal-400">
        <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No compliance requirements set</p>
      </div>
    )
  }

  const c = compliance as {
    insurance?: {
      generalLiability?: boolean
      professionalLiability?: boolean
      workersComp?: boolean
      cyberLiability?: boolean
    }
    backgroundCheck?: {
      required?: boolean
      level?: string
    }
    drugTest?: {
      required?: boolean
    }
    certifications?: string[]
  }

  const insuranceItems = [
    { key: 'generalLiability', label: 'General Liability', enabled: c.insurance?.generalLiability },
    { key: 'professionalLiability', label: 'Professional Liability (E&O)', enabled: c.insurance?.professionalLiability },
    { key: 'workersComp', label: "Workers' Compensation", enabled: c.insurance?.workersComp },
    { key: 'cyberLiability', label: 'Cyber Liability', enabled: c.insurance?.cyberLiability },
  ]

  const activeInsurance = insuranceItems.filter(i => i.enabled)
  const hasRequirements = activeInsurance.length > 0 || c.backgroundCheck?.required || c.drugTest?.required || (c.certifications?.length || 0) > 0

  if (!hasRequirements) {
    return (
      <div className="text-center py-6 text-charcoal-400">
        <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No compliance requirements set</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Insurance Requirements */}
      {activeInsurance.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
            Insurance Requirements
          </h4>
          <div className="flex flex-wrap gap-2">
            {activeInsurance.map(item => (
              <Badge
                key={item.key}
                variant="outline"
                className="bg-success-50 text-success-700 border-success-200"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {item.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Screening Requirements */}
      {(c.backgroundCheck?.required || c.drugTest?.required) && (
        <div>
          <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
            Screening Requirements
          </h4>
          <div className="flex flex-wrap gap-2">
            {c.backgroundCheck?.required && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <FileCheck className="w-3 h-3 mr-1" />
                Background Check
                {c.backgroundCheck.level && ` (${c.backgroundCheck.level})`}
              </Badge>
            )}
            {c.drugTest?.required && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Drug Screening
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Certifications */}
      {c.certifications && c.certifications.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
            Required Certifications
          </h4>
          <div className="flex flex-wrap gap-2">
            {c.certifications.map((cert, idx) => (
              <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Award className="w-3 h-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Team renderer
function TeamReview({ team, teamMembers }: { team: unknown; teamMembers?: Record<string, { name: string; role: string }> }) {
  if (!team) {
    return (
      <div className="text-center py-6 text-charcoal-400">
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No team assigned</p>
      </div>
    )
  }

  const t = team as {
    ownerId?: string
    accountManagerId?: string
    recruiterId?: string
    salesLeadId?: string
  }

  const assignments = [
    { key: 'ownerId', label: 'Account Owner', icon: Crown, value: t.ownerId, required: true },
    { key: 'accountManagerId', label: 'Account Manager', icon: Briefcase, value: t.accountManagerId },
    { key: 'salesLeadId', label: 'Sales Lead', icon: Target, value: t.salesLeadId },
    { key: 'recruiterId', label: 'Primary Recruiter', icon: Users, value: t.recruiterId },
  ]

  const assignedCount = assignments.filter(a => a.value).length

  if (assignedCount === 0) {
    return (
      <div className="text-center py-6 text-charcoal-400">
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No team members assigned</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {assignments.map(({ key, label, icon: Icon, value, required }) => (
        <div
          key={key}
          className={cn(
            'p-3 rounded-lg border',
            value ? 'bg-charcoal-50/50 border-charcoal-100' : 'bg-white border-dashed border-charcoal-200'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon className={cn('w-4 h-4', value ? 'text-gold-500' : 'text-charcoal-300')} />
            <span className="text-xs font-medium text-charcoal-500">{label}</span>
            {required && !value && (
              <Badge className="bg-error-50 text-error-600 text-xs ml-auto">Required</Badge>
            )}
          </div>
          {value ? (
            <p className="text-sm font-medium text-charcoal-900 pl-6">
              {teamMembers?.[value]?.name || 'Team Member'}
            </p>
          ) : (
            <p className="text-sm text-charcoal-400 italic pl-6">Not assigned</p>
          )}
        </div>
      ))}
    </div>
  )
}

// Main Review Section Component
function ReviewSection<T>({
  section,
  formData,
  onEdit,
}: {
  section: ReviewSection<T>
  formData: T
  onEdit: () => void
}) {
  const Icon = SECTION_ICONS[section.label] || Building2

  // Special renderers for complex fields
  const hasAddresses = section.fields.includes('addresses' as keyof T)
  const hasContacts = section.fields.includes('contacts' as keyof T)
  const hasContracts = section.fields.includes('contracts' as keyof T)
  const hasCompliance = section.fields.includes('compliance' as keyof T)
  const hasTeam = section.fields.includes('team' as keyof T)

  // Filter out complex fields for simple field rendering
  const simpleFields = section.fields.filter(
    f => !['addresses', 'contacts', 'contracts', 'compliance', 'team'].includes(String(f))
  )

  // Group fields logically
  const groupedFields = simpleFields.reduce((groups, field) => {
    const key = String(field)
    // Identity group
    if (['name', 'legalName', 'dba'].includes(key)) {
      groups.identity = [...(groups.identity || []), field]
    }
    // Contact info group
    else if (['email', 'phone', 'website', 'linkedinUrl'].includes(key)) {
      groups.contact = [...(groups.contact || []), field]
    }
    // Classification group
    else if (['industries', 'companyType', 'tier', 'segment'].includes(key)) {
      groups.classification = [...(groups.classification || []), field]
    }
    // Billing entity group
    else if (['billingEntityName', 'billingEmail', 'billingPhone'].includes(key)) {
      groups.billingEntity = [...(groups.billingEntity || []), field]
    }
    // Payment config group
    else if (['paymentTermsDays', 'billingFrequency', 'currency', 'invoiceFormat'].includes(key)) {
      groups.paymentConfig = [...(groups.paymentConfig || []), field]
    }
    // PO group
    else if (['poRequired', 'currentPoNumber', 'poExpirationDate'].includes(key)) {
      groups.po = [...(groups.po || []), field]
    }
    // Default group
    else {
      groups.other = [...(groups.other || []), field]
    }
    return groups
  }, {} as Record<string, (keyof T)[]>)

  return (
    <div className="bg-white rounded-xl border border-charcoal-100 shadow-elevation-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-charcoal-50 to-white border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Icon className="w-5 h-5 text-gold-500" />
          </div>
          <h3 className="font-heading font-semibold text-charcoal-900">{section.label}</h3>
        </div>
        {section.stepNumber && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-gold-600 hover:text-gold-700 hover:bg-gold-50"
          >
            <Edit className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Simple fields grouped */}
        {Object.entries(groupedFields).map(([group, fields]) => {
          if (fields.length === 0) return null

          // Special handling for PO group - only show if poRequired
          if (group === 'po') {
            const poRequired = (formData as Record<string, unknown>).poRequired
            if (!poRequired) {
              return (
                <div key={group} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 p-3 bg-charcoal-50/50 rounded-lg">
                    <FileCheck className="w-4 h-4 text-charcoal-400" />
                    <span className="text-sm text-charcoal-600">Purchase Orders not required</span>
                  </div>
                </div>
              )
            }
          }

          return (
            <div key={group} className="mb-6 last:mb-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                {fields.map((fieldKey) => {
                  const value = (formData as Record<string, unknown>)[String(fieldKey)]
                  const label = FIELD_LABELS[String(fieldKey)] || String(fieldKey)

                  // Full width for description
                  const isFullWidth = String(fieldKey) === 'description' || String(fieldKey) === 'industries'

                  return (
                    <div
                      key={String(fieldKey)}
                      className={cn(isFullWidth && 'col-span-2 md:col-span-3')}
                    >
                      <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                        {label}
                      </dt>
                      <dd className="text-sm text-charcoal-900">
                        {renderFieldValue(String(fieldKey), value)}
                      </dd>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Complex field renderers */}
        {hasAddresses && (
          <AddressesReview addresses={(formData as Record<string, unknown>).addresses as unknown[]} />
        )}
        {hasContacts && (
          <ContactsReview contacts={(formData as Record<string, unknown>).contacts as unknown[]} />
        )}
        {hasContracts && (
          <ContractsReview contracts={(formData as Record<string, unknown>).contracts as unknown[]} />
        )}
        {hasCompliance && (
          <ComplianceReview compliance={(formData as Record<string, unknown>).compliance} />
        )}
        {hasTeam && (
          <TeamReview team={(formData as Record<string, unknown>).team} />
        )}
      </div>
    </div>
  )
}

export function WizardReview<T>({
  title,
  sections,
  formData,
  onEditStep,
}: WizardReviewProps<T>) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold-glow">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-semibold text-charcoal-900">{title}</h2>
          <p className="text-sm text-charcoal-500">Review all information before creating the account</p>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-success-50 to-emerald-50 rounded-xl border border-success-200">
        <CheckCircle2 className="w-5 h-5 text-success-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-success-800">All steps completed</p>
          <p className="text-xs text-success-600">
            {sections.length} sections ready for review
          </p>
        </div>
        <Clock className="w-4 h-4 text-success-400" />
        <span className="text-xs text-success-600">Almost done!</span>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <ReviewSection
            key={section.label}
            section={section}
            formData={formData}
            onEdit={() => section.stepNumber && onEditStep(section.stepNumber)}
          />
        ))}
      </div>
    </div>
  )
}
