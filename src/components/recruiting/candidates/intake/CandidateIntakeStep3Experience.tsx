'use client'

import * as React from 'react'
import {
  Briefcase,
  Building2,
  Monitor,
  FileText,
  AlertCircle,
  Upload,
  X,
  CheckCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  useCreateCandidateStore,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner, SectionDivider } from './shared'
import { WorkHistoryEditor } from './WorkHistoryEditor'
import { cn } from '@/lib/utils'

export function CandidateIntakeStep3Experience() {
  const {
    formData,
    setFormData,
    resumeFile,
    setResumeFile,
    addWorkHistory,
    updateWorkHistory,
    removeWorkHistory,
    reorderWorkHistory,
  } = useCreateCandidateStore()

  const { workHistory } = formData

  const toggleEmploymentType = (type: typeof formData.employmentTypes[number]) => {
    const current = formData.employmentTypes || []
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    setFormData({ employmentTypes: updated })
  }

  const toggleWorkMode = (mode: typeof formData.workModes[number]) => {
    const current = formData.workModes || []
    const updated = current.includes(mode)
      ? current.filter(m => m !== mode)
      : [...current, mode]
    setFormData({ workModes: updated })
  }

  // Build validation items
  const validationItems: string[] = []
  if (formData.experienceYears === undefined || formData.experienceYears < 0) {
    validationItems.push('Enter years of experience')
  }
  if (!formData.employmentTypes || formData.employmentTypes.length === 0) {
    validationItems.push('Select at least one employment type')
  }
  if (workHistory.length === 0) {
    validationItems.push('Add at least one work experience entry')
  }

  // Check for incomplete work history entries
  workHistory.forEach((entry, index) => {
    if (!entry.companyName.trim()) {
      validationItems.push(`Work history ${index + 1}: Company name is required`)
    }
    if (!entry.jobTitle.trim()) {
      validationItems.push(`Work history ${index + 1}: Job title is required`)
    }
    if (!entry.startDate) {
      validationItems.push(`Work history ${index + 1}: Start date is required`)
    }
    if (!entry.isCurrent && !entry.endDate) {
      validationItems.push(`Work history ${index + 1}: End date is required (or mark as current)`)
    }
  })

  return (
    <div className="space-y-8">
      {/* Professional Profile Section */}
      <Section
        icon={Briefcase}
        title="Professional Profile"
        subtitle="Add professional details and experience summary"
      >
        <div className="space-y-2">
          <Label htmlFor="professionalHeadline" className="text-charcoal-700 font-medium">
            Professional Headline
          </Label>
          <Input
            id="professionalHeadline"
            value={formData.professionalHeadline || ''}
            onChange={(e) => setFormData({ professionalHeadline: e.target.value })}
            placeholder="e.g., Senior Software Engineer | Full Stack Developer"
            className="h-12 rounded-xl border-charcoal-200 bg-white"
            maxLength={200}
          />
          <p className="text-xs text-charcoal-500">A brief title summarizing their expertise</p>
        </div>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="experienceYears" className="text-charcoal-700 font-medium">
              Years of Experience <span className="text-gold-500">*</span>
            </Label>
            <Input
              id="experienceYears"
              type="number"
              min={0}
              max={50}
              value={formData.experienceYears}
              onChange={(e) => setFormData({ experienceYears: parseInt(e.target.value) || 0 })}
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
          <div />
        </FieldGroup>

        <div className="space-y-2">
          <Label htmlFor="professionalSummary" className="text-charcoal-700 font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-charcoal-400" />
            Professional Summary
          </Label>
          <Textarea
            id="professionalSummary"
            value={formData.professionalSummary || ''}
            onChange={(e) => setFormData({ professionalSummary: e.target.value })}
            placeholder="Brief overview of experience, expertise, and career highlights..."
            className="min-h-[100px] rounded-xl border-charcoal-200 bg-white resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-charcoal-500">{formData.professionalSummary?.length || 0}/2000 characters</p>
        </div>
      </Section>

      {/* Employment Preferences */}
      <Section
        icon={Building2}
        title="Employment Preferences"
        subtitle="What types of employment is the candidate open to?"
      >
        <div className="space-y-4">
          <Label className="text-charcoal-700 font-medium">
            Employment Types <span className="text-gold-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {EMPLOYMENT_TYPES.map((type) => (
              <div
                key={type.value}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.employmentTypes?.includes(type.value as typeof formData.employmentTypes[number])
                    ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50'
                    : 'border-charcoal-200 bg-white hover:border-charcoal-300'
                }`}
                onClick={() => toggleEmploymentType(type.value as typeof formData.employmentTypes[number])}
              >
                <Checkbox
                  checked={formData.employmentTypes?.includes(type.value as typeof formData.employmentTypes[number]) || false}
                  onCheckedChange={() => toggleEmploymentType(type.value as typeof formData.employmentTypes[number])}
                  className="data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
                />
                <Label className="cursor-pointer text-sm font-medium text-charcoal-700">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <Label className="text-charcoal-700 font-medium">Work Modes</Label>
          <div className="grid grid-cols-3 gap-3">
            {WORK_MODES.map((mode) => (
              <div
                key={mode.value}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.workModes?.includes(mode.value as typeof formData.workModes[number])
                    ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50'
                    : 'border-charcoal-200 bg-white hover:border-charcoal-300'
                }`}
                onClick={() => toggleWorkMode(mode.value as typeof formData.workModes[number])}
              >
                <Checkbox
                  checked={formData.workModes?.includes(mode.value as typeof formData.workModes[number]) || false}
                  onCheckedChange={() => toggleWorkMode(mode.value as typeof formData.workModes[number])}
                  className="data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
                />
                <Label className="cursor-pointer text-sm font-medium text-charcoal-700">
                  {mode.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <SectionDivider label="Work History" />

      {/* Work History Section */}
      <Section
        icon={Briefcase}
        title="Work History"
        subtitle="Add employment history, starting with the most recent position"
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

      {/* Resume Attachment - only show for manual entry */}
      {formData.sourceType === 'manual' && (
        <ResumeAttachment
          file={resumeFile}
          onFileSelect={(file) => setResumeFile(file, null)}
          onRemove={() => setResumeFile(null, null)}
        />
      )}

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}

