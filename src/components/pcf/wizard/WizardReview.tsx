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
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// Field label mappings for human-readable labels
const FIELD_LABELS: Record<string, string> = {
  // Account/Company fields
  name: 'Company Name',
  legalName: 'Legal Name',
  dba: 'DBA (Doing Business As)',
  taxId: 'Tax ID (EIN)',
  email: 'Email',
  phone: 'Phone',
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
  // Candidate fields - Source
  sourceType: 'Source Type',
  resumeParsed: 'Resume Parsed',
  resumeStoragePath: 'Resume',
  resumeFileName: 'Resume File',
  resumeFileSize: 'File Size',
  // Candidate fields - Contact
  firstName: 'First Name',
  lastName: 'Last Name',
  location: 'Location',
  linkedinProfile: 'LinkedIn',
  professionalHeadline: 'Professional Headline',
  professionalSummary: 'Professional Summary',
  experienceYears: 'Years of Experience',
  employmentTypes: 'Employment Preferences',
  workModes: 'Work Mode Preferences',
  workHistory: 'Work History',
  education: 'Education',
  skills: 'Skills',
  primarySkills: 'Primary Skills',
  certifications: 'Certifications',
  // Work Authorization
  visaStatus: 'Work Authorization',
  visaExpiryDate: 'Visa Expiry',
  requiresSponsorship: 'Requires Sponsorship',
  currentSponsor: 'Current Sponsor',
  isTransferable: 'Visa Transferable',
  // Availability
  availability: 'Availability',
  availableFrom: 'Available From',
  noticePeriodDays: 'Notice Period',
  willingToRelocate: 'Willing to Relocate',
  relocationPreferences: 'Relocation Preferences',
  isRemoteOk: 'Open to Remote',
  // Compensation
  rateType: 'Rate Type',
  minimumRate: 'Minimum Rate',
  desiredRate: 'Desired Rate',
  isNegotiable: 'Negotiable',
  compensationNotes: 'Compensation Notes',
  // Source & Tracking
  leadSource: 'Lead Source',
  sourceDetails: 'Source Details',
  referredBy: 'Referred By',
  campaignId: 'Campaign',
  complianceDocuments: 'Documents',
  isOnHotlist: 'On Hotlist',
  hotlistNotes: 'Hotlist Notes',
  tags: 'Tags',
  internalNotes: 'Internal Notes',
}

