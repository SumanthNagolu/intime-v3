'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Briefcase,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  Check,
  X,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import type { SectionMode, ExperienceSectionData, WorkHistoryEntry, EducationEntry } from '@/lib/candidates/types'
import { EMPLOYMENT_TYPES, DEGREE_TYPES } from '@/lib/candidates/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// ============ INLINE FORM TYPES ============

interface WorkHistoryFormData {
  companyName: string
  jobTitle: string
  employmentType: string | null
  startDate: string
  endDate: string
  isCurrent: boolean
  location: string
  isRemote: boolean
  description: string
}

interface EducationFormData {
  institutionName: string
  degreeType: string | null
  degreeName: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  isCurrent: boolean
  gpa: string
  honors: string
}

const emptyWorkHistory: WorkHistoryFormData = {
  companyName: '',
  jobTitle: '',
  employmentType: 'full_time',
  startDate: '',
  endDate: '',
  isCurrent: false,
  location: '',
  isRemote: false,
  description: '',
}

const emptyEducation: EducationFormData = {
  institutionName: '',
  degreeType: null,
  degreeName: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  gpa: '',
  honors: '',
}

// ============ PROPS ============

interface ExperienceSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: ExperienceSectionData
  /** Handler to add work history entry */
  onAddWorkHistory?: (entry: Omit<WorkHistoryEntry, 'id'>) => void
  /** Handler to update work history entry */
  onUpdateWorkHistory?: (id: string, entry: Partial<WorkHistoryEntry>) => void
  /** Handler to remove work history entry */
  onRemoveWorkHistory?: (id: string) => void
  /** Handler to add education entry */
  onAddEducation?: (entry: Omit<EducationEntry, 'id'>) => void
  /** Handler to update education entry */
  onUpdateEducation?: (id: string, entry: Partial<EducationEntry>) => void
  /** Handler to remove education entry */
  onRemoveEducation?: (id: string) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * ExperienceSection - Unified component for Candidate Experience (Section 2)
 *
 * Fields:
 * - Work history: company, title, dates, description, achievements
 * - Education: institution, degree, field of study, dates
 */
