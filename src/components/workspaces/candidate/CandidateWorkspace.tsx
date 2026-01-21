'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useCandidateWorkspace } from './CandidateWorkspaceProvider'
import { CandidateHeader } from './CandidateHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'

// Unified section components (match wizard steps 1-6)
import {
  IdentitySection,
  ExperienceSection,
  SkillsSection,
  AuthorizationSection,
  CompensationSection,
  ResumeSection,
} from '@/components/candidates/sections'
import type {
  IdentitySectionData,
  ExperienceSectionData,
  SkillsSectionData,
  AuthorizationSectionData,
  CompensationSectionData,
  ResumeSectionData,
} from '@/lib/candidates/types'

// Overview section
import { CandidateSummarySection } from './sections/CandidateSummarySection'
// Related data sections
import { CandidateSubmissionsSection } from './sections/CandidateSubmissionsSection'
import { CandidatePlacementsSection } from './sections/CandidatePlacementsSection'
import { CandidateInterviewsSection } from './sections/CandidateInterviewsSection'
import { CandidateScreeningSection } from './sections/CandidateScreeningSection'
import { CandidateProfilesSection } from './sections/CandidateProfilesSection'
// Universal tool sections
import { CandidateActivitiesSection } from './sections/CandidateActivitiesSection'
import { CandidateNotesSection } from './sections/CandidateNotesSection'
import { CandidateDocumentsSection } from './sections/CandidateDocumentsSection'
import { CandidateHistorySection } from './sections/CandidateHistorySection'
import { DEFAULT_PHONE } from '@/lib/candidates/types'
import type { CandidateData, CandidateResume } from '@/types/candidate-workspace'

// ============ DATA MAPPING FUNCTIONS ============

/**
 * Map CandidateData to IdentitySectionData
 */
function mapCandidateToIdentity(candidate: CandidateData): IdentitySectionData {
  return {
    firstName: candidate.firstName || '',
    lastName: candidate.lastName || '',
    email: candidate.email || '',
    phone: candidate.phone ? { countryCode: 'US', number: candidate.phone } : DEFAULT_PHONE,
    mobile: candidate.mobile ? { countryCode: 'US', number: candidate.mobile } : null,
    linkedinUrl: candidate.linkedinUrl || '',
    city: candidate.city || '',
    state: candidate.state || '',
    country: candidate.country || 'United States',
    title: candidate.title || '',
    headline: candidate.headline || '',
    professionalSummary: candidate.professionalSummary || '',
    currentCompany: candidate.currentCompany || '',
    yearsExperience: candidate.yearsExperience,
  }
}

/**
 * Map CandidateData to AuthorizationSectionData
 */
function mapCandidateToAuthorization(candidate: CandidateData): AuthorizationSectionData {
  return {
    workAuthorization: candidate.workAuthorization,
    visaStatus: candidate.visaStatus,
    visaExpiryDate: candidate.visaExpiryDate,
    requiresSponsorship: candidate.requiresSponsorship ?? false,
    currentSponsor: candidate.currentSponsor,
    isTransferable: candidate.isTransferable ?? false,
    clearanceLevel: candidate.clearanceLevel,
    availability: candidate.availability,
    availableFrom: candidate.availableFrom,
    noticePeriod: candidate.noticePeriod,
    noticePeriodDays: candidate.noticePeriodDays,
    willingToRelocate: candidate.willingToRelocate,
    relocationPreferences: candidate.relocationPreferences,
    isRemoteOk: candidate.isRemoteOk,
  }
}

/**
 * Map CandidateData to CompensationSectionData
 */
function mapCandidateToCompensation(candidate: CandidateData): CompensationSectionData {
  return {
    rateType: candidate.rateType,
    desiredRate: candidate.desiredRate,
    minimumRate: candidate.minimumRate,
    desiredSalary: candidate.desiredSalary,
    rateCurrency: candidate.rateCurrency || 'USD',
    isNegotiable: candidate.isNegotiable ?? true,
    compensationNotes: candidate.compensationNotes,
    employmentTypes: candidate.employmentTypes || ['full_time'],
    workModes: candidate.workModes || ['on_site'],
  }
}