// Resume attachment component (for manual entry - no AI parsing)
function ResumeAttachment({
  file,
  onFileSelect,
  onRemove,
}: {
  file: File | null
  onFileSelect: (file: File) => void
  onRemove: () => void
}) {
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const validExtensions = ['.pdf', '.doc', '.docx']
    const hasValidExtension = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))

    if (!validTypes.includes(selectedFile.type) && !hasValidExtension) {
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      return
    }

    onFileSelect(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
    e.target.value = ''
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (file) {
    return (
      <Section
        icon={FileText}
        title="Resume"
        subtitle="Attached resume file"
      >
        <div className="rounded-lg border border-success-200 bg-success-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="font-medium text-success-800">{file.name}</p>
                <p className="text-sm text-success-600">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-charcoal-500 hover:text-error-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section
      icon={FileText}
      title="Resume"
      subtitle="Attach the candidate's resume (optional)"
    >
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer py-8',
          isDragging
            ? 'border-gold-500 bg-gold-50'
            : 'border-charcoal-200 bg-cream hover:border-gold-400 hover:bg-gold-50/30'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
              isDragging ? 'bg-gold-100' : 'bg-charcoal-100'
            )}
          >
            <Upload className={cn('h-6 w-6', isDragging ? 'text-gold-600' : 'text-charcoal-500')} />
          </div>

          <div>
            <p className="text-sm font-medium text-hublot-900">
              {isDragging ? 'Drop your file here' : 'Attach resume'}
            </p>
            <p className="mt-1 text-xs text-charcoal-500">
              Drag and drop or{' '}
              <span className="font-medium text-gold-600">browse</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-charcoal-400">
            <Badge variant="outline" className="text-xs">
              PDF, DOC, DOCX
            </Badge>
            <span>•</span>
            <span>Max 10MB</span>
          </div>
        </div>
      </div>
    </Section>
  )
}
