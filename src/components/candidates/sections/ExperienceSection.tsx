'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  MapPin,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import type { SectionMode, ExperienceSectionData, WorkHistoryEntry, EducationEntry } from '@/lib/candidates/types'
import { EMPLOYMENT_TYPES, DEGREE_TYPES } from '@/lib/candidates/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

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
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddWorkHistory?.({
                  companyName: '',
                  jobTitle: '',
                  employmentType: 'full_time',
                  startDate: null,
                  endDate: null,
                  isCurrent: false,
                  location: null,
                  isRemote: false,
                  description: null,
                  achievements: [],
                })}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.workHistory.length === 0 ? (
            <div className="text-center py-8 text-charcoal-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No work history added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.workHistory.map((job, index) => (
                <div
                  key={job.id}
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
                          onClick={() => {/* Open edit modal */}}
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
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddEducation?.({
                  institutionName: '',
                  degreeType: null,
                  degreeName: null,
                  fieldOfStudy: null,
                  startDate: null,
                  endDate: null,
                  isCurrent: false,
                  gpa: null,
                  honors: null,
                })}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.education.length === 0 ? (
            <div className="text-center py-8 text-charcoal-400">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No education added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-lg border border-charcoal-100 bg-charcoal-50/50"
                >
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
                          onClick={() => {/* Open edit modal */}}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ExperienceSection
