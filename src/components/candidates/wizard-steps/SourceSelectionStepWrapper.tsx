'use client'

import * as React from 'react'
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOURCE_TYPES, useCreateCandidateStore } from '@/stores/create-candidate-store'
import { ResumeUploadParser } from '@/components/recruiting/ResumeUploadParser'
import { CsvImportDialog } from '@/components/recruiting/candidates/CsvImportDialog'
import type { ParsedResumeData } from '@/lib/services/resume-parser'
import type { CreateCandidateFormData } from '@/stores/create-candidate-store'
import type { WizardStepComponentProps } from '@/configs/entities/types'

// Radio option card for source selection
function RadioOptionCard({
  selected,
  onClick,
  icon,
  label,
  description,
  disabled = false,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-full p-5 rounded-xl border-2 text-left transition-all duration-300',
        selected
          ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
          : 'border-charcoal-200 bg-white hover:border-charcoal-300 hover:bg-charcoal-50/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
          selected ? 'bg-gold-100' : 'bg-charcoal-100'
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-semibold',
              selected ? 'text-gold-800' : 'text-charcoal-800'
            )}>
              {label}
            </span>
            {disabled && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal-200 text-charcoal-500">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-sm text-charcoal-500 mt-1">{description}</p>
        </div>
        {selected && (
          <CheckCircle2 className="w-6 h-6 text-gold-500 flex-shrink-0" />
        )}
      </div>
    </button>
  )
}

/**
 * SourceSelectionStepWrapper - Step 1 of candidate wizard
 *
 * Options:
 * - Manual Entry: Continue to next step with blank form
 * - Upload Resume: Parse resume with AI and auto-populate form
 * - Import CSV: Bulk import candidates from CSV file
 */
export function SourceSelectionStepWrapper({
  formData,
  setFormData,
}: WizardStepComponentProps<CreateCandidateFormData>) {
  const { setResumeFile, populateFromResume } = useCreateCandidateStore()
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false)

  const sourceIcons: Record<string, React.ReactNode> = {
    manual: <span className="text-2xl">✏️</span>,
    resume: <Upload className="w-6 h-6 text-gold-600" />,
    csv: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
  }

  // Handle source type selection
  const handleSourceSelect = (value: string) => {
    if (value === 'csv') {
      // Open CSV import dialog
      setCsvDialogOpen(true)
    } else {
      setFormData?.({ sourceType: value as 'manual' | 'resume' | 'csv' })
    }
  }

  // Handle resume parsed - use comprehensive populateFromResume method
  const handleResumeParsed = (data: ParsedResumeData, file: File) => {
    // Store the file and parsed data for upload during submission
    setResumeFile(file, data)

    // Set file metadata
    setFormData?.({
      resumeFileName: file.name,
      resumeFileSize: file.size,
    })

    // Use the comprehensive populateFromResume method to map all fields
    // This handles: basic info, work history, education, certifications, skills,
    // work authorization, availability, compensation, and more
    populateFromResume(data)
  }

  // Handle resume error - just reset parsed flag
  const handleResumeError = () => {
    setFormData?.({ resumeParsed: false })
    setResumeFile(null, null)
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-charcoal-100 flex items-center justify-center">
          <Upload className="w-6 h-6 text-charcoal-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">Source</h3>
          <p className="text-sm text-charcoal-500">How are you adding this candidate?</p>
        </div>
      </div>

      {/* Source Options */}
      <div className="space-y-4">
        {SOURCE_TYPES.map((type) => (
          <RadioOptionCard
            key={type.value}
            selected={formData?.sourceType === type.value}
            onClick={() => handleSourceSelect(type.value)}
            icon={sourceIcons[type.value]}
            label={type.label}
            description={type.description}
            disabled={'disabled' in type ? Boolean(type.disabled) : false}
          />
        ))}
      </div>

      {/* Resume Upload Section - shown when resume is selected */}
      {formData?.sourceType === 'resume' && (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-charcoal-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-charcoal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal-900">Upload Resume</h3>
              <p className="text-sm text-charcoal-500">Upload a PDF resume to automatically extract candidate information</p>
            </div>
          </div>

          <ResumeUploadParser
            onParsed={handleResumeParsed}
            onError={handleResumeError}
            disabled={formData?.resumeParsed}
          />
        </div>
      )}

      {/* CSV Import Dialog */}
      <CsvImportDialog
        open={csvDialogOpen}
        onOpenChange={setCsvDialogOpen}
      />
    </div>
  )
}