export function ExperienceSection({
  mode,
  data,
  onAddWorkHistory,
  onUpdateWorkHistory,
  onRemoveWorkHistory,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: ExperienceSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // State for inline editing
  const [isAddingWork, setIsAddingWork] = React.useState(false)
  const [editingWorkId, setEditingWorkId] = React.useState<string | null>(null)
  const [workForm, setWorkForm] = React.useState<WorkHistoryFormData>(emptyWorkHistory)

  const [isAddingEducation, setIsAddingEducation] = React.useState(false)
  const [editingEducationId, setEditingEducationId] = React.useState<string | null>(null)
  const [educationForm, setEducationForm] = React.useState<EducationFormData>(emptyEducation)

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  // Work history handlers
  const handleStartAddWork = () => {
    setWorkForm(emptyWorkHistory)
    setIsAddingWork(true)
    setEditingWorkId(null)
  }

  const handleStartEditWork = (job: WorkHistoryEntry) => {
    setWorkForm({
      companyName: job.companyName || '',
      jobTitle: job.jobTitle || '',
      employmentType: job.employmentType || 'full_time',
      startDate: job.startDate || '',
      endDate: job.endDate || '',
      isCurrent: job.isCurrent,
      location: job.location || '',
      isRemote: job.isRemote,
      description: job.description || '',
    })
    setEditingWorkId(job.id)
    setIsAddingWork(false)
  }

  const handleSaveWork = () => {
    if (!workForm.companyName.trim() || !workForm.jobTitle.trim()) {
      return
    }

    const entry: Omit<WorkHistoryEntry, 'id'> = {
      companyName: workForm.companyName,
      jobTitle: workForm.jobTitle,
      employmentType: workForm.employmentType,
      startDate: workForm.startDate || null,
      endDate: workForm.isCurrent ? null : (workForm.endDate || null),
      isCurrent: workForm.isCurrent,
      location: workForm.location || null,
      isRemote: workForm.isRemote,
      description: workForm.description || null,
      achievements: [],
    }

    if (editingWorkId) {
      onUpdateWorkHistory?.(editingWorkId, entry)
      setEditingWorkId(null)
    } else {
      onAddWorkHistory?.(entry)
      setIsAddingWork(false)
    }
    setWorkForm(emptyWorkHistory)
  }

  const handleCancelWork = () => {
    setIsAddingWork(false)
    setEditingWorkId(null)
    setWorkForm(emptyWorkHistory)
  }

  // Education handlers
  const handleStartAddEducation = () => {
    setEducationForm(emptyEducation)
    setIsAddingEducation(true)
    setEditingEducationId(null)
  }

  const handleStartEditEducation = (edu: EducationEntry) => {
    setEducationForm({
      institutionName: edu.institutionName || '',
      degreeType: edu.degreeType || null,
      degreeName: edu.degreeName || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      isCurrent: edu.isCurrent,
      gpa: edu.gpa?.toString() || '',
      honors: edu.honors || '',
    })
    setEditingEducationId(edu.id)
    setIsAddingEducation(false)
  }

  const handleSaveEducation = () => {
    if (!educationForm.institutionName.trim()) {
      return
    }

    const entry: Omit<EducationEntry, 'id'> = {
      institutionName: educationForm.institutionName,
      degreeType: educationForm.degreeType,
      degreeName: educationForm.degreeName || null,
      fieldOfStudy: educationForm.fieldOfStudy || null,
      startDate: educationForm.startDate || null,
      endDate: educationForm.isCurrent ? null : (educationForm.endDate || null),
      isCurrent: educationForm.isCurrent,
      gpa: educationForm.gpa ? parseFloat(educationForm.gpa) : null,
      honors: educationForm.honors || null,
    }

    if (editingEducationId) {
      onUpdateEducation?.(editingEducationId, entry)
      setEditingEducationId(null)
    } else {
      onAddEducation?.(entry)
      setIsAddingEducation(false)
    }
    setEducationForm(emptyEducation)
  }

  const handleCancelEducation = () => {
    setIsAddingEducation(false)
    setEditingEducationId(null)
    setEducationForm(emptyEducation)
  }

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  const formatDateRange = (start: string | null, end: string | null, isCurrent: boolean) => {
    const startStr = start ? format(new Date(start), 'MMM yyyy') : ''
    const endStr = isCurrent ? 'Present' : end ? format(new Date(end), 'MMM yyyy') : ''
    return startStr && endStr ? `${startStr} - ${endStr}` : startStr || endStr || ''
  }

  const getEmploymentTypeLabel = (type: string | null) => {
    return EMPLOYMENT_TYPES.find(t => t.value === type)?.label || type || ''
  }

  const getDegreeTypeLabel = (type: string | null) => {
    return DEGREE_TYPES.find(t => t.value === type)?.label || type || ''
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Experience"
          subtitle="Work history and education"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Work History */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">Work History</CardTitle>
                <p className="text-xs text-charcoal-500">{data.workHistory.length} position{data.workHistory.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {isEditable && !isAddingWork && !editingWorkId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartAddWork}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Inline Add Form */}
          {isAddingWork && (
            <div className="mb-4 p-4 rounded-lg border-2 border-dashed border-gold-300 bg-gold-50/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-charcoal-800 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Work Experience
                </h4>
                <Button variant="ghost" size="sm" onClick={handleCancelWork}>
                  Cancel
                </Button>
              </div>
              <WorkHistoryForm
                form={workForm}
                onChange={setWorkForm}
                onSave={handleSaveWork}
                onCancel={handleCancelWork}
              />
            </div>
          )}

          {data.workHistory.length === 0 && !isAddingWork ? (
            <div className="text-center py-8 text-charcoal-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No work history added yet</p>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartAddWork}
                  className="mt-3 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Work Experience
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {data.workHistory.map((job, index) => (
                <div key={job.id}>
                  {editingWorkId === job.id ? (
                    // Inline Edit Form
                    <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-charcoal-800 flex items-center gap-2">
                          <Pencil className="w-4 h-4" />
                          Edit Work Experience
                        </h4>
                        <Button variant="ghost" size="sm" onClick={handleCancelWork}>
                          Cancel
                        </Button>
                      </div>
                      <WorkHistoryForm
                        form={workForm}
                        onChange={setWorkForm}
                        onSave={handleSaveWork}
                        onCancel={handleCancelWork}
                        isEdit
                      />
                    </div>
                  ) : (
                    // Display Mode
                    <div
                      className={cn(
                        'p-4 rounded-lg border border-charcoal-100 bg-charcoal-50/50',
                        index === 0 && 'border-blue-200 bg-blue-50/30'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-charcoal-900">{job.jobTitle || 'Untitled Position'}</h4>
                            {job.isCurrent && (
                              <Badge variant="success" className="text-xs">Current</Badge>
                            )}
                            {job.employmentType && (
                              <Badge variant="outline" className="text-xs">
                                {getEmploymentTypeLabel(job.employmentType)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-charcoal-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {job.companyName || 'Company not specified'}
                            </span>
                            {(job.location || job.isRemote) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.isRemote ? 'Remote' : job.location}
                              </span>
                            )}
                            {(job.startDate || job.endDate || job.isCurrent) && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateRange(job.startDate, job.endDate, job.isCurrent)}
                              </span>
                            )}
                          </div>
                          {job.description && (
                            <p className="text-sm text-charcoal-600 mt-2">{job.description}</p>
                          )}
                          {job.achievements.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {job.achievements.map((achievement, i) => (
                                <li key={i} className="text-sm text-charcoal-600 flex items-start gap-2">
                                  <span className="text-gold-500 mt-1">•</span>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {isEditable && (
                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEditWork(job)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveWorkHistory?.(job.id)}
                              className="h-8 w-8 p-0 text-error-600 hover:text-error-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">Education</CardTitle>
                <p className="text-xs text-charcoal-500">{data.education.length} degree{data.education.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {isEditable && !isAddingEducation && !editingEducationId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartAddEducation}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Inline Add Form */}
          {isAddingEducation && (
            <div className="mb-4 p-4 rounded-lg border-2 border-dashed border-gold-300 bg-gold-50/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-charcoal-800 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Education
                </h4>
                <Button variant="ghost" size="sm" onClick={handleCancelEducation}>
                  Cancel
                </Button>
              </div>
              <EducationForm
                form={educationForm}
                onChange={setEducationForm}
                onSave={handleSaveEducation}
                onCancel={handleCancelEducation}
              />
            </div>
          )}

          {data.education.length === 0 && !isAddingEducation ? (
            <div className="text-center py-8 text-charcoal-400">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No education added yet</p>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartAddEducation}
                  className="mt-3 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  {editingEducationId === edu.id ? (
                    // Inline Edit Form
                    <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-charcoal-800 flex items-center gap-2">
                          <Pencil className="w-4 h-4" />
                          Edit Education
                        </h4>
                        <Button variant="ghost" size="sm" onClick={handleCancelEducation}>
                          Cancel
                        </Button>
                      </div>
                      <EducationForm
                        form={educationForm}
                        onChange={setEducationForm}
                        onSave={handleSaveEducation}
                        onCancel={handleCancelEducation}
                        isEdit
                      />
                    </div>
                  ) : (
                    // Display Mode
                    <div className="p-4 rounded-lg border border-charcoal-100 bg-charcoal-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-charcoal-900">
                              {edu.degreeType ? getDegreeTypeLabel(edu.degreeType) : edu.degreeName || 'Degree not specified'}
                              {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                            </h4>
                            {edu.isCurrent && (
                              <Badge variant="success" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-charcoal-600">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {edu.institutionName || 'Institution not specified'}
                            </span>
                            {(edu.startDate || edu.endDate || edu.isCurrent) && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}
                              </span>
                            )}
                            {edu.gpa && (
                              <span className="text-charcoal-500">GPA: {edu.gpa}</span>
                            )}
                            {edu.honors && (
                              <Badge variant="outline" className="text-xs">{edu.honors}</Badge>
                            )}
                          </div>
                        </div>
                        {isEditable && (
                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEditEducation(edu)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveEducation?.(edu.id)}
                              className="h-8 w-8 p-0 text-error-600 hover:text-error-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============ INLINE FORM COMPONENTS ============

interface WorkHistoryFormProps {
  form: WorkHistoryFormData
  onChange: (form: WorkHistoryFormData) => void
  onSave: () => void
  onCancel: () => void
  isEdit?: boolean
}

function WorkHistoryForm({ form, onChange, onSave, onCancel, isEdit }: WorkHistoryFormProps) {
  const isValid = form.companyName.trim() && form.jobTitle.trim()

  return (
    <div className="space-y-4">
      {/* Row 1: Company & Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.companyName}
            onChange={(e) => onChange({ ...form, companyName: e.target.value })}
            placeholder="Acme Corporation"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">
            Job Title <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.jobTitle}
            onChange={(e) => onChange({ ...form, jobTitle: e.target.value })}
            placeholder="Software Engineer"
            className="h-10"
          />
        </div>
      </div>

      {/* Row 2: Employment Type & Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Employment Type</Label>
          <Select
            value={form.employmentType || ''}
            onValueChange={(value) => onChange({ ...form, employmentType: value })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Start Date</Label>
          <Input
            type="month"
            value={form.startDate}
            onChange={(e) => onChange({ ...form, startDate: e.target.value })}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">End Date</Label>
          <Input
            type="month"
            value={form.endDate}
            onChange={(e) => onChange({ ...form, endDate: e.target.value })}
            disabled={form.isCurrent}
            className="h-10"
          />
        </div>
      </div>

      {/* Row 3: Current & Remote */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={form.isCurrent}
            onCheckedChange={(checked) => onChange({
              ...form,
              isCurrent: !!checked,
              endDate: checked ? '' : form.endDate
            })}
          />
          <span className="text-sm text-charcoal-700">I currently work here</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={form.isRemote}
            onCheckedChange={(checked) => onChange({ ...form, isRemote: !!checked })}
          />
          <span className="text-sm text-charcoal-700">Remote position</span>
        </label>
      </div>

      {/* Row 4: Location */}
      <div className="space-y-2">
        <Label className="text-xs text-charcoal-600">Location</Label>
        <Input
          value={form.location}
          onChange={(e) => onChange({ ...form, location: e.target.value })}
          placeholder="San Francisco, CA"
          className="h-10"
        />
      </div>

      {/* Row 5: Description */}
      <div className="space-y-2">
        <Label className="text-xs text-charcoal-600">Description (Optional)</Label>
        <Textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Brief description of responsibilities..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="gap-1.5"
        >
          <Check className="w-4 h-4" />
          {isEdit ? 'Save Changes' : 'Add Experience'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

interface EducationFormProps {
  form: EducationFormData
  onChange: (form: EducationFormData) => void
  onSave: () => void
  onCancel: () => void
  isEdit?: boolean
}

function EducationForm({ form, onChange, onSave, onCancel, isEdit }: EducationFormProps) {
  const isValid = form.institutionName.trim()

  return (
    <div className="space-y-4">
      {/* Row 1: Institution */}
      <div className="space-y-2">
        <Label className="text-xs text-charcoal-600">
          Institution Name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={form.institutionName}
          onChange={(e) => onChange({ ...form, institutionName: e.target.value })}
          placeholder="University of California, Berkeley"
          className="h-10"
        />
      </div>

      {/* Row 2: Degree Type & Field of Study */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Degree Type</Label>
          <Select
            value={form.degreeType || ''}
            onValueChange={(value) => onChange({ ...form, degreeType: value })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select degree type" />
            </SelectTrigger>
            <SelectContent>
              {DEGREE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Field of Study</Label>
          <Input
            value={form.fieldOfStudy}
            onChange={(e) => onChange({ ...form, fieldOfStudy: e.target.value })}
            placeholder="e.g., Computer Science"
            className="h-10"
          />
        </div>
      </div>

      {/* Row 3: Degree Name */}
      <div className="space-y-2">
        <Label className="text-xs text-charcoal-600">Degree Name (Optional)</Label>
        <Input
          value={form.degreeName}
          onChange={(e) => onChange({ ...form, degreeName: e.target.value })}
          placeholder="e.g., Bachelor of Science"
          className="h-10"
        />
      </div>

      {/* Row 4: Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Start Date</Label>
          <Input
            type="month"
            value={form.startDate}
            onChange={(e) => onChange({ ...form, startDate: e.target.value })}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">End Date / Expected</Label>
          <Input
            type="month"
            value={form.endDate}
            onChange={(e) => onChange({ ...form, endDate: e.target.value })}
            disabled={form.isCurrent}
            className="h-10"
          />
        </div>
      </div>

      {/* Row 5: Currently Enrolled */}
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={form.isCurrent}
          onCheckedChange={(checked) => onChange({
            ...form,
            isCurrent: !!checked,
            endDate: checked ? '' : form.endDate
          })}
        />
        <span className="text-sm text-charcoal-700">Currently enrolled</span>
      </label>

      {/* Row 6: GPA & Honors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">GPA (Optional)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={form.gpa}
            onChange={(e) => onChange({ ...form, gpa: e.target.value })}
            placeholder="e.g., 3.75"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Honors / Awards (Optional)</Label>
          <Input
            value={form.honors}
            onChange={(e) => onChange({ ...form, honors: e.target.value })}
            placeholder="e.g., Magna Cum Laude, Dean's List"
            className="h-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="gap-1.5"
        >
          <Check className="w-4 h-4" />
          {isEdit ? 'Save Changes' : 'Add Education'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default ExperienceSection