// Section icons
const SECTION_ICONS: Record<string, LucideIcon> = {
  // Account sections
  'Account Identity': Building2,
  'Locations': MapPin,
  'Billing': CreditCard,
  'Contacts': Users,
  'Contracts': FileText,
  'Compliance': ShieldCheck,
  'Team': User,
  // Candidate sections
  'Source': Upload,
  'Contact Information': User,
  'Profile Details': User,
  'Experience': Briefcase,
  'Professional Experience': Briefcase,
  'Qualifications': Award,
  'Work Authorization': ShieldCheck,
  'Availability & Preferences': Clock,
  'Compensation': DollarSign,
  'Employment Terms': DollarSign,
  'Source & Tracking': Target,
  'Documents & Tracking': FileText,
  'Documents': FileText,
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
  INR: 'INR - Indian Rupee',
  standard: 'Standard Detailed',
  consolidated: 'Consolidated',
  summary: 'Summary Only',
  // Candidate-specific formatters
  us_citizen: 'US Citizen',
  green_card: 'Green Card',
  h1b: 'H-1B Visa',
  l1: 'L-1 Visa',
  tn: 'TN Visa',
  opt: 'OPT',
  cpt: 'CPT',
  ead: 'EAD',
  other: 'Other',
  immediate: 'Immediate',
  '2_weeks': '2 Weeks',
  '30_days': '30 Days',
  '60_days': '60 Days',
  not_available: 'Not Available',
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  contract_to_hire: 'Contract to Hire',
  on_site: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
  hourly: 'Hourly',
  daily: 'Daily',
  annual: 'Annual',
  per_diem: 'Per Diem',
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  dice: 'Dice',
  monster: 'Monster',
  referral: 'Referral',
  direct: 'Direct Application',
  agency: 'Agency',
  job_board: 'Job Board',
  website: 'Website',
  event: 'Event',
  // Source types
  manual: 'Manual Entry',
  resume: 'Resume Upload',
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

  // Resume file name
  if (key === 'resumeFileName' && value) {
    return (
      <div className="flex items-center gap-2 p-2 bg-success-50 rounded-lg border border-success-200">
        <FileText className="w-4 h-4 text-success-600" />
        <span className="text-sm font-medium text-success-700">{String(value)}</span>
        <CheckCircle2 className="w-4 h-4 text-success-600 ml-auto" />
      </div>
    )
  }

  // Resume file size (format as KB/MB)
  if (key === 'resumeFileSize' && typeof value === 'number') {
    const sizeKB = value / 1024
    const formatted = sizeKB >= 1024
      ? `${(sizeKB / 1024).toFixed(1)} MB`
      : `${sizeKB.toFixed(1)} KB`
    return <span className="text-charcoal-600">{formatted}</span>
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

  // String arrays (tags, employmentTypes, workModes, primarySkills)
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, idx) => (
          <Badge key={idx} variant="outline" className="bg-charcoal-50 text-charcoal-700">
            {VALUE_FORMATTERS[item] || item.replace(/_/g, ' ')}
          </Badge>
        ))}
      </div>
    )
  }

  // Skills array (objects with name, proficiency, and isPrimary)
  if (key === 'skills' && Array.isArray(value)) {
    if (value.length === 0) return <span className="text-charcoal-400 italic">No skills added</span>

    const proficiencyLabels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    }
    const proficiencyColors: Record<string, string> = {
      beginner: 'bg-charcoal-100 text-charcoal-600',
      intermediate: 'bg-blue-100 text-blue-700',
      advanced: 'bg-purple-100 text-purple-700',
      expert: 'bg-success-100 text-success-700',
    }

    // Separate primary and other skills
    const primarySkills = value.filter((s) => typeof s === 'object' && s.isPrimary)
    const otherSkills = value.filter((s) => typeof s !== 'object' || !s.isPrimary)

    return (
      <div className="space-y-3">
        {primarySkills.length > 0 && (
          <div>
            <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Primary Skills</div>
            <div className="flex flex-wrap gap-2">
              {primarySkills.map((skill, idx) => {
                const s = skill as { name: string; proficiency?: string; yearsOfExperience?: number; isCertified?: boolean }
                return (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gold-50 rounded-lg border border-gold-200">
                    <Crown className="w-3.5 h-3.5 text-gold-500" />
                    <span className="font-medium text-charcoal-900 text-sm">{s.name}</span>
                    {s.proficiency && (
                      <Badge className={cn('text-xs', proficiencyColors[s.proficiency] || proficiencyColors.intermediate)}>
                        {proficiencyLabels[s.proficiency] || s.proficiency}
                      </Badge>
                    )}
                    {s.yearsOfExperience !== undefined && (
                      <span className="text-xs text-charcoal-500">{s.yearsOfExperience}y</span>
                    )}
                    {s.isCertified && (
                      <Award className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {otherSkills.length > 0 && (
          <div>
            {primarySkills.length > 0 && (
              <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Other Skills</div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {otherSkills.map((skill, idx) => {
                const skillName = typeof skill === 'string' ? skill : skill.name
                const s = typeof skill === 'object' ? skill as { proficiency?: string; yearsOfExperience?: number } : null
                return (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-charcoal-50 text-charcoal-700"
                  >
                    {skillName}
                    {s?.proficiency && (
                      <span className="ml-1 text-charcoal-400">• {proficiencyLabels[s.proficiency] || s.proficiency}</span>
                    )}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Work history array
  if (key === 'workHistory' && Array.isArray(value)) {
    if (value.length === 0) return <span className="text-charcoal-400 italic">No work history added</span>

    const employmentTypeLabels: Record<string, string> = {
      full_time: 'Full-Time',
      contract: 'Contract',
      part_time: 'Part-Time',
      internship: 'Internship',
    }

    return (
      <div className="space-y-3">
        {value.map((job, idx) => {
          const j = job as {
            companyName?: string
            jobTitle?: string
            employmentType?: string
            startDate?: string
            endDate?: string
            isCurrent?: boolean
            locationCity?: string
            locationState?: string
            isRemote?: boolean
            description?: string
            isFromResume?: boolean
          }
          return (
            <div key={idx} className="p-3 bg-charcoal-50/50 rounded-lg border border-charcoal-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-charcoal-900">{j.jobTitle || 'Untitled'}</div>
                  <div className="text-sm text-charcoal-600 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    {j.companyName || 'Unknown company'}
                    {j.employmentType && (
                      <Badge variant="outline" className="text-xs">
                        {employmentTypeLabels[j.employmentType] || j.employmentType}
                      </Badge>
                    )}
                  </div>
                </div>
                {j.isFromResume && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                    From Resume
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {j.startDate ? formatDate(j.startDate) : '?'} - {j.isCurrent ? (
                    <Badge className="text-xs bg-success-50 text-success-700">Present</Badge>
                  ) : (j.endDate ? formatDate(j.endDate) : '?')}
                </span>
                {(j.locationCity || j.locationState || j.isRemote) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {j.isRemote ? 'Remote' : [j.locationCity, j.locationState].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
              {j.description && (
                <p className="mt-2 text-xs text-charcoal-600 line-clamp-2">{j.description}</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Education array
  if (key === 'education' && Array.isArray(value)) {
    if (value.length === 0) return <span className="text-charcoal-400 italic">No education added</span>
    const degreeLabels: Record<string, string> = {
      high_school: 'High School / GED',
      associate: "Associate's Degree",
      bachelor: "Bachelor's Degree",
      master: "Master's Degree",
      phd: 'Doctorate / PhD',
      other: 'Other Credential',
    }
    return (
      <div className="space-y-2">
        {value.map((edu, idx) => {
          const e = edu as {
            institutionName?: string
            degreeType?: string
            degreeName?: string
            fieldOfStudy?: string
            endDate?: string
            gpa?: number
            honors?: string
          }
          const degreeDisplay = e.degreeName || degreeLabels[e.degreeType || ''] || 'Degree'
          return (
            <div key={idx} className="p-3 bg-charcoal-50/50 rounded-lg border border-charcoal-100">
              <div className="font-medium text-charcoal-900">
                {degreeDisplay}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}
              </div>
              <div className="text-sm text-charcoal-600">{e.institutionName || 'Institution'}</div>
              <div className="flex items-center gap-4 mt-1">
                {e.endDate && (
                  <span className="text-xs text-charcoal-500">Graduated: {formatDate(e.endDate)}</span>
                )}
                {e.gpa && (
                  <span className="text-xs text-charcoal-500">GPA: {e.gpa}</span>
                )}
                {e.honors && (
                  <Badge variant="outline" className="text-xs bg-gold-50 text-gold-700 border-gold-200">
                    {e.honors}
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Certifications array
  if (key === 'certifications' && Array.isArray(value)) {
    if (value.length === 0) return <span className="text-charcoal-400 italic">No certifications added</span>
    return (
      <div className="space-y-2">
        {value.map((cert, idx) => {
          const c = cert as {
            name?: string
            acronym?: string
            issuingOrganization?: string
            credentialId?: string
            issueDate?: string
            expiryDate?: string
            isLifetime?: boolean
          }
          const certName = typeof cert === 'string' ? cert : c.name || 'Certification'
          const displayName = c.acronym ? `${certName} (${c.acronym})` : certName
          return (
            <div key={idx} className="flex items-center gap-3 p-2 bg-amber-50/50 rounded-lg border border-amber-100">
              <div className="p-1.5 bg-amber-100 rounded">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-charcoal-900 text-sm">{displayName}</div>
                {c.issuingOrganization && (
                  <div className="text-xs text-charcoal-500">{c.issuingOrganization}</div>
                )}
                <div className="flex items-center gap-3 mt-0.5">
                  {c.credentialId && (
                    <span className="text-xs text-charcoal-400">ID: {c.credentialId}</span>
                  )}
                  {c.isLifetime ? (
                    <Badge variant="outline" className="text-xs bg-success-50 text-success-700 border-success-200">
                      Lifetime
                    </Badge>
                  ) : c.expiryDate ? (
                    <span className="text-xs text-charcoal-400">Expires: {formatDate(c.expiryDate)}</span>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Compliance documents array
  if (key === 'complianceDocuments' && Array.isArray(value)) {
    if (value.length === 0) return <span className="text-charcoal-400 italic">No documents uploaded</span>

    const docTypeLabels: Record<string, string> = {
      rtr: 'Right to Represent (RTR)',
      nda: 'Non-Disclosure Agreement',
      references: 'Professional References',
      background_auth: 'Background Check Authorization',
      void_check: 'Voided Check / Direct Deposit',
      i9: 'I-9 Employment Eligibility',
      w4: 'W-4 Tax Withholding',
      other: 'Other Document',
    }

    const statusColors: Record<string, string> = {
      not_uploaded: 'bg-charcoal-100 text-charcoal-600',
      pending: 'bg-amber-100 text-amber-700',
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-success-100 text-success-700',
      rejected: 'bg-error-100 text-error-700',
    }

    const statusLabels: Record<string, string> = {
      not_uploaded: 'Not Uploaded',
      pending: 'Pending Review',
      submitted: 'Submitted',
      approved: 'Approved',
      rejected: 'Rejected',
    }

    return (
      <div className="space-y-2">
        {value.map((doc, idx) => {
          const d = doc as {
            type?: string
            status?: string
            fileName?: string
            fileSize?: number
            uploadedAt?: string
            notes?: string
          }
          const typeLabel = docTypeLabels[d.type || ''] || d.type?.replace(/_/g, ' ') || 'Document'
          const sizeFormatted = d.fileSize
            ? d.fileSize >= 1024 * 1024
              ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB`
              : `${(d.fileSize / 1024).toFixed(1)} KB`
            : null

          return (
            <div key={idx} className="flex items-center gap-3 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="p-1.5 bg-blue-100 rounded">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-charcoal-900 text-sm">{typeLabel}</div>
                {d.fileName && (
                  <div className="text-xs text-charcoal-500 truncate">{d.fileName}</div>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={cn('text-xs', statusColors[d.status || 'pending'])}>
                    {statusLabels[d.status || 'pending']}
                  </Badge>
                  {sizeFormatted && (
                    <span className="text-xs text-charcoal-400">{sizeFormatted}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Empty arrays
  if (Array.isArray(value) && value.length === 0) {
    return <span className="text-charcoal-400 italic">None</span>
  }

  // Formatted values lookup
  if (typeof value === 'string' && VALUE_FORMATTERS[value]) {
    return VALUE_FORMATTERS[value]
  }

  // Numbers (including rates)
  if (typeof value === 'number') {
    if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('salary')) {
      return `$${value.toLocaleString()}`
    }
    if (key === 'noticePeriodDays') {
      return `${value} days`
    }
    if (key === 'experienceYears') {
      return `${value} ${value === 1 ? 'year' : 'years'}`
    }
    if (key.toLowerCase().includes('years')) {
      return `${value} years`
    }
    if (key.toLowerCase().includes('days')) {
      return `${value} days`
    }
    return String(value)
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
    // Account Identity group
    if (['name', 'legalName', 'dba'].includes(key)) {
      groups.identity = [...(groups.identity || []), field]
    }
    // Account Contact info group
    else if (['email', 'phone', 'website', 'linkedinUrl'].includes(key) && !['firstName', 'lastName'].some(k => simpleFields.map(String).includes(k))) {
      groups.contact = [...(groups.contact || []), field]
    }
    // Account Classification group
    else if (['industries', 'companyType', 'tier', 'segment'].includes(key)) {
      groups.classification = [...(groups.classification || []), field]
    }
    // Account Billing entity group
    else if (['billingEntityName', 'billingEmail', 'billingPhone'].includes(key)) {
      groups.billingEntity = [...(groups.billingEntity || []), field]
    }
    // Account Payment config group
    else if (['paymentTermsDays', 'billingFrequency', 'invoiceFormat'].includes(key) && !['rateType'].some(k => simpleFields.map(String).includes(k))) {
      groups.paymentConfig = [...(groups.paymentConfig || []), field]
    }
    // Account PO group
    else if (['poRequired', 'currentPoNumber', 'poExpirationDate'].includes(key)) {
      groups.po = [...(groups.po || []), field]
    }
    // Default group - keeps all candidate fields together
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
                  const key = String(fieldKey)

                  // Full width for complex/multi-line fields
                  const fullWidthFields = [
                    'description',
                    'industries',
                    'professionalSummary',
                    'professionalHeadline',
                    'workHistory',
                    'education',
                    'skills',
                    'certifications',
                    'complianceDocuments',
                    'compensationNotes',
                    'relocationPreferences',
                    'internalNotes',
                    'hotlistNotes',
                    'sourceDetails',
                  ]
                  const isFullWidth = fullWidthFields.includes(key)

                  return (
                    <div
                      key={key}
                      className={cn(isFullWidth && 'col-span-2 md:col-span-3')}
                    >
                      <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                        {label}
                      </dt>
                      <dd className="text-sm text-charcoal-900">
                        {renderFieldValue(key, value)}
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
          <p className="text-sm text-charcoal-500">Review all information before submitting</p>
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
