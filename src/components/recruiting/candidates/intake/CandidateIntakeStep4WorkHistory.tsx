'use client'

import React from 'react'
import { Briefcase, AlertCircle } from 'lucide-react'
import { useCreateCandidateStore } from '@/stores/create-candidate-store'
import { Section, ValidationBanner } from './shared'
import { WorkHistoryEditor } from './WorkHistoryEditor'

export function CandidateIntakeStep4WorkHistory() {
  const {
    formData,
    addWorkHistory,
    updateWorkHistory,
    removeWorkHistory,
    reorderWorkHistory,
  } = useCreateCandidateStore()

  const { workHistory } = formData

  // Validation items
  const validationItems: string[] = []
  if (workHistory.length === 0) {
    validationItems.push('Add at least one work experience entry')
  }

  // Check for incomplete entries
  workHistory.forEach((entry, index) => {
    if (!entry.companyName.trim()) {
      validationItems.push(`Entry ${index + 1}: Company name is required`)
    }
    if (!entry.jobTitle.trim()) {
      validationItems.push(`Entry ${index + 1}: Job title is required`)
    }
    if (!entry.startDate) {
      validationItems.push(`Entry ${index + 1}: Start date is required`)
    }
    if (!entry.isCurrent && !entry.endDate) {
      validationItems.push(`Entry ${index + 1}: End date is required (or mark as current)`)
    }
  })

  return (
    <div className="space-y-8">
      <Section
        icon={Briefcase}
        title="Work History"
        subtitle="Add your employment history, starting with the most recent position"
      >
        {/* Info Banner for Resume-Parsed Entries */}
        {workHistory.some(e => e.isFromResume) && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gold-50 border border-gold-200 mb-4">
            <AlertCircle className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gold-800">
                AI-Extracted Work History
              </p>
              <p className="text-xs text-gold-600 mt-0.5">
                Some entries were automatically extracted from the resume. Please review and correct any inaccuracies.
              </p>
            </div>
          </div>
        )}

        <WorkHistoryEditor
          entries={workHistory}
          onAdd={addWorkHistory}
          onUpdate={updateWorkHistory}
          onRemove={removeWorkHistory}
          onReorder={reorderWorkHistory}
        />
      </Section>

      {/* Tips Section */}
      <div className="p-4 rounded-xl bg-charcoal-50 border border-charcoal-100">
        <h4 className="text-sm font-semibold text-charcoal-800 mb-2">Tips for a Strong Work History</h4>
        <ul className="text-xs text-charcoal-600 space-y-1">
          <li>• List positions in reverse chronological order (most recent first)</li>
          <li>• Include specific achievements with measurable results when possible</li>
          <li>• Use action verbs to describe responsibilities and accomplishments</li>
          <li>• Be accurate with dates - employers may verify employment history</li>
        </ul>
      </div>

      <ValidationBanner items={validationItems} />
    </div>
  )
}
