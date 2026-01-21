'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useContactWorkspace } from './contact/ContactWorkspaceProvider'
import { ContactHeader } from './contact/ContactHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'
import { useToast } from '@/components/ui/use-toast'

// Existing section components
import { ContactOverviewSection } from './contact/sections/ContactOverviewSection'
import { ContactSummarySection } from './contact/sections/ContactSummarySection'
import { ContactAccountsSection } from './contact/sections/ContactAccountsSection'
import { ContactJobsSection } from './contact/sections/ContactJobsSection'
import { ContactPlacementsSection } from './contact/sections/ContactPlacementsSection'
import { ContactSubmissionsSection } from './contact/sections/ContactSubmissionsSection'
import { ContactAddressesSection } from './contact/sections/ContactAddressesSection'
import { ContactMeetingsSection } from './contact/sections/ContactMeetingsSection'
import { ContactRelatedContactsSection } from './contact/sections/ContactRelatedContactsSection'
import { ContactEscalationsSection } from './contact/sections/ContactEscalationsSection'
import { ContactCampaignsSection } from './contact/sections/ContactCampaignsSection'
import { ContactActivitiesSection } from './contact/sections/ContactActivitiesSection'
import { ContactNotesSection } from './contact/sections/ContactNotesSection'
import { ContactDocumentsSection } from './contact/sections/ContactDocumentsSection'
import { ContactHistorySection } from './contact/sections/ContactHistorySection'

// Unified section components
import {
  BasicInfoSection,
  EmploymentSection,
  CommunicationSection,
  SocialSection,
  CandidateSection,
  LeadSection,
  AddressesSection,
} from '@/components/contacts/sections'

// Section hooks
import {
  useBasicInfoSection,
  useEmploymentSection,
  useCommunicationSection,
  useSocialSection,
  useCandidateSection,
  useLeadSection,
  useAddressesSection,
} from '@/components/contacts/hooks'

// Data mappers
import {
  mapToBasicInfoData,
  mapToEmploymentData,
  mapToCommunicationData,
  mapToSocialData,
  mapToCandidateData,
  mapToLeadData,
  mapToAddressesData,
} from '@/lib/contacts/mappers'

// Dialogs
import { CreateContactMeetingDialog } from './contact/CreateContactMeetingDialog'
import { CreateRelatedContactDialog } from './contact/CreateRelatedContactDialog'
import { LinkRelatedContactDialog } from './contact/LinkRelatedContactDialog'
import { CreateContactEscalationDialog } from './contact/CreateContactEscalationDialog'

export interface ContactWorkspaceProps {
  onAction?: (action: string) => void
}

// Person-specific sections
type PersonContactSection =
  | 'summary'
  | 'profile'
  | 'basic'        // Unified Basic Info section
  | 'employment'   // Unified Employment section
  | 'social'       // Unified Social section
  | 'communication' // Unified Communication section
  | 'candidate'    // Unified Candidate section
  | 'lead'         // Unified Lead section
  | 'skills'
  | 'preferences'
  | 'accounts'
  | 'submissions'
  | 'placements'
  | 'meetings'

// Company-specific sections
type CompanyContactSection =
  | 'summary'
  | 'profile'
  | 'basic'        // Unified Basic Info section
  | 'classification'
  | 'locations'
  | 'communication' // Unified Communication section
  | 'people'
  | 'hierarchy'
  | 'jobs'
  | 'placements'
  | 'contracts'

// Universal sections for all contacts
type UniversalContactSection =
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

// Legacy sections (for backward compatibility)
type LegacyContactSection =
  | 'addresses'
  | 'escalations'
  | 'related_contacts'
  | 'campaigns'

type ContactSection =
  | PersonContactSection
  | CompanyContactSection
  | UniversalContactSection
  | LegacyContactSection

