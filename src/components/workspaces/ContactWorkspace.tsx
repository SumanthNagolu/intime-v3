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
import { ContactSubmissionsSection } from './contact/sections/ContactSubmissionsSection'
import { ContactCampaignsSection } from './contact/sections/ContactCampaignsSection'
import { ContactActivitiesSection } from './contact/sections/ContactActivitiesSection'
import { ContactNotesSection } from './contact/sections/ContactNotesSection'
import { ContactDocumentsSection } from './contact/sections/ContactDocumentsSection'
import { ContactHistorySection } from './contact/sections/ContactHistorySection'

export interface ContactWorkspaceProps {
  onAction?: (action: string) => void
}

type ContactSection =
  | 'summary'
  | 'accounts'
  | 'submissions'
  | 'pipeline'
  | 'campaigns'
  | 'qualification'
  | 'deals'
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
export function ContactWorkspace({ onAction }: ContactWorkspaceProps = {}) {
  const { data } = useContactWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'accounts' && (
        <ContactAccountsSection
          accounts={data.accounts}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'submissions' && (
        <ContactSubmissionsSection
          submissions={data.submissions}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'pipeline' && (
        <ContactSubmissionsSection
          submissions={data.submissions}
          contactId={data.contact.id}
        />
      )}
      {currentSection === 'campaigns' && (
        <ContactCampaignsSection
          campaigns={data.campaigns}
          contactId={data.contact.id}
        />
      )}
      {/* TODO: Add qualification and deals sections for leads */}
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
    </div>
  )
}

export default ContactWorkspace
