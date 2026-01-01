'use client'

import { useState } from 'react'
import { useEntityData } from '@/components/layouts/EntityContextProvider'
import { cn } from '@/lib/utils'
import type { FullSubmission } from '@/types/submission'
import { TransactionContextHeader } from './TransactionContextHeader'
import { StageProgressionBar } from './StageProgressionBar'
import {
  SummarySection,
  CandidateSection,
  JobSection,
  InterviewsSection,
  FeedbackSection,
  ActivitiesSection,
  NotesSection,
  DocumentsSection,
  HistorySection,
} from './sections'

// Section definitions
const SECTIONS = [
  { id: 'summary', label: 'Summary' },
  { id: 'candidate', label: 'Candidate' },
  { id: 'job', label: 'Job' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'feedback', label: 'Feedback' },
] as const

const TOOLS = [
  { id: 'activities', label: 'Activities' },
  { id: 'notes', label: 'Notes' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'History' },
] as const

type SectionId = typeof SECTIONS[number]['id'] | typeof TOOLS[number]['id']

interface SubmissionWorkspaceProps {
  submissionId: string
}

export function SubmissionWorkspace({ submissionId }: SubmissionWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('summary')
  const entityData = useEntityData<FullSubmission>()
  const submission = entityData?.data

  if (!submission) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-charcoal-500">Loading submission...</p>
      </div>
    )
  }

  // Section counts
  const sectionCounts: Record<string, number> = {
    interviews: submission.sections?.interviews?.total || 0,
    feedback: submission.sections?.feedback?.total || 0,
    activities: submission.sections?.activities?.total || 0,
    notes: submission.sections?.notes?.total || 0,
    documents: submission.sections?.documents?.total || 0,
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'summary':
        return <SummarySection submission={submission} />
      case 'candidate':
        return <CandidateSection submission={submission} />
      case 'job':
        return <JobSection submission={submission} />
      case 'interviews':
        return <InterviewsSection submission={submission} />
      case 'feedback':
        return <FeedbackSection submission={submission} />
      case 'activities':
        return <ActivitiesSection submission={submission} />
      case 'notes':
        return <NotesSection submission={submission} />
      case 'documents':
        return <DocumentsSection submission={submission} />
      case 'history':
        return <HistorySection submission={submission} />
      default:
        return <SummarySection submission={submission} />
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Context Header Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-charcoal-200">
        <TransactionContextHeader submission={submission} />
        {/* Stage Progression Bar */}
        <StageProgressionBar
          currentStatus={submission.status}
          statusChangedAt={submission.submitted_at || submission.created_at}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <aside className="w-56 border-r border-charcoal-200 bg-white overflow-y-auto">
          <nav className="p-4 space-y-6">
            {/* Sections */}
            <div>
              <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                Sections
              </h3>
              <ul className="space-y-1">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                        activeSection === section.id
                          ? 'bg-gold-50 text-gold-700 font-medium border-l-2 border-gold-500'
                          : 'text-charcoal-600 hover:bg-charcoal-50'
                      )}
                    >
                      {section.label}
                      {sectionCounts[section.id] !== undefined && sectionCounts[section.id] > 0 && (
                        <span className="ml-2 text-xs text-charcoal-400">
                          ({sectionCounts[section.id]})
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                Tools
              </h3>
              <ul className="space-y-1">
                {TOOLS.map((tool) => (
                  <li key={tool.id}>
                    <button
                      onClick={() => setActiveSection(tool.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                        activeSection === tool.id
                          ? 'bg-gold-50 text-gold-700 font-medium border-l-2 border-gold-500'
                          : 'text-charcoal-600 hover:bg-charcoal-50'
                      )}
                    >
                      {tool.label}
                      {sectionCounts[tool.id] !== undefined && sectionCounts[tool.id] > 0 && (
                        <span className="ml-2 text-xs text-charcoal-400">
                          ({sectionCounts[tool.id]})
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-cream p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}

