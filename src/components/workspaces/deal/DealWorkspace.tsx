'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useDealWorkspace } from './DealWorkspaceProvider'
import { DealHeader } from './DealHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'

// Section components
import { DealSummarySection } from './sections/DealSummarySection'
import { DealPipelineSection } from './sections/DealPipelineSection'
import { DealAccountSection } from './sections/DealAccountSection'
import { DealContactsSection } from './sections/DealContactsSection'
import { DealActivitiesSection } from './sections/DealActivitiesSection'
import { DealNotesSection } from './sections/DealNotesSection'
import { DealDocumentsSection } from './sections/DealDocumentsSection'
import { DealHistorySection } from './sections/DealHistorySection'

export interface DealWorkspaceProps {
  onAction?: (action: string) => void
  onMoveStage?: () => void
  onCloseWon?: () => void
  onCloseLost?: () => void
}

type DealSection =
  | 'summary'
  | 'pipeline'
  | 'account'
  | 'contacts'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

/**
 * DealWorkspace - Main workspace component for Deal detail view
 *
 * Follows the LeadWorkspace reference implementation pattern:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Simple, readable code (no config objects)
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 */
export function DealWorkspace({
  onAction,
  onMoveStage,
  onCloseWon,
  onCloseLost,
}: DealWorkspaceProps = {}) {
  const { data, refreshData } = useDealWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as DealSection

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
    <div className="w-full max-w-none px-8 py-6 space-y-6">
      {/* Header */}
      <DealHeader deal={data.deal} accountName={data.account?.name} />

      {/* Warnings Banner */}
      {data.warnings.length > 0 && (
        <WarningsBanner
          warnings={data.warnings}
          onWarningClick={handleWarningClick}
        />
      )}

      {/* Section Content - instant switching, no loading */}
      {currentSection === 'summary' && (
        <DealSummarySection
          deal={data.deal}
          account={data.account}
          stakeholders={data.stakeholders}
          activities={data.activities}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'pipeline' && (
        <DealPipelineSection
          deal={data.deal}
          stageHistory={data.stageHistory}
          onMoveStage={onMoveStage}
          onCloseWon={onCloseWon}
          onCloseLost={onCloseLost}
        />
      )}
      {currentSection === 'account' && (
        <DealAccountSection
          account={data.account}
          lead={data.lead}
        />
      )}
      {currentSection === 'contacts' && (
        <DealContactsSection
          stakeholders={data.stakeholders}
          dealId={data.deal.id}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'activities' && (
        <DealActivitiesSection
          activities={data.activities}
          dealId={data.deal.id}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'notes' && (
        <DealNotesSection
          notes={data.notes}
          dealId={data.deal.id}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'documents' && (
        <DealDocumentsSection
          documents={data.documents}
          dealId={data.deal.id}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'history' && (
        <DealHistorySection
          history={data.history}
          stageHistory={data.stageHistory}
        />
      )}
    </div>
  )
}

export default DealWorkspace
