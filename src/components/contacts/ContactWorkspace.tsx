'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Suspense, useCallback, useMemo } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Building2,
  MoreHorizontal,
  ChevronRight,
  Star,
  StarOff,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/lib/trpc/client'
import { 
  getContactSectionsBySubtype, 
  getContactSectionsByGroup,
  type ContactSubtype,
  type SectionDefinition,
} from '@/lib/navigation/entity-sections'

// ============================================================================
// TYPES
// ============================================================================

interface ContactWorkspaceProps {
  contactId: string
  /** Override the default subtype detection from the contact data */
  contextSubtype?: ContactSubtype
  /** URL path context - helps determine which sections to show */
  contextPath?: string
}

interface Contact {
  id: string
  subtype: ContactSubtype
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  mobile?: string | null
  title?: string | null
  company_name?: string | null
  linkedin_url?: string | null
  avatar_url?: string | null
  status?: string
  // Candidate fields
  candidate_status?: string | null
  candidate_skills?: string[] | null
  candidate_location?: string | null
  candidate_is_on_hotlist?: boolean
  candidate_hourly_rate?: number | null
  candidate_experience_years?: number | null
  candidate_availability?: string | null
  // Lead fields
  lead_status?: string | null
  lead_score?: number | null
  lead_bant_total_score?: number | null
  // Prospect fields
  prospect_sequence_status?: string | null
  prospect_current_sequence_step?: number | null
  // Relationships
  account?: { id: string; name: string } | null
  vendor?: { id: string; name: string } | null
  owner?: { id: string; full_name: string; avatar_url?: string } | null
}

// ============================================================================
// SUBTYPE STATUS BADGE CONFIGS
// ============================================================================

const CANDIDATE_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  passive: 'bg-blue-100 text-blue-800',
  bench: 'bg-amber-100 text-amber-800',
  placed: 'bg-gold-100 text-gold-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
  blacklisted: 'bg-red-100 text-red-800',
}

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  warm: 'bg-amber-100 text-amber-800',
  hot: 'bg-red-100 text-red-800',
  cold: 'bg-charcoal-100 text-charcoal-600',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-gold-100 text-gold-800',
  lost: 'bg-red-100 text-red-800',
  nurture: 'bg-cyan-100 text-cyan-800',
}

