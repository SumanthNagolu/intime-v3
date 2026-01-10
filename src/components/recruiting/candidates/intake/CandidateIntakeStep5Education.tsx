'use client'

import React from 'react'
import { GraduationCap, AlertCircle, Info } from 'lucide-react'
import { useCreateCandidateStore } from '@/stores/create-candidate-store'
import { Section } from './shared'
import { EducationEditor } from './EducationEditor'

export function CandidateIntakeStep5Education() {
  const {
    formData,
    addEducation,
    updateEducation,
    removeEducation,
  } = useCreateCandidateStore()

  const { education } = formData

  return (
    <div className="space-y-8">
      <Section
        icon={GraduationCap}
        title="Education"
        subtitle="Add your educational background (optional but recommended)"
      >
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 mb-4">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Education is Optional
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              While not required, adding education can help match you with positions that have specific degree requirements.
            </p>
          </div>
        </div>

        {/* Info Banner for Resume-Parsed Entries */}
        {education.some(e => e.isFromResume) && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gold-50 border border-gold-200 mb-4">
            <AlertCircle className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gold-800">
                AI-Extracted Education
              </p>
              <p className="text-xs text-gold-600 mt-0.5">
                Some entries were automatically extracted from the resume. Please review and correct any inaccuracies.
              </p>
            </div>
          </div>
        )}

        <EducationEditor
          entries={education}
          onAdd={addEducation}
          onUpdate={updateEducation}
          onRemove={removeEducation}
        />
      </Section>

      {/* Tips Section */}
      <div className="p-4 rounded-xl bg-charcoal-50 border border-charcoal-100">
        <h4 className="text-sm font-semibold text-charcoal-800 mb-2">What to Include</h4>
        <ul className="text-xs text-charcoal-600 space-y-1">
          <li>• Degrees, diplomas, and professional certifications</li>
          <li>• Relevant coursework for technical positions</li>
          <li>• Academic honors or awards</li>
          <li>• High school diploma only if you don&apos;t have higher education</li>
        </ul>
      </div>
    </div>
  )
}
