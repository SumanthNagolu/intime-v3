'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useLeadWorkspace } from './LeadWorkspaceProvider'
import { LeadHeader } from './LeadHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'

// Section components
import { LeadSummarySection } from './sections/LeadSummarySection'
import { LeadContactSection } from './sections/LeadContactSection'
import { LeadEngagementSection } from './sections/LeadEngagementSection'
import { LeadDealSection } from './sections/LeadDealSection'
import { LeadActivitiesSection } from './sections/LeadActivitiesSection'
import { LeadNotesSection } from './sections/LeadNotesSection'
import { LeadDocumentsSection } from './sections/LeadDocumentsSection'
import { LeadHistorySection } from './sections/LeadHistorySection'

export interface LeadWorkspaceProps {
  onAction?: (action: string) => void
  onQualify?: () => void
  onConvert?: () => void
  onCreateDeal?: () => void
}

type LeadSection =
  | 'summary'
  | 'contact'
  | 'engagement'
  | 'deal'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

/**
 * LeadWorkspace - Main workspace component for Lead detail view
 *
 * Follows the AccountWorkspace reference implementation pattern:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Simple, readable code (no config objects)
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 */
export function LeadWorkspace({
  onAction,
  onQualify,
  onConvert,
  onCreateDeal,
}: LeadWorkspaceProps = {}) {
  const { data } = useLeadWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as LeadSection

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
      <LeadHeader lead={data.lead} />

      {/* Warnings Banner */}
      {data.warnings.length > 0 && (
        <WarningsBanner
          warnings={data.warnings}
          onWarningClick={handleWarningClick}
        />
      )}

      {/* Section Content - instant switching, no loading */}
      {currentSection === 'summary' && (
        <LeadSummarySection
          lead={data.lead}
          contact={data.contact}
          activities={data.activities}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'contact' && (
        <LeadContactSection
          contact={data.contact}
          leadId={data.lead.id}
        />
      )}
      {currentSection === 'engagement' && (
        <LeadEngagementSection
          engagement={data.engagement}
          leadId={data.lead.id}
        />
      )}
      {currentSection === 'deal' && (
        <LeadDealSection
          deal={data.deal}
          lead={data.lead}
          onCreateDeal={onCreateDeal || (() => {})}
        />
      )}
      {currentSection === 'activities' && (
        <LeadActivitiesSection
          activities={data.activities}
          leadId={data.lead.id}
        />
      )}
      {currentSection === 'notes' && (
        <LeadNotesSection
          notes={data.notes}
          leadId={data.lead.id}
        />
      )}
      {currentSection === 'documents' && (
        <LeadDocumentsSection
          documents={data.documents}
          leadId={data.lead.id}
        />
      )}
      {currentSection === 'history' && (
        <LeadHistorySection
          history={data.history}
        />
      )}
    </div>
  )
}

export default LeadWorkspace
