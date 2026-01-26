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
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { LocationPicker } from '@/components/addresses/LocationPicker'
import type { SectionMode, ExperienceSectionData, WorkHistoryEntry, EducationEntry } from '@/lib/candidates/types'
import { EMPLOYMENT_TYPES, DEGREE_TYPES } from '@/lib/candidates/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { trpc } from '@/lib/trpc/client'

// ============ INLINE FORM TYPES ============

interface WorkHistoryFormData {
  companyName: string
  jobTitle: string
  employmentType: string | null
  startDate: string
  endDate: string
  isCurrent: boolean
  // Location broken into components
  locationCity: string
  locationState: string
  locationCountry: string
  isRemote: boolean
  // Content fields
  description: string
  responsibilities: string[] // Roles & responsibilities bullets
  achievements: string[] // Key achievements bullets
  toolsUsed: string[] // Tools/technologies used
  notes: string // Internal notes (user entered only)
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
  // Location
  locationCity: string
  locationState: string
  locationCountry: string
  // Internal notes
  notes: string
}

const emptyWorkHistory: WorkHistoryFormData = {
  companyName: '',
  jobTitle: '',
  employmentType: 'full_time',
  startDate: '',
  endDate: '',
  isCurrent: false,
  locationCity: '',
  locationState: '',
  locationCountry: 'US',
  isRemote: false,
  description: '',
  responsibilities: [],
  achievements: [],
  toolsUsed: [],
  notes: '',
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
  locationCity: '',
  locationState: '',
  locationCountry: 'US',
  notes: '',
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

  // State for expanded detail views
  const [expandedWorkId, setExpandedWorkId] = React.useState<string | null>(null)
  const [expandedEducationId, setExpandedEducationId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  // Work history handlers
  const handleStartAddWork = () => {
    setWorkForm(emptyWorkHistory)
    setIsAddingWork(true)
    setEditingWorkId(null)
    setExpandedWorkId(null) // Close any expanded view
  }

  const handleStartEditWork = (job: WorkHistoryEntry) => {
    // Parse location string into components if needed
    const jobAny = job as any
    let city = jobAny.locationCity || ''
    let state = jobAny.locationState || ''
    let country = jobAny.locationCountry || 'US'

    // If location is a combined string, try to parse it
    if (!city && job.location) {
      const parts = job.location.split(',').map(p => p.trim())
      if (parts.length >= 2) {
        city = parts[0]
        state = parts[1]
      } else if (parts.length === 1) {
        city = parts[0]
      }
    }

    setWorkForm({
      companyName: job.companyName || '',
      jobTitle: job.jobTitle || '',
      employmentType: job.employmentType || 'full_time',
      startDate: job.startDate || '',
      endDate: job.endDate || '',
      isCurrent: job.isCurrent,
      locationCity: city,
      locationState: state,
      locationCountry: country,
      isRemote: job.isRemote,
      description: job.description || '',
      responsibilities: jobAny.responsibilities || [],
      achievements: job.achievements || [],
      toolsUsed: jobAny.toolsUsed || [],
      notes: jobAny.notes || '',
    })
    setEditingWorkId(job.id)
    setIsAddingWork(false)
    setExpandedWorkId(null) // Close any expanded view when editing
  }

  const handleSaveWork = () => {
    if (!workForm.companyName.trim() || !workForm.jobTitle.trim()) {
      return
    }

    // Combine location components
    const locationParts = [workForm.locationCity, workForm.locationState].filter(Boolean)
    const location = locationParts.length > 0 ? locationParts.join(', ') : null

    const entry: Omit<WorkHistoryEntry, 'id'> & {
      notes?: string
      responsibilities?: string[]
      toolsUsed?: string[]
      locationCity?: string
      locationState?: string
      locationCountry?: string
    } = {
      companyName: workForm.companyName,
      jobTitle: workForm.jobTitle,
      employmentType: workForm.employmentType,
      startDate: workForm.startDate || null,
      endDate: workForm.isCurrent ? null : (workForm.endDate || null),
      isCurrent: workForm.isCurrent,
      location: location,
      locationCity: workForm.locationCity || undefined,
      locationState: workForm.locationState || undefined,
      locationCountry: workForm.locationCountry || undefined,
      isRemote: workForm.isRemote,
      description: workForm.description || null,
      responsibilities: workForm.responsibilities,
      achievements: workForm.achievements,
      toolsUsed: workForm.toolsUsed,
      notes: workForm.notes || undefined,
    }

    if (editingWorkId) {
      onUpdateWorkHistory?.(editingWorkId, entry as any)
      setEditingWorkId(null)
    } else {
      onAddWorkHistory?.(entry as any)
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
    setExpandedEducationId(null) // Close any expanded view
  }

  const handleStartEditEducation = (edu: EducationEntry) => {
    const eduAny = edu as any
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
      locationCity: eduAny.locationCity || '',
      locationState: eduAny.locationState || '',
      locationCountry: eduAny.locationCountry || 'US',
      notes: eduAny.notes || '',
    })
    setEditingEducationId(edu.id)
    setIsAddingEducation(false)
    setExpandedEducationId(null) // Close any expanded view when editing
  }

  const handleSaveEducation = () => {
    if (!educationForm.institutionName.trim()) {
      return
    }

    // Combine location components for display
    const locationParts = [educationForm.locationCity, educationForm.locationState].filter(Boolean)
    const location = locationParts.length > 0 ? locationParts.join(', ') : null

    const entry: Omit<EducationEntry, 'id'> & {
      location?: string | null
      locationCity?: string
      locationState?: string
      locationCountry?: string
      notes?: string
    } = {
      institutionName: educationForm.institutionName,
      degreeType: educationForm.degreeType,
      degreeName: educationForm.degreeName || null,
      fieldOfStudy: educationForm.fieldOfStudy || null,
      startDate: educationForm.startDate || null,
      endDate: educationForm.isCurrent ? null : (educationForm.endDate || null),
      isCurrent: educationForm.isCurrent,
      gpa: educationForm.gpa ? parseFloat(educationForm.gpa) : null,
      honors: educationForm.honors || null,
      location: location,
      locationCity: educationForm.locationCity || undefined,
      locationState: educationForm.locationState || undefined,
      locationCountry: educationForm.locationCountry || undefined,
      notes: educationForm.notes || undefined,
    }

    if (editingEducationId) {
      onUpdateEducation?.(editingEducationId, entry as any)
      setEditingEducationId(null)
    } else {
      onAddEducation?.(entry as any)
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
      <Card className="relative overflow-hidden border-charcoal-200/60 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-charcoal-300 via-charcoal-400 to-charcoal-300" />
        <CardHeader className="pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center border border-charcoal-200/60 shadow-sm">
                <Briefcase className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading font-semibold text-charcoal-900 tracking-tight">Work History</CardTitle>
                <p className="text-xs text-charcoal-500 mt-0.5">{data.workHistory.length} position{data.workHistory.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {isEditable && !isAddingWork && !editingWorkId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartAddWork}
                className="gap-1.5 border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Inline Add Form */}
          {isAddingWork && (
            <div className="mb-5 p-5 rounded-xl border-2 border-dashed border-gold-300/70 bg-gradient-to-br from-gold-50/40 to-amber-50/30 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-charcoal-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gold-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gold-600" />
                  </div>
                  Add Work Experience
                </h4>
                <Button variant="ghost" size="sm" onClick={handleCancelWork} className="text-charcoal-500 hover:text-charcoal-700">
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
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center border border-charcoal-200/60">
                <Briefcase className="w-7 h-7 text-charcoal-400" />
              </div>
              <h4 className="text-sm font-medium text-charcoal-600 mb-1">No work history added</h4>
              <p className="text-xs text-charcoal-400 mb-4">Add professional experience to build the candidate profile</p>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartAddWork}
                  className="gap-1.5 border-charcoal-200 hover:border-gold-300 hover:bg-gold-50/50 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Work Experience
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {data.workHistory.map((job, index) => (
                <div key={job.id} className="animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  {editingWorkId === job.id ? (
                    // Inline Edit Form
                    <div className="p-5 rounded-xl border-2 border-charcoal-300 bg-gradient-to-br from-charcoal-50 to-white shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="font-semibold text-charcoal-800 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-charcoal-100 flex items-center justify-center">
                            <Pencil className="w-4 h-4 text-charcoal-600" />
                          </div>
                          Edit Work Experience
                        </h4>
                        <Button variant="ghost" size="sm" onClick={handleCancelWork} className="text-charcoal-500 hover:text-charcoal-700">
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
                    // Display Mode - Compact view with expandable details
                    <div
                      className={cn(
                        'group relative rounded-xl border transition-all duration-200',
                        index === 0
                          ? 'border-l-[3px] border-l-charcoal-800 border-t-charcoal-200/60 border-r-charcoal-200/60 border-b-charcoal-200/60 bg-gradient-to-r from-charcoal-50/80 to-white'
                          : 'border-charcoal-200/60 bg-white hover:bg-charcoal-50/30',
                        expandedWorkId === job.id && 'shadow-md'
                      )}
                    >
                      {/* Compact Header - Always Visible */}
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer"
                        onClick={() => setExpandedWorkId(expandedWorkId === job.id ? null : job.id)}
                      >
                        {/* Company Icon */}
                        <div className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200',
                          index === 0
                            ? 'bg-charcoal-900 text-white'
                            : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-charcoal-200'
                        )}>
                          <Building2 className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Title Row */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-charcoal-900 text-[15px]">{job.jobTitle || 'Untitled Position'}</h4>
                            {job.isCurrent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Current
                              </span>
                            )}
                            {job.employmentType && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-charcoal-100 text-charcoal-600 border border-charcoal-200/60">
                                {getEmploymentTypeLabel(job.employmentType)}
                              </span>
                            )}
                          </div>

                          {/* Meta Row */}
                          <div className="flex items-center gap-3 text-sm text-charcoal-500 flex-wrap">
                            <span className="flex items-center gap-1.5 font-medium text-charcoal-600">
                              {job.companyName || 'Company not specified'}
                            </span>
                            {(job.location || (job as any).locationCity || job.isRemote) && (
                              <>
                                <span className="text-charcoal-300">•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                                  {(() => {
                                    const loc = job.location || [(job as any).locationCity, (job as any).locationState].filter(Boolean).join(', ')
                                    if (job.isRemote && loc) return `${loc} (Remote)`
                                    if (job.isRemote) return 'Remote'
                                    return loc
                                  })()}
                                </span>
                              </>
                            )}
                            {(job.startDate || job.endDate || job.isCurrent) && (
                              <>
                                <span className="text-charcoal-300">•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                                  {formatDateRange(job.startDate, job.endDate, job.isCurrent)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expand/Collapse Icon & Actions */}
                        <div className="flex items-center gap-1">
                          {/* Actions - Show on hover */}
                          {isEditable && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartEditWork(job)
                                }}
                                className="h-8 w-8 p-0 text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onRemoveWorkHistory?.(job.id)
                                }}
                                className="h-8 w-8 p-0 text-charcoal-400 hover:text-error-600 hover:bg-error-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {/* Expand Icon */}
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                            expandedWorkId === job.id ? 'bg-charcoal-100' : 'hover:bg-charcoal-100'
                          )}>
                            {expandedWorkId === job.id ? (
                              <ChevronDown className="w-4 h-4 text-charcoal-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-charcoal-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details Section */}
                      {expandedWorkId === job.id && (
                        <div className="px-4 pb-4 pt-0 border-t border-charcoal-100 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="pt-4 pl-[60px] space-y-4">
                            {/* Description */}
                            {job.description && (
                              <div>
                                <p className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Description</p>
                                <p className="text-sm text-charcoal-600 leading-relaxed">{job.description}</p>
                              </div>
                            )}

                            {/* Responsibilities */}
                            {(job as any).responsibilities?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Responsibilities</p>
                                <ul className="space-y-1">
                                  {(job as any).responsibilities.map((resp: string, i: number) => (
                                    <li key={i} className="text-sm text-charcoal-600 flex items-start gap-2">
                                      <span className="w-1 h-1 rounded-full bg-charcoal-400 mt-2 flex-shrink-0" />
                                      <span className="leading-relaxed">{resp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Achievements */}
                            {job.achievements?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Achievements</p>
                                <ul className="space-y-1.5">
                                  {job.achievements.map((achievement, i) => (
                                    <li key={i} className="text-sm text-charcoal-600 flex items-start gap-2.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2 flex-shrink-0" />
                                      <span className="leading-relaxed">{achievement}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Tools & Technologies */}
                            {(job as any).toolsUsed?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Tools & Technologies</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {(job as any).toolsUsed.map((tool: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-charcoal-100 text-charcoal-600 border border-charcoal-200/60">
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Internal Notes */}
                            {(job as any).notes && (
                              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60">
                                <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3" />
                                  Internal Notes
                                </p>
                                <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-relaxed">{(job as any).notes}</p>
                              </div>
                            )}

                            {/* Empty state when expanded but no extra details */}
                            {!job.description && !(job as any).responsibilities?.length && !job.achievements?.length && !(job as any).toolsUsed?.length && !(job as any).notes && (
                              <p className="text-sm text-charcoal-400 italic">No additional details available</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="relative overflow-hidden border-charcoal-200/60 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300" />
        <CardHeader className="pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center border border-purple-200/60 shadow-sm">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading font-semibold text-charcoal-900 tracking-tight">Education</CardTitle>
                <p className="text-xs text-charcoal-500 mt-0.5">{data.education.length} degree{data.education.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {isEditable && !isAddingEducation && !editingEducationId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartAddEducation}
                className="gap-1.5 border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Inline Add Form */}
          {isAddingEducation && (
            <div className="mb-5 p-5 rounded-xl border-2 border-dashed border-purple-300/70 bg-gradient-to-br from-purple-50/40 to-violet-50/30 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-charcoal-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-purple-600" />
                  </div>
                  Add Education
                </h4>
                <Button variant="ghost" size="sm" onClick={handleCancelEducation} className="text-charcoal-500 hover:text-charcoal-700">
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
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center border border-purple-200/60">
                <GraduationCap className="w-7 h-7 text-purple-400" />
              </div>
              <h4 className="text-sm font-medium text-charcoal-600 mb-1">No education added</h4>
              <p className="text-xs text-charcoal-400 mb-4">Add educational background to complete the profile</p>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartAddEducation}
                  className="gap-1.5 border-charcoal-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={edu.id} className="animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  {editingEducationId === edu.id ? (
                    // Inline Edit Form
                    <div className="p-5 rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="font-semibold text-charcoal-800 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Pencil className="w-4 h-4 text-purple-600" />
                          </div>
                          Edit Education
                        </h4>
                        <Button variant="ghost" size="sm" onClick={handleCancelEducation} className="text-charcoal-500 hover:text-charcoal-700">
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
                    // Display Mode - Compact view with expandable details
                    <div
                      className={cn(
                        'group relative rounded-xl border border-charcoal-200/60 bg-white transition-all duration-200',
                        expandedEducationId === edu.id && 'shadow-md'
                      )}
                    >
                      {/* Compact Header - Always Visible */}
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-charcoal-50/30"
                        onClick={() => setExpandedEducationId(expandedEducationId === edu.id ? null : edu.id)}
                      >
                        {/* Institution Icon */}
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center flex-shrink-0 border border-purple-200/40 group-hover:from-purple-200 group-hover:to-purple-100 transition-colors duration-200">
                          <GraduationCap className="w-5 h-5 text-purple-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Title Row */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-charcoal-900 text-[15px]">
                              {edu.degreeType ? getDegreeTypeLabel(edu.degreeType) : edu.degreeName || 'Degree not specified'}
                              {edu.fieldOfStudy && <span className="font-normal text-charcoal-600"> in {edu.fieldOfStudy}</span>}
                            </h4>
                            {edu.isCurrent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                In Progress
                              </span>
                            )}
                          </div>

                          {/* Meta Row */}
                          <div className="flex items-center gap-3 text-sm text-charcoal-500 flex-wrap">
                            <span className="flex items-center gap-1.5 font-medium text-charcoal-600">
                              <Building2 className="w-3.5 h-3.5 text-charcoal-400" />
                              {edu.institutionName || 'Institution not specified'}
                            </span>
                            {((edu as any).location || (edu as any).locationCity) && (
                              <>
                                <span className="text-charcoal-300">•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                                  {(edu as any).location || [(edu as any).locationCity, (edu as any).locationState].filter(Boolean).join(', ')}
                                </span>
                              </>
                            )}
                            {(edu.startDate || edu.endDate || edu.isCurrent) && (
                              <>
                                <span className="text-charcoal-300">•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                                  {formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expand/Collapse Icon & Actions */}
                        <div className="flex items-center gap-1">
                          {/* Actions - Show on hover */}
                          {isEditable && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartEditEducation(edu)
                                }}
                                className="h-8 w-8 p-0 text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onRemoveEducation?.(edu.id)
                                }}
                                className="h-8 w-8 p-0 text-charcoal-400 hover:text-error-600 hover:bg-error-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {/* Expand Icon */}
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                            expandedEducationId === edu.id ? 'bg-purple-100' : 'hover:bg-charcoal-100'
                          )}>
                            {expandedEducationId === edu.id ? (
                              <ChevronDown className="w-4 h-4 text-purple-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-charcoal-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details Section */}
                      {expandedEducationId === edu.id && (
                        <div className="px-4 pb-4 pt-0 border-t border-charcoal-100 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="pt-4 pl-[60px] space-y-4">
                            {/* Degree Name if different from type */}
                            {edu.degreeName && edu.degreeType && (
                              <div>
                                <p className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Full Degree Name</p>
                                <p className="text-sm text-charcoal-600">{edu.degreeName}</p>
                              </div>
                            )}

                            {/* GPA & Honors Row */}
                            {(edu.gpa || edu.honors) && (
                              <div>
                                <p className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-1.5">Academic Achievement</p>
                                <div className="flex items-center gap-3">
                                  {edu.gpa && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-charcoal-50 text-sm">
                                      <span className="text-charcoal-500 text-xs font-medium">GPA:</span>
                                      <span className="font-semibold text-charcoal-700">{edu.gpa}</span>
                                    </span>
                                  )}
                                  {edu.honors && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-sm text-amber-700 border border-amber-200/60">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                      {edu.honors}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Internal Notes */}
                            {(edu as any).notes && (
                              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60">
                                <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3" />
                                  Internal Notes
                                </p>
                                <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-relaxed">{(edu as any).notes}</p>
                              </div>
                            )}

                            {/* Empty state when expanded but no extra details */}
                            {!edu.degreeName && !edu.gpa && !edu.honors && !(edu as any).notes && (
                              <p className="text-sm text-charcoal-400 italic">No additional details available</p>
                            )}
                          </div>
                        </div>
                      )}
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
  const [isGeneratingAchievements, setIsGeneratingAchievements] = React.useState(false)
  const [aiMessage, setAiMessage] = React.useState<string | null>(null)

  // Check if there's enough content to generate achievements
  const hasEnoughContent = (form.description && form.description.length > 10) ||
    (form.responsibilities && form.responsibilities.length > 0 && form.responsibilities.some(r => r.length > 5))

  // AI generation for achievements - ONLY enhances existing content, no hallucination
  const handleGenerateAchievements = async () => {
    if (!form.companyName || !form.jobTitle) return

    // Warn if no meaningful content
    if (!hasEnoughContent) {
      setAiMessage('Please add a description or responsibilities first. AI can only enhance existing content.')
      return
    }

    setIsGeneratingAchievements(true)
    setAiMessage(null)

    try {
      const response = await fetch('/api/ai/generate-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          jobTitle: form.jobTitle,
          employmentType: form.employmentType,
          description: form.description,
          responsibilities: form.responsibilities,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.achievements?.length) {
          onChange({ ...form, achievements: [...form.achievements, ...data.achievements] })
          setAiMessage(null)
        } else if (data.message) {
          setAiMessage(data.message)
        } else {
          setAiMessage('Could not generate achievements. Please add more details to the description or responsibilities.')
        }
      }
    } catch (error) {
      console.error('Failed to generate achievements:', error)
      setAiMessage('Failed to generate. Please try again.')
    } finally {
      setIsGeneratingAchievements(false)
    }
  }

  return (
    <div className="space-y-5">
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

      {/* Row 3: Current & Remote Checkboxes */}
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

      {/* Row 4: Location (City, State, Country) */}
      <LocationPicker
        label="Location"
        value={{
          city: form.locationCity || null,
          stateProvince: form.locationState || null,
          countryCode: form.locationCountry || 'US',
        }}
        onChange={(data) => onChange({
          ...form,
          locationCity: data.city || '',
          locationState: data.stateProvince || '',
          locationCountry: data.countryCode || 'US',
        })}
        showCountry
      />

      {/* Row 5: Description */}
      <div className="space-y-2">
        <Label className="text-xs text-charcoal-600">Description (Optional)</Label>
        <Textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Brief overview of the role and your position..."
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Row 6: Roles & Responsibilities */}
      <BulletListEditor
        label="Roles & Responsibilities"
        items={form.responsibilities}
        onChange={(responsibilities) => onChange({ ...form, responsibilities })}
        placeholder="e.g., Managed a team of 5 developers..."
        helperText="Key responsibilities in this role"
      />

      {/* Row 7: Key Achievements with AI Generation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-charcoal-600">Key Achievements</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateAchievements}
            disabled={isGeneratingAchievements || (!form.companyName && !form.jobTitle)}
            className="h-7 text-xs gap-1.5 text-gold-600 hover:text-gold-700 hover:bg-gold-50"
          >
            {isGeneratingAchievements ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
        {/* AI Message Feedback */}
        {aiMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-amber-700">{aiMessage}</p>
          </div>
        )}
        {/* Hint when no content yet */}
        {!hasEnoughContent && !aiMessage && (
          <p className="text-xs text-charcoal-400 italic">
            Tip: Add a description or responsibilities above, then use &quot;Generate with AI&quot; to create achievement statements.
          </p>
        )}
        <BulletListEditor
          items={form.achievements}
          onChange={(achievements) => {
            onChange({ ...form, achievements })
            // Clear AI message when user manually adds achievements
            if (aiMessage) setAiMessage(null)
          }}
          placeholder="e.g., Increased revenue by 25% through process optimization..."
          helperText="Quantifiable achievements and accomplishments"
        />
      </div>

      {/* Row 8: Tools & Technologies Used */}
      <TagListEditor
        label="Tools & Technologies"
        items={form.toolsUsed}
        onChange={(toolsUsed) => onChange({ ...form, toolsUsed })}
        placeholder="e.g., React, Node.js, AWS..."
        helperText="Technologies, frameworks, and tools used in this role"
      />

      {/* Row 9: Internal Notes (User Entered Only) */}
      <div className="space-y-2">
        <Label className="text-xs text-charcoal-600">Internal Notes (Optional)</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
          placeholder="Internal notes for recruiters (not shown on resume)..."
          rows={2}
          className="resize-none bg-amber-50/50 border-amber-200"
        />
        <p className="text-xs text-charcoal-400">These notes are for internal use only</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-charcoal-100">
        <Button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Check className="w-4 h-4" />
          {isEdit ? 'Save Changes' : 'Add Experience'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-charcoal-200 hover:bg-charcoal-50 transition-all duration-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ============ REUSABLE LIST EDITORS ============

// Bullet List Editor (for responsibilities, achievements)
interface BulletListEditorProps {
  label?: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  helperText?: string
}

function BulletListEditor({ label, items, onChange, placeholder, helperText }: BulletListEditorProps) {
  const [newItem, setNewItem] = React.useState('')

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()])
      setNewItem('')
    }
  }

  const handleRemove = (index: number) => {
    const updated = [...items]
    updated.splice(index, 1)
    onChange(updated)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-2.5">
      {label && <Label className="text-xs font-medium text-charcoal-600">{label}</Label>}
      {helperText && <p className="text-xs text-charcoal-400">{helperText}</p>}

      {/* Existing items */}
      {items.length > 0 && (
        <div className="space-y-2 rounded-xl border border-charcoal-100 bg-charcoal-50/30 p-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-charcoal-100/80 group hover:border-charcoal-200 transition-colors duration-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2 flex-shrink-0" />
              <span className="text-sm text-charcoal-700 flex-1 leading-relaxed">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="opacity-0 group-hover:opacity-100 text-charcoal-400 hover:text-red-500 transition-all duration-200 p-1 hover:bg-red-50 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Add item...'}
          className="h-10 flex-1 border-charcoal-200 focus:border-charcoal-300"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className="h-10 px-3 border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Tag List Editor (for tools/technologies)
interface TagListEditorProps {
  label?: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  helperText?: string
}

function TagListEditor({ label, items, onChange, placeholder, helperText }: TagListEditorProps) {
  const [newItem, setNewItem] = React.useState('')

  const handleAdd = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onChange([...items, newItem.trim()])
      setNewItem('')
    }
  }

  const handleRemove = (index: number) => {
    const updated = [...items]
    updated.splice(index, 1)
    onChange(updated)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-2.5">
      {label && <Label className="text-xs font-medium text-charcoal-600">{label}</Label>}
      {helperText && <p className="text-xs text-charcoal-400">{helperText}</p>}

      {/* Display tags */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-charcoal-100 bg-charcoal-50/30">
          {items.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-charcoal-200/60 text-sm text-charcoal-700 font-medium group hover:border-charcoal-300 transition-colors duration-200 shadow-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="opacity-50 group-hover:opacity-100 hover:text-red-500 transition-all duration-200 p-0.5 hover:bg-red-50 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add new tag */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Add tag...'}
          className="h-10 flex-1 border-charcoal-200 focus:border-charcoal-300"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className="h-10 px-3 border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
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

      {/* Row 7: Location (City, State, Country) */}
      <LocationPicker
        label="Institution Location"
        value={{
          city: form.locationCity || null,
          stateProvince: form.locationState || null,
          countryCode: form.locationCountry || 'US',
        }}
        onChange={(data) => onChange({
          ...form,
          locationCity: data.city || '',
          locationState: data.stateProvince || '',
          locationCountry: data.countryCode || 'US',
        })}
        showCountry
      />

      {/* Row 8: Internal Notes */}
      <div className="space-y-2">
        <Label className="text-xs text-charcoal-600">Internal Notes (Optional)</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
          placeholder="Internal notes for recruiters (not shown on resume)..."
          rows={2}
          className="resize-none bg-amber-50/50 border-amber-200"
        />
        <p className="text-xs text-charcoal-400">These notes are for internal use only</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-charcoal-100">
        <Button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Check className="w-4 h-4" />
          {isEdit ? 'Save Changes' : 'Add Education'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-charcoal-200 hover:bg-charcoal-50 transition-all duration-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default ExperienceSection