const SUBTYPE_LABELS: Record<ContactSubtype, string> = {
  candidate: 'Candidate',
  employee: 'Employee',
  client_poc: 'Client POC',
  vendor_poc: 'Vendor POC',
  prospect: 'Prospect',
  lead: 'Lead',
  general: 'Contact',
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

function ContactWorkspaceSidebar({
  contact,
  activeSection,
  onSectionChange,
}: {
  contact: Contact
  activeSection: string
  onSectionChange: (sectionId: string) => void
}) {
  const { mainSections, toolSections } = useMemo(
    () => getContactSectionsByGroup(contact.subtype),
    [contact.subtype]
  )

  const renderSectionItem = (section: SectionDefinition) => {
    const isActive = activeSection === section.id
    const Icon = section.icon

    return (
      <button
        key={section.id}
        onClick={() => onSectionChange(section.id)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors',
          isActive
            ? 'bg-gold-50 text-gold-700 border-l-[3px] border-gold-500'
            : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left">{section.label}</span>
        {section.showCount && (
          <span className="text-xs text-charcoal-400">0</span>
        )}
      </button>
    )
  }

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-charcoal-200 p-4">
      {/* Contact Mini Card */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
            {contact.avatar_url ? (
              <img 
                src={contact.avatar_url} 
                alt={`${contact.first_name} ${contact.last_name}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-charcoal-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-charcoal-900 truncate">
              {contact.first_name} {contact.last_name}
            </div>
            <div className="text-xs text-charcoal-500 truncate">
              {contact.title || SUBTYPE_LABELS[contact.subtype]}
            </div>
          </div>
        </div>
        <Badge className="text-xs" variant="outline">
          {SUBTYPE_LABELS[contact.subtype]}
        </Badge>
      </div>

      {/* Main Sections */}
      <div className="space-y-1 mb-6">
        {mainSections.map(renderSectionItem)}
      </div>

      {/* Tool Sections */}
      <div className="border-t border-charcoal-100 pt-4">
        <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-2 px-3">
          Tools
        </div>
        <div className="space-y-1">
          {toolSections.map(renderSectionItem)}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function ContactWorkspaceHeader({
  contact,
  onConvert,
}: {
  contact: Contact
  onConvert?: (toSubtype: ContactSubtype) => void
}) {
  const getStatusBadge = () => {
    if (contact.subtype === 'candidate' && contact.candidate_status) {
      return (
        <Badge className={cn('text-xs', CANDIDATE_STATUS_COLORS[contact.candidate_status])}>
          {contact.candidate_status}
        </Badge>
      )
    }
    if (contact.subtype === 'lead' && contact.lead_status) {
      return (
        <Badge className={cn('text-xs', LEAD_STATUS_COLORS[contact.lead_status])}>
          {contact.lead_status}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-xs">
        {contact.status || 'active'}
      </Badge>
    )
  }

  const getSubtypeMetrics = () => {
    if (contact.subtype === 'candidate') {
      return (
        <div className="flex items-center gap-6 text-sm text-charcoal-600">
          {contact.candidate_experience_years && (
            <span>{contact.candidate_experience_years} yrs exp</span>
          )}
          {contact.candidate_hourly_rate && (
            <span>${contact.candidate_hourly_rate}/hr</span>
          )}
          {contact.candidate_availability && (
            <span>{contact.candidate_availability}</span>
          )}
        </div>
      )
    }
    if (contact.subtype === 'lead') {
      return (
        <div className="flex items-center gap-6 text-sm text-charcoal-600">
          {contact.lead_score !== null && contact.lead_score !== undefined && (
            <span>Score: {contact.lead_score}</span>
          )}
          {contact.lead_bant_total_score !== null && contact.lead_bant_total_score !== undefined && (
            <span>BANT: {contact.lead_bant_total_score}/100</span>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border-b border-charcoal-200 px-6 py-4">
      <div className="flex items-start justify-between">
        {/* Left: Contact Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center">
            {contact.avatar_url ? (
              <img 
                src={contact.avatar_url} 
                alt={`${contact.first_name} ${contact.last_name}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-charcoal-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-charcoal-900">
                {contact.first_name} {contact.last_name}
              </h1>
              {getStatusBadge()}
              {contact.subtype === 'candidate' && contact.candidate_is_on_hotlist && (
                <Star className="h-5 w-5 text-gold-500 fill-gold-500" />
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-600">
              {contact.title && <span>{contact.title}</span>}
              {contact.company_name && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {contact.company_name}
                </span>
              )}
              {(contact.account?.name || contact.vendor?.name) && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {contact.account?.name || contact.vendor?.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-1 text-charcoal-600 hover:text-charcoal-900"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a 
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-1 text-charcoal-600 hover:text-charcoal-900"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {contact.phone}
                </a>
              )}
              {contact.linkedin_url && (
                <a 
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
            </div>
            {getSubtypeMetrics()}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Subtype-specific primary action */}
          {contact.subtype === 'prospect' && (
            <Button 
              onClick={() => onConvert?.('lead')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Convert to Lead
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {contact.subtype === 'candidate' && (
            <Button variant="default">
              Submit to Job
            </Button>
          )}
          {contact.subtype === 'lead' && (
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Qualify Lead
            </Button>
          )}

          {/* Hotlist toggle for candidates */}
          {contact.subtype === 'candidate' && (
            <Button variant="outline" size="icon">
              {contact.candidate_is_on_hotlist ? (
                <StarOff className="h-4 w-4" />
              ) : (
                <Star className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Contact</DropdownMenuItem>
              <DropdownMenuItem>Log Activity</DropdownMenuItem>
              <DropdownMenuItem>Send Email</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SECTION CONTENT COMPONENTS
// ============================================================================

import {
  BasicDetailsSection,
  AddressesSection,
  ContactActivitiesSection,
  ContactNotesSection,
  ContactDocumentsSection,
  HistorySection,
  SkillsSection,
  WorkHistorySection,
  EducationSection,
  CertificationsSection,
  RelationshipsSection,
  PipelineSection,
  CompanyOverviewSection,
  CompanyContactsSection,
  AgreementsSection,
  SubsidiariesSection,
  QualificationSection,
  EngagementSection,
  DealsSection,
} from './sections'

interface ExtendedContact extends Contact {
  category?: 'person' | 'company'
  // Additional fields needed by sections
  lead_bant_budget?: number | null
  lead_bant_authority?: number | null
  lead_bant_need?: number | null
  lead_bant_timeline?: number | null
  lead_qualification_notes?: string | null
  lead_budget_amount?: string | null
  lead_decision_maker?: boolean | null
  lead_pain_points?: string[] | null
  lead_timeline?: string | null
  lead_engagement_score?: number | null
  lead_email_opens?: number | null
  lead_email_clicks?: number | null
  lead_email_replies?: number | null
  lead_website_visits?: number | null
  lead_last_engagement_date?: string | null
  last_contact_date?: string | null
  prospect_total_sequence_steps?: number | null
  prospect_email_sent_count?: number | null
  prospect_email_open_count?: number | null
  prospect_email_reply_count?: number | null
  prospect_linkedin_connection_status?: string | null
  parent_company_id?: string | null
  parent_company?: { id: string; company_name?: string | null } | null
  company_type?: string | null
  company_structure?: string | null
  company_industry?: string | null
  company_size?: string | null
  company_revenue?: string | null
  company_employee_count?: number | null
  company_founded_year?: number | null
  company_description?: string | null
  company_ticker?: string | null
  company_name_legal?: string | null
  company_dba_name?: string | null
  website_url?: string | null
  created_at?: string | null
  updated_at?: string | null
}

function SectionContent({
  sectionId,
  contact,
  rawContact,
}: {
  sectionId: string
  contact: Contact
  rawContact: ExtendedContact
}) {
  const contactCategory = rawContact.category || 'person'

  // Route to the appropriate section component
  switch (sectionId) {
    // Universal sections
    case 'overview':
      if (contactCategory === 'company') {
        return <CompanyOverviewSection contact={rawContact} />
      }
      return <BasicDetailsSection contact={rawContact} />

    case 'addresses':
      return <AddressesSection contactId={contact.id} />

    case 'activities':
      return <ContactActivitiesSection contactId={contact.id} />

    case 'notes':
      return <ContactNotesSection contactId={contact.id} />

    case 'documents':
      return <ContactDocumentsSection contactId={contact.id} />

    case 'history':
      return <HistorySection contactId={contact.id} />

    // Person-specific sections
    case 'experience':
    case 'profile':
      return (
        <div className="space-y-0">
          <BasicDetailsSection contact={rawContact} />
          <SkillsSection contactId={contact.id} />
          <WorkHistorySection contactId={contact.id} />
          <EducationSection contactId={contact.id} />
          <CertificationsSection contactId={contact.id} />
        </div>
      )

    case 'skills':
      return <SkillsSection contactId={contact.id} />

    case 'workHistory':
      return <WorkHistorySection contactId={contact.id} />

    case 'education':
      return <EducationSection contactId={contact.id} />

    case 'certifications':
      return <CertificationsSection contactId={contact.id} />

    case 'relationships':
      return <RelationshipsSection contactId={contact.id} contactCategory={contactCategory} />

    case 'pipeline':
    case 'placements':
      return <PipelineSection contactId={contact.id} />

    // Company-specific sections
    case 'contacts':
      if (contactCategory === 'company') {
        return <CompanyContactsSection contactId={contact.id} />
      }
      return <RelationshipsSection contactId={contact.id} contactCategory={contactCategory} />

    case 'agreements':
      return <AgreementsSection contactId={contact.id} />

    case 'subsidiaries':
      return <SubsidiariesSection contactId={contact.id} contact={rawContact} />

    // Lead/Prospect specific sections
    case 'qualification':
      return <QualificationSection contactId={contact.id} contact={rawContact} />

    case 'engagement':
      return <EngagementSection contactId={contact.id} contact={rawContact} />

    case 'deals':
      return <DealsSection contactId={contact.id} />

    case 'campaigns':
      // Campaigns section - show campaign enrollments for prospects
      return (
        <div className="p-6">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-lg font-medium text-charcoal-900 mb-2">
              Campaign Enrollments
            </div>
            <p className="text-charcoal-500">
              Campaign enrollment management coming soon.
            </p>
          </div>
        </div>
      )

    // Account-related sections (for POCs)
    case 'account':
    case 'vendor':
      return <RelationshipsSection contactId={contact.id} contactCategory={contactCategory} />

    case 'jobs':
      // Jobs section for client POCs
      return (
        <div className="p-6">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-lg font-medium text-charcoal-900 mb-2">
              Associated Jobs
            </div>
            <p className="text-charcoal-500">
              Jobs associated with this contact will appear here.
            </p>
          </div>
        </div>
      )

    case 'consultants':
      // Consultants section for vendor POCs
      return (
        <div className="p-6">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-lg font-medium text-charcoal-900 mb-2">
              Managed Consultants
            </div>
            <p className="text-charcoal-500">
              Consultants managed by this vendor POC will appear here.
            </p>
          </div>
        </div>
      )

    case 'communications':
      // Communications history
      return <ContactActivitiesSection contactId={contact.id} />

    case 'team':
    case 'performance':
      // Employee-specific sections
      return (
        <div className="p-6">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-lg font-medium text-charcoal-900 mb-2">
              {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
            </div>
            <p className="text-charcoal-500">
              {sectionId === 'team' ? 'Team and reporting structure' : 'Performance metrics and goals'} coming soon.
            </p>
          </div>
        </div>
      )

    // Submissions (for candidates)
    case 'submissions':
      return <PipelineSection contactId={contact.id} />

    // Fallback for unknown sections
    default:
      return (
        <div className="p-6">
          <div className="bg-cream rounded-lg p-8 text-center">
            <div className="text-lg font-medium text-charcoal-900 mb-2">
              {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section
            </div>
            <p className="text-charcoal-500">
              Content for the {sectionId} section will be rendered here.
            </p>
            <p className="text-charcoal-400 text-sm mt-2">
              Contact subtype: {contact.subtype}
            </p>
          </div>
        </div>
      )
  }
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function ContactWorkspaceSkeleton() {
  return (
    <div className="flex h-full bg-cream">
      {/* Sidebar skeleton */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-charcoal-200 p-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1">
        <div className="bg-white border-b border-charcoal-200 px-6 py-4">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ContactWorkspaceContent({
  contactId,
  contextSubtype,
}: ContactWorkspaceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get the active section from URL or default to 'overview'
  const activeSection = searchParams.get('section') || 'overview'

  // Fetch contact data
  const { data: contact, isLoading, error } = trpc.unifiedContacts.getById.useQuery({ 
    id: contactId 
  })

  // Convert subtype mutation
  const convertMutation = trpc.unifiedContacts.convertSubtype.useMutation({
    onSuccess: () => {
      // Refetch contact data after conversion
      router.refresh()
    },
  })

  // Handle section change
  const handleSectionChange = useCallback((sectionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', sectionId)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  // Handle subtype conversion
  // Maps UI subtype to database subtype
  const handleConvert = useCallback((toSubtype: ContactSubtype) => {
    if (!contact) return
    // Map UI subtypes to database subtypes
    const subtypeMap: Record<ContactSubtype, string> = {
      candidate: 'person_candidate',
      employee: 'person_employee',
      client_poc: 'person_client_contact',
      vendor_poc: 'person_vendor_contact',
      prospect: 'person_prospect',
      lead: 'person_lead',
      general: 'person_general',
    }
    const dbSubtype = subtypeMap[toSubtype] || 'person_general'
    convertMutation.mutate({
      id: contactId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toSubtype: dbSubtype as any, // Server validates the actual subtype
    })
  }, [contact, contactId, convertMutation])

  // Determine effective subtype
  const effectiveSubtype = useMemo(() => {
    if (contextSubtype) return contextSubtype
    return (contact?.subtype as ContactSubtype) || 'general'
  }, [contextSubtype, contact?.subtype])

  if (isLoading) {
    return <ContactWorkspaceSkeleton />
  }

  if (error || !contact) {
    return (
      <div className="flex items-center justify-center h-full bg-cream">
        <div className="text-center">
          <h2 className="text-lg font-medium text-charcoal-900 mb-2">
            Contact not found
          </h2>
          <p className="text-charcoal-500">
            The contact you're looking for doesn't exist or you don't have access.
          </p>
        </div>
      </div>
    )
  }

  // Cast contact data to our interface
  const typedContact: Contact = {
    id: contact.id,
    subtype: effectiveSubtype,
    first_name: contact.first_name || '',
    last_name: contact.last_name || '',
    email: contact.email,
    phone: contact.phone,
    mobile: contact.mobile,
    title: contact.title,
    company_name: contact.company_name,
    linkedin_url: contact.linkedin_url,
    avatar_url: contact.avatar_url,
    status: contact.status,
    candidate_status: contact.candidate_status,
    candidate_skills: contact.candidate_skills,
    candidate_location: contact.candidate_location,
    candidate_is_on_hotlist: contact.candidate_is_on_hotlist,
    candidate_hourly_rate: contact.candidate_hourly_rate,
    candidate_experience_years: contact.candidate_experience_years,
    candidate_availability: contact.candidate_availability,
    lead_status: contact.lead_status,
    lead_score: contact.lead_score,
    lead_bant_total_score: contact.lead_bant_total_score,
    prospect_sequence_status: contact.prospect_sequence_status,
    prospect_current_sequence_step: contact.prospect_current_sequence_step,
    account: contact.account,
    vendor: contact.vendor,
    owner: contact.owner,
  }

  // Extended contact data with all fields for section components
  const extendedContact: ExtendedContact = {
    ...typedContact,
    category: contact.category as 'person' | 'company' | undefined,
    lead_bant_budget: contact.lead_bant_budget,
    lead_bant_authority: contact.lead_bant_authority,
    lead_bant_need: contact.lead_bant_need,
    lead_bant_timeline: contact.lead_bant_timeline,
    lead_qualification_notes: contact.lead_qualification_notes,
    lead_budget_amount: contact.lead_budget_amount,
    lead_decision_maker: contact.lead_decision_maker,
    lead_pain_points: contact.lead_pain_points,
    lead_timeline: contact.lead_timeline,
    lead_engagement_score: contact.lead_engagement_score,
    lead_email_opens: contact.lead_email_opens,
    lead_email_clicks: contact.lead_email_clicks,
    lead_email_replies: contact.lead_email_replies,
    lead_website_visits: contact.lead_website_visits,
    lead_last_engagement_date: contact.lead_last_engagement_date,
    last_contact_date: contact.last_contact_date,
    prospect_total_sequence_steps: contact.prospect_total_sequence_steps,
    prospect_email_sent_count: contact.prospect_email_sent_count,
    prospect_email_open_count: contact.prospect_email_open_count,
    prospect_email_reply_count: contact.prospect_email_reply_count,
    prospect_linkedin_connection_status: contact.prospect_linkedin_connection_status,
    parent_company_id: contact.parent_company_id,
    parent_company: contact.parent_company,
    company_type: contact.company_type,
    company_structure: contact.company_structure,
    company_industry: contact.company_industry,
    company_size: contact.company_size,
    company_revenue: contact.company_revenue,
    company_employee_count: contact.company_employee_count,
    company_founded_year: contact.company_founded_year,
    company_description: contact.company_description,
    company_ticker: contact.company_ticker,
    company_name_legal: contact.company_name_legal,
    company_dba_name: contact.company_dba_name,
    website_url: contact.website_url,
    created_at: contact.created_at,
    updated_at: contact.updated_at,
  }

  return (
    <div className="flex h-full bg-cream">
      {/* Sidebar */}
      <ContactWorkspaceSidebar
        contact={typedContact}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ContactWorkspaceHeader
          contact={typedContact}
          onConvert={handleConvert}
        />

        {/* Section Content */}
        <div className="flex-1 overflow-auto">
          <SectionContent
            sectionId={activeSection}
            contact={typedContact}
            rawContact={extendedContact}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Unified Contact Workspace Component
 * 
 * Renders a Guidewire-inspired workspace for any contact subtype.
 * Automatically shows relevant sections based on the contact's subtype.
 * 
 * Usage:
 * - `/contacts/:id` - Full contact workspace with all sections
 * - `/crm/campaigns/:id/prospects/:contactId` - Prospect context
 * - `/crm/leads/:id` - Lead context
 * - `/recruiting/candidates/:id` - Candidate context
 */
export function ContactWorkspace(props: ContactWorkspaceProps) {
  return (
    <Suspense fallback={<ContactWorkspaceSkeleton />}>
      <ContactWorkspaceContent {...props} />
    </Suspense>
  )
}

export default ContactWorkspace