/**
 * Map CandidateData and resumes to ResumeSectionData
 */
function mapCandidateToResume(candidate: CandidateData, resumes: CandidateResume[]): ResumeSectionData {
  return {
    resumes: resumes.map(r => ({
      id: r.id,
      version: r.version,
      isLatest: r.isLatest,
      filePath: r.filePath,
      fileName: r.fileName,
      fileSize: r.fileSize,
      mimeType: r.mimeType,
      fileUrl: r.fileUrl,
      label: r.label,
      targetRole: r.targetRole,
      source: r.source,
      notes: r.notes,
      isPrimary: r.isPrimary,
      resumeType: r.resumeType,
      uploadedAt: r.uploadedAt,
    })),
    source: candidate.source,
    sourceDetails: candidate.sourceDetails,
    referredBy: candidate.referredBy,
    campaignId: candidate.campaignId,
    status: candidate.status,
    candidateStatus: candidate.candidateStatus,
    isOnHotlist: candidate.isOnHotlist,
    hotlistAddedAt: candidate.hotlistAddedAt,
    hotlistNotes: candidate.hotlistNotes,
    tags: candidate.tags || [],
    internalNotes: candidate.internalNotes,
  }
}

// ============ COMPONENT ============

export interface CandidateWorkspaceProps {
  onAction?: (action: string) => void
}

// Section type matches entity-sections.ts candidateSections
type CandidateSection =
  // Overview
  | 'summary'
  // Main numbered sections (match wizard steps 1-6)
  | 'identity'
  | 'experience'
  | 'skills'
  | 'authorization'
  | 'compensation'
  | 'resume'
  // Related data
  | 'submissions'
  | 'placements'
  | 'interviews'
  | 'screening'
  | 'profiles'
  // Tools
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
    <div className="w-full max-w-none px-8 py-6 space-y-6">
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

      {/* Overview */}
      {currentSection === 'summary' && (
        <CandidateSummarySection
          candidate={data.candidate}
          skills={data.skills}
          workHistory={data.workHistory}
          education={data.education}
          certifications={data.certifications}
          submissions={data.submissions}
          stats={data.stats}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Main Sections (1-6) - Unified components with mode='view' */}
      {currentSection === 'identity' && (
        <IdentitySection
          mode="view"
          data={mapCandidateToIdentity(data.candidate)}
        />
      )}
      {currentSection === 'experience' && (
        <ExperienceSection
          mode="view"
          data={{
            workHistory: data.workHistory,
            education: data.education,
          }}
        />
      )}
      {currentSection === 'skills' && (
        <SkillsSection
          mode="view"
          data={{
            skills: data.skills,
            certifications: data.certifications,
          }}
        />
      )}
      {currentSection === 'authorization' && (
        <AuthorizationSection
          mode="view"
          data={mapCandidateToAuthorization(data.candidate)}
        />
      )}
      {currentSection === 'compensation' && (
        <CompensationSection
          mode="view"
          data={mapCandidateToCompensation(data.candidate)}
        />
      )}
      {currentSection === 'resume' && (
        <ResumeSection
          mode="view"
          data={mapCandidateToResume(data.candidate, data.resumes)}
        />
      )}

      {/* Related Data Sections */}
      {currentSection === 'submissions' && (
        <CandidateSubmissionsSection
          submissions={data.submissions}
          candidateId={data.candidate.id}
        />
      )}
      {currentSection === 'placements' && (
        <CandidatePlacementsSection
          placements={data.placements}
          candidateId={data.candidate.id}
        />
      )}
      {currentSection === 'interviews' && (
        <CandidateInterviewsSection
          interviews={data.interviews}
          candidateId={data.candidate.id}
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

      {/* Tool Sections */}
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
