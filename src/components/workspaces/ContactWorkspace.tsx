'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useContactWorkspace } from './contact/ContactWorkspaceProvider'
import { ContactHeader } from './contact/ContactHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'

// Section components
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

// Dialogs
import { CreateContactMeetingDialog } from './contact/CreateContactMeetingDialog'
import { CreateRelatedContactDialog } from './contact/CreateRelatedContactDialog'
import { LinkRelatedContactDialog } from './contact/LinkRelatedContactDialog'
import { CreateContactEscalationDialog } from './contact/CreateContactEscalationDialog'

export interface ContactWorkspaceProps {
  onAction?: (action: string) => void
}

type ContactSection =
  | 'summary'
  | 'accounts'
  | 'jobs'
  | 'placements'
  | 'submissions'
  | 'addresses'
  | 'meetings'
  | 'escalations'
  | 'related_contacts'
  | 'campaigns'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

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

  return (
    <div className="w-full max-w-none px-8 py-6 space-y-6">
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
      {currentSection === 'summary' && (
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
        <ContactAddressesSection
          addresses={data.addresses}
          contactId={data.contact.id}
        />
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
