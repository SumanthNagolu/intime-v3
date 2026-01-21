'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Star,
  Eye,
  Calendar,
  Tag,
  MessageSquare,
  Users,
  Hash,
  Flame,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import type { SectionMode, ResumeSectionData, ResumeEntry } from '@/lib/candidates/types'
import { LEAD_SOURCES, CANDIDATE_STATUSES } from '@/lib/candidates/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// ============ PROPS ============

interface ResumeSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: ResumeSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler to upload resume */
  onUploadResume?: (file: File) => Promise<void>
  /** Handler to delete resume */
  onDeleteResume?: (id: string) => void
  /** Handler to set primary resume */
  onSetPrimaryResume?: (id: string) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Loading state for upload */
  isUploading?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * ResumeSection - Unified component for Candidate Resume (Section 6)
 *
 * Fields:
 * - Resumes: file upload, versions, primary designation
 * - Source tracking: lead source, referral, campaign
 * - Status: candidate status, hotlist
 * - Tags & Notes: internal organization
 */
export function ResumeSection({
  mode,
  data,
  onChange,
  onUploadResume,
  onDeleteResume,
  onSetPrimaryResume,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  isUploading = false,
  errors = {},
  className,
}: ResumeSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUploadResume) {
      await onUploadResume(file)
    }
  }

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  const sourceOptions = LEAD_SOURCES.map(s => ({ value: s.value, label: s.label }))
  const statusOptions = CANDIDATE_STATUSES.map(s => ({ value: s.value, label: s.label }))

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const primaryResume = data.resumes.find(r => r.isPrimary)
  const otherResumes = data.resumes.filter(r => !r.isPrimary)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Resume"
          subtitle="Resume upload and source tracking"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumes Card */}
        <Card className="shadow-elevation-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-heading">Resumes</CardTitle>
                  <p className="text-xs text-charcoal-500">
                    {data.resumes.length} resume{data.resumes.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {isEditable && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data.resumes.length === 0 ? (
              <div className="text-center py-8 text-charcoal-400 border-2 border-dashed border-charcoal-200 rounded-lg">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm mb-2">No resumes uploaded yet</p>
                {isEditable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1.5" />
                    Upload Resume
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Primary Resume */}
                {primaryResume && (
                  <div className="p-4 rounded-lg border-2 border-gold-200 bg-gold-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold-100 rounded-lg">
                          <Star className="w-5 h-5 text-gold-600 fill-gold-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-charcoal-900">
                              {primaryResume.label || primaryResume.fileName}
                            </h4>
                            <Badge variant="success" className="text-xs">Primary</Badge>
                            {primaryResume.isLatest && (
                              <Badge variant="outline" className="text-xs">Latest</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-1">
                            <span>{formatFileSize(primaryResume.fileSize)}</span>
                            <span>v{primaryResume.version}</span>
                            <span>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {format(new Date(primaryResume.uploadedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                        {isEditable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-error-600"
                            onClick={() => onDeleteResume?.(primaryResume.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Resumes */}
                {otherResumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="p-4 rounded-lg border border-charcoal-100 bg-charcoal-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-charcoal-100 rounded-lg">
                          <FileText className="w-5 h-5 text-charcoal-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-charcoal-900">
                              {resume.label || resume.fileName}
                            </h4>
                            {resume.isLatest && (
                              <Badge variant="outline" className="text-xs">Latest</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-1">
                            <span>{formatFileSize(resume.fileSize)}</span>
                            <span>v{resume.version}</span>
                            <span>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {format(new Date(resume.uploadedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSetPrimaryResume?.(resume.id)}
                            className="text-xs"
                          >
                            Set Primary
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                        {isEditable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-error-600"
                            onClick={() => onDeleteResume?.(resume.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Tracking Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Source Tracking</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Lead Source"
              type="select"
              options={sourceOptions}
              value={data.source}
              onChange={(v) => handleChange('source', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Source Details"
              value={data.sourceDetails}
              onChange={(v) => handleChange('sourceDetails', v)}
              editable={isEditable}
              placeholder="e.g., Job board name, event name"
            />
            <UnifiedField
              label="Referred By"
              value={data.referredBy}
              onChange={(v) => handleChange('referredBy', v)}
              editable={isEditable}
              placeholder="Referrer name or employee ID"
            />
            <UnifiedField
              label="Campaign ID"
              value={data.campaignId}
              onChange={(v) => handleChange('campaignId', v)}
              editable={isEditable}
              placeholder="Marketing campaign reference"
            />
          </CardContent>
        </Card>

        {/* Status & Hotlist Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Flame className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Status & Hotlist</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Candidate Status"
              type="select"
              options={statusOptions}
              value={data.candidateStatus}
              onChange={(v) => handleChange('candidateStatus', v)}
              editable={isEditable}
              badge={!isEditable}
            />
            <UnifiedField
              label="On Hotlist"
              type="switch"
              value={data.isOnHotlist}
              onChange={(v) => handleChange('isOnHotlist', v)}
              editable={isEditable}
              helpText="Mark as a high-priority candidate"
            />
            {data.isOnHotlist && (
              <UnifiedField
                label="Hotlist Notes"
                type="textarea"
                value={data.hotlistNotes}
                onChange={(v) => handleChange('hotlistNotes', v)}
                editable={isEditable}
                placeholder="Why is this candidate on the hotlist?"
              />
            )}
          </CardContent>
        </Card>

        {/* Tags & Notes Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Tag className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Tags & Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UnifiedField
                label="Tags"
                type="multiSelect"
                options={[
                  { value: 'senior', label: 'Senior' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'architect', label: 'Architect' },
                  { value: 'fullstack', label: 'Full Stack' },
                  { value: 'frontend', label: 'Frontend' },
                  { value: 'backend', label: 'Backend' },
                  { value: 'devops', label: 'DevOps' },
                  { value: 'data', label: 'Data' },
                  { value: 'ai_ml', label: 'AI/ML' },
                ]}
                value={data.tags}
                onChange={(v) => handleChange('tags', v)}
                editable={isEditable}
              />
              <UnifiedField
                label="Internal Notes"
                type="textarea"
                value={data.internalNotes}
                onChange={(v) => handleChange('internalNotes', v)}
                editable={isEditable}
                placeholder="Internal notes about this candidate..."
                maxLength={1000}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResumeSection
