'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useCandidateWorkspace } from './CandidateWorkspaceProvider'
import { CandidateLinearHeader } from './CandidateLinearHeader'
import { CandidateDossier } from './CandidateDossier'
import { CandidateProperties } from './CandidateProperties'
import { WarningsBanner } from '@/components/ui/warnings-banner'
import { cn } from '@/lib/utils'
import { useWorkspaceShortcuts } from '@/hooks/useWorkspaceShortcuts'
import { toast } from 'sonner'

// Tool Sections
import { CandidateActivitiesSection } from './sections/CandidateActivitiesSection'
import { CandidateNotesSection } from './sections/CandidateNotesSection'
import { CandidateDocumentsSection } from './sections/CandidateDocumentsSection'
import { CandidateHistorySection } from './sections/CandidateHistorySection'

// Imports for Dialogs and Types
import type { CandidateData, CandidateResume } from '@/types/candidate-workspace'
import { GenerateResumeDialog, type InTimeResumeData } from '@/components/recruiting/resume-template'

// ============ DATA MAPPING FUNCTIONS ============
function mapCandidateToResumeTemplate(
  candidate: CandidateData,
  skills: { name: string; isPrimary?: boolean; proficiency?: string }[],
  workHistory: { title: string; company: string; startDate?: string; endDate?: string; description?: string; location?: string }[],
  education: { degree: string; institution: string; year?: string; field?: string }[],
  certifications: { name: string; issuer?: string; date?: string }[]
): InTimeResumeData {
  return {
    id: candidate.id,
    firstName: candidate.firstName || '',
    lastName: candidate.lastName || '',
    email: candidate.email || '',
    phone: candidate.phone,
    mobile: candidate.mobile,
    linkedinUrl: candidate.linkedinUrl,
    city: candidate.city,
    state: candidate.state,
    country: candidate.country,
    headline: candidate.headline || candidate.title,
    summary: candidate.professionalSummary,
    yearsExperience: candidate.yearsExperience,
    currentCompany: candidate.currentCompany,
    visaStatus: candidate.visaStatus,
    desiredRate: candidate.desiredRate,
    rateType: candidate.rateType,
    currency: candidate.rateCurrency || 'USD',
    skills: skills.map(s => ({
      name: s.name,
      isPrimary: s.isPrimary || false,
      proficiency: s.proficiency,
    })),
    workHistory: workHistory.map(w => ({
      title: w.title,
      company: w.company,
      startDate: w.startDate,
      endDate: w.endDate,
      description: w.description,
      location: w.location,
    })),
    education: education.map(e => ({
      degree: e.degree,
      institution: e.institution,
      year: e.year,
      field: e.field,
    })),
    certifications: certifications.map(c => ({
      name: c.name,
      issuer: c.issuer,
      date: c.date,
    })),
  }
}

// ============ COMPONENT ============

export interface CandidateWorkspaceProps {
  onAction?: (action: string) => void
}

type CandidateSection = 'summary' | 'activities' | 'notes' | 'documents' | 'history'

/**
 * CandidateWorkspace - "Radical Linear" Redesign
 * 
 * Layout:
 * - Header: Minimal, Sticky (CandidateLinearHeader)
 * - Main: Split View (Dossier + Properties)
 * - Style: Industrial, Precise, No Fluff
 */
export function CandidateWorkspace({ onAction }: CandidateWorkspaceProps = {}) {
  const { data } = useCandidateWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Dialog state
  const [generateResumeOpen, setGenerateResumeOpen] = React.useState(false)

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as CandidateSection

  // Handle action dispatch
  const handleAction = (action: string) => {
    if (action === 'generateResume') {
      setGenerateResumeOpen(true)
    } else if (onAction) {
      onAction(action)
    }
  }

  // Keyboard Shortcuts
  useWorkspaceShortcuts([
    {
      key: 'r',
      ctrlKey: true,
      description: 'Generate Resume',
      action: () => {
        toast.info('Generating Resume...')
        handleAction('generateResume')
      }
    },
    {
      key: 'h',
      shiftKey: true,
      description: 'Toggle Hotlist',
      action: () => {
        toast.info('Toggling Hotlist...')
        handleAction('toggleHotlist')
      }
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'Submit to Job',
      action: () => {
        handleAction('submitToJob')
      }
    },
    {
      key: 'm',
      ctrlKey: true,
      description: 'Message Candidate',
      action: () => {
        handleAction('message')
      }
    }
  ])

  // Map candidate data for resume template
  const resumeTemplateData = React.useMemo(() =>
    mapCandidateToResumeTemplate(
      data.candidate,
      data.skills,
      data.workHistory,
      data.education,
      data.certifications
    ),
    [data.candidate, data.skills, data.workHistory, data.education, data.certifications]
  )

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto z-10">
        
        {/* Minimal Header */}
        <CandidateLinearHeader 
          candidate={data.candidate} 
          onAction={handleAction}
        />

        <div className="max-w-[1400px] mx-auto">
          
          {/* Warnings Banner */}
          {data.warnings.length > 0 && (
            <div className="px-8 pt-6">
              <WarningsBanner warnings={data.warnings} />
            </div>
          )}

          {/* Linear Split Layout */}
          <div className="flex divide-x divide-charcoal-100 min-h-[calc(100vh-65px)]">
            
            {/* Center Stage: The Dossier (Main Content) */}
            <div className="flex-1 px-8 py-8 lg:px-12">
              {currentSection === 'summary' ? (
                <CandidateDossier 
                  candidate={data.candidate}
                  workHistory={data.workHistory}
                  education={data.education}
                  submissions={data.submissions}
                />
              ) : currentSection === 'activities' ? (
                <CandidateActivitiesSection activities={data.activities} candidateId={data.candidate.id} />
              ) : currentSection === 'notes' ? (
                <CandidateNotesSection notes={data.notes} candidateId={data.candidate.id} />
              ) : currentSection === 'documents' ? (
                <CandidateDocumentsSection documents={data.documents} candidateId={data.candidate.id} />
              ) : (
                <CandidateHistorySection history={data.history} />
              )}
            </div>

            {/* Right Rail: Properties (Fixed Width) */}
            <div className="w-80 flex-shrink-0 bg-charcoal-50/30 px-4 py-2 hidden lg:block">
              <div className="sticky top-24">
                <CandidateProperties 
                  candidate={data.candidate} 
                  stats={data.stats}
                  skills={data.skills}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Resume Dialog */}
      <GenerateResumeDialog
        open={generateResumeOpen}
        onOpenChange={setGenerateResumeOpen}
        candidateData={resumeTemplateData}
        candidateName={data.candidate.fullName}
      />
    </div>
  )
}

export default CandidateWorkspace