/**
 * ContactWorkspace - Main workspace component for Contact detail view
 *
 * This follows the GW-020 pattern established for AccountWorkspace.
 *
 * Key patterns:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Simple, readable code (no config objects)
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 */
export function ContactWorkspace({ onAction: _onAction }: ContactWorkspaceProps = {}) {
  const { data } = useContactWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Dialog state
  const [scheduleMeetingDialogOpen, setScheduleMeetingDialogOpen] = React.useState(false)
  const [createRelatedContactDialogOpen, setCreateRelatedContactDialogOpen] = React.useState(false)
  const [linkRelatedContactDialogOpen, setLinkRelatedContactDialogOpen] = React.useState(false)
  const [createEscalationDialogOpen, setCreateEscalationDialogOpen] = React.useState(false)

  // Refresh data callback for dialogs
  const { refreshData } = useContactWorkspace()

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as ContactSection

  // Handle section change - update URL for deep linking
  const handleSectionChange = React.useCallback((section: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', section)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Handle warning click - navigate to relevant section/field
  const handleWarningClick = React.useCallback((warning: WorkspaceWarning) => {
    if (warning.section) {
      handleSectionChange(warning.section)
    }
    // TODO: Focus on specific field if warning.field is set
  }, [handleSectionChange])

  // Listen for openContactDialog custom events
  React.useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string; contactId: string; companyId?: string; companyName?: string }>) => {
      // Only handle events for this contact
      if (event.detail.contactId !== data.contact.id) return

      switch (event.detail.dialogId) {
        case 'scheduleMeeting':
          setScheduleMeetingDialogOpen(true)
          break
        case 'createRelatedContact':
          setCreateRelatedContactDialogOpen(true)
          break
        case 'linkRelatedContact':
          setLinkRelatedContactDialogOpen(true)
          break
        case 'createEscalation':
          setCreateEscalationDialogOpen(true)
          break
      }
    }

    window.addEventListener('openContactDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openContactDialog', handleOpenDialog as EventListener)
    }
  }, [data.contact.id])

  // Determine if person or company contact
  const isPerson = data.contact.category === 'person'

  return (
    <div className="w-full max-w-none px-8 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <ContactHeader contact={data.contact} />

      {/* Warnings Banner */}
      {data.warnings.length > 0 && (
        <WarningsBanner
          warnings={data.warnings}
          onWarningClick={handleWarningClick}
        />
      )}

      {/* Section Content - instant switching, no loading */}
      {/* Overview/Summary Section - uses new category-aware component */}
      {currentSection === 'summary' && (
        <ContactOverviewSection
          contact={data.contact}
          accounts={data.accounts}
          activities={data.activities}
          submissions={data.submissions}
          placements={data.placements}
          jobs={data.jobs}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Profile Section - shows personal or company profile based on category */}
      {currentSection === 'profile' && (
        <ContactSummarySection
          contact={data.contact}
          accounts={data.accounts}
          activities={data.activities}
          submissions={data.submissions}
          placements={data.placements}
          jobs={data.jobs}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Unified Basic Info Section */}
      {currentSection === 'basic' && (
        <ContactBasicInfoSectionWrapper />
      )}

      {/* Unified Employment Section (person only) */}
      {currentSection === 'employment' && isPerson && (
        <ContactEmploymentSectionWrapper />
      )}

      {/* Unified Social Profiles Section (person only) */}
      {currentSection === 'social' && isPerson && (
        <ContactSocialSectionWrapper />
      )}

      {/* Unified Communication Section */}
      {currentSection === 'communication' && (
        <ContactCommunicationSectionWrapper />
      )}

      {/* Unified Candidate Section (for candidates) */}
      {currentSection === 'candidate' && isPerson && (
        <ContactCandidateSectionWrapper />
      )}

      {/* Unified Lead Section (for leads) */}
      {currentSection === 'lead' && (
        <ContactLeadSectionWrapper />
      )}

      {/* Person-specific: Skills Section */}
      {currentSection === 'skills' && isPerson && (
        <ContactSummarySection
          contact={data.contact}
          accounts={data.accounts}
          activities={data.activities}
          submissions={data.submissions}
          placements={data.placements}
          jobs={data.jobs}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Person-specific: Preferences Section */}
      {currentSection === 'preferences' && isPerson && (
        <ContactCommunicationSectionWrapper />
      )}

      {/* Company-specific: Classification Section */}
      {currentSection === 'classification' && !isPerson && (
        <ContactSummarySection
          contact={data.contact}
          accounts={data.accounts}
          activities={data.activities}
          submissions={data.submissions}
          placements={data.placements}
          jobs={data.jobs}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Company-specific: Locations Section (maps to addresses) */}
      {currentSection === 'locations' && !isPerson && (
        <ContactAddressesSectionWrapper />
      )}

      {/* Company-specific: Key People Section */}
      {currentSection === 'people' && !isPerson && (
        <ContactRelatedContactsSection
          relatedContacts={data.relatedContacts}
          contactId={data.contact.id}
          companyId={data.contact.company?.id ?? null}
          companyName={data.contact.company?.name ?? null}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Company-specific: Corporate Hierarchy Section */}
      {currentSection === 'hierarchy' && !isPerson && (
        <ContactRelatedContactsSection
          relatedContacts={data.relatedContacts}
          contactId={data.contact.id}
          companyId={data.contact.company?.id ?? null}
          companyName={data.contact.company?.name ?? null}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Company-specific: Contracts Section */}
      {currentSection === 'contracts' && !isPerson && (
        <ContactDocumentsSection
          documents={data.documents}
          contactId={data.contact.id}
        />
      )}

      {/* Shared: Accounts Section (Person contacts) */}
      {currentSection === 'accounts' && (
        <ContactAccountsSection
          accounts={data.accounts}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'jobs' && (
        <ContactJobsSection
          jobs={data.jobs}
          contactId={data.contact.id}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'placements' && (
        <ContactPlacementsSection
          placements={data.placements}
          contactId={data.contact.id}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'submissions' && (
        <ContactSubmissionsSection
          submissions={data.submissions}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'addresses' && (
        <ContactAddressesSectionWrapper />
      )}
      {currentSection === 'meetings' && (
        <ContactMeetingsSection
          meetings={data.meetings}
          contactId={data.contact.id}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'related_contacts' && (
        <ContactRelatedContactsSection
          relatedContacts={data.relatedContacts}
          contactId={data.contact.id}
          companyId={data.contact.company?.id ?? null}
          companyName={data.contact.company?.name ?? null}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'escalations' && (
        <ContactEscalationsSection
          escalations={data.escalations}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'campaigns' && (
        <ContactCampaignsSection
          campaigns={data.campaigns}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'activities' && (
        <ContactActivitiesSection
          activities={data.activities}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'notes' && (
        <ContactNotesSection
          notes={data.notes}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'documents' && (
        <ContactDocumentsSection
          documents={data.documents}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'history' && (
        <ContactHistorySection
          history={data.history}
        />
      )}

      {/* Dialogs */}
      <CreateContactMeetingDialog
        open={scheduleMeetingDialogOpen}
        onOpenChange={setScheduleMeetingDialogOpen}
        contactId={data.contact.id}
        contactName={data.contact.fullName}
        accountId={data.contact.company?.id ?? null}
        accountName={data.contact.company?.name ?? null}
        onSuccess={refreshData}
      />
      {data.contact.company && (
        <CreateRelatedContactDialog
          open={createRelatedContactDialogOpen}
          onOpenChange={setCreateRelatedContactDialogOpen}
          companyId={data.contact.company.id}
          companyName={data.contact.company.name}
          onSuccess={refreshData}
        />
      )}
      {/* Link Related Contact Dialog - links contacts to contacts, not to companies */}
      <LinkRelatedContactDialog
        open={linkRelatedContactDialogOpen}
        onOpenChange={setLinkRelatedContactDialogOpen}
        contactId={data.contact.id}
        contactName={data.contact.fullName}
        onSuccess={refreshData}
      />
      {/* Create Escalation Dialog */}
      <CreateContactEscalationDialog
        open={createEscalationDialogOpen}
        onOpenChange={setCreateEscalationDialogOpen}
        contactId={data.contact.id}
        contactName={data.contact.fullName}
        onSuccess={refreshData}
      />
    </div>
  )
}

export default ContactWorkspace

// ============ UNIFIED SECTION WRAPPERS ============
// These wrappers bridge workspace context data to the unified section components

function ContactBasicInfoSectionWrapper() {
  const { data, refreshData } = useContactWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToBasicInfoData(data.contact as unknown as Record<string, unknown>),
    [data.contact]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Contact information updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useBasicInfoSection({
    contactId: data.contact.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <BasicInfoSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onToggleType={section.handleToggleType}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ContactEmploymentSectionWrapper() {
  const { data, refreshData } = useContactWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToEmploymentData(data.contact as unknown as Record<string, unknown>),
    [data.contact]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Employment information updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useEmploymentSection({
    contactId: data.contact.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <EmploymentSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ContactCommunicationSectionWrapper() {
  const { data, refreshData } = useContactWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToCommunicationData(data.contact as unknown as Record<string, unknown>),
    [data.contact]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Communication preferences updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useCommunicationSection({
    contactId: data.contact.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <CommunicationSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ContactSocialSectionWrapper() {
  const { data, refreshData } = useContactWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToSocialData(data.contact as unknown as Record<string, unknown>),
    [data.contact]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Social profiles updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useSocialSection({
    contactId: data.contact.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <SocialSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ContactCandidateSectionWrapper() {
  const { data, refreshData } = useContactWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToCandidateData(data.contact as unknown as Record<string, unknown>),
    [data.contact]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Candidate information updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useCandidateSection({
    contactId: data.contact.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <CandidateSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ContactLeadSectionWrapper() {
  const { data, refreshData } = useContactWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToLeadData(data.contact as unknown as Record<string, unknown>),
    [data.contact]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Lead information updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useLeadSection({
    contactId: data.contact.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <LeadSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ContactAddressesSectionWrapper() {
  const { data, refreshData } = useContactWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(() => {
    const contactWithAddresses = {
      ...data.contact,
      addresses: data.addresses,
    }
    return mapToAddressesData(contactWithAddresses as unknown as Record<string, unknown>)
  }, [data.contact, data.addresses])

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Addresses updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useAddressesSection({
    contactId: data.contact.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <AddressesSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onAddAddress={section.handleAddAddress}
      onRemoveAddress={section.handleRemoveAddress}
      onSetPrimary={section.handleSetPrimary}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}
