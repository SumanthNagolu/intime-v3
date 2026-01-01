'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useCandidateWorkspace } from './CandidateWorkspaceProvider'
import { CandidateHeader } from './CandidateHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'

// Section components
import { CandidateSummarySection } from './sections/CandidateSummarySection'
import { CandidateScreeningSection } from './sections/CandidateScreeningSection'
import { CandidateProfilesSection } from './sections/CandidateProfilesSection'
import { CandidateSubmissionsSection } from './sections/CandidateSubmissionsSection'
// Universal tool sections
import { CandidateActivitiesSection } from './sections/CandidateActivitiesSection'
import { CandidateNotesSection } from './sections/CandidateNotesSection'
import { CandidateDocumentsSection } from './sections/CandidateDocumentsSection'
import { CandidateHistorySection } from './sections/CandidateHistorySection'

export interface CandidateWorkspaceProps {
  onAction?: (action: string) => void
}

type CandidateSection =
  | 'summary'
  | 'screening'
  | 'profiles'
  | 'submissions'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

/**
 * CandidateWorkspace - Main workspace component for Candidate detail view
 *
 * Follows the ONE database call pattern from AccountWorkspace.
 *
 * Key patterns:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Simple, readable code (no config objects)
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 */
export function CandidateWorkspace({ onAction }: CandidateWorkspaceProps = {}) {
  const { data } = useCandidateWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as CandidateSection

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
      <CandidateHeader
        candidate={data.candidate}
        stats={data.stats}
        onAction={onAction}
      />

      {/* Warnings Banner */}
      {data.warnings.length > 0 && (
        <WarningsBanner
          warnings={data.warnings}
          onWarningClick={handleWarningClick}
        />
      )}

      {/* Section Content - instant switching, no loading */}
      {currentSection === 'summary' && (
        <CandidateSummarySection
          candidate={data.candidate}
          skills={data.skills}
          submissions={data.submissions}
          stats={data.stats}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'screening' && (
        <CandidateScreeningSection
          screenings={data.screenings}
          candidateId={data.candidate.id}
        />
      )}
      {currentSection === 'profiles' && (
        <CandidateProfilesSection
          profiles={data.profiles}
          candidateId={data.candidate.id}
          candidateName={data.candidate.fullName}
        />
      )}
      {currentSection === 'submissions' && (
        <CandidateSubmissionsSection
          submissions={data.submissions}
          candidateId={data.candidate.id}
        />
      )}
      {currentSection === 'activities' && (
        <CandidateActivitiesSection
          activities={data.activities}
          candidateId={data.candidate.id}
        />
      )}
      {currentSection === 'notes' && (
        <CandidateNotesSection
          notes={data.notes}
          candidateId={data.candidate.id}
        />
      )}
      {currentSection === 'documents' && (
        <CandidateDocumentsSection
          documents={data.documents}
          candidateId={data.candidate.id}
        />
      )}
      {currentSection === 'history' && (
        <CandidateHistorySection
          history={data.history}
        />
      )}
    </div>
  )
}

export default CandidateWorkspace
