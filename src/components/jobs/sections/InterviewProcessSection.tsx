'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Calendar,
  FileText,
  Clock,
  MessageSquare,
  Plus,
  X,
  GripVertical,
  Phone,
  Video,
  MapPin,
  Code,
  UserCheck,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { INTERVIEW_FORMATS, SUBMISSION_REQUIREMENTS } from '@/lib/jobs/constants'
import type { SectionMode, InterviewProcessSectionData, InterviewRound } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface InterviewProcessSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: InterviewProcessSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
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
 * InterviewProcessSection - Unified component for Interview Process
 *
 * Covers interview rounds, submission requirements, and timing
 */
export function InterviewProcessSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: InterviewProcessSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
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

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Interview round management
  const addRound = () => {
    const newRound: InterviewRound = {
      id: `round-${Date.now()}`,
      name: `Round ${data.interviewRounds.length + 1}`,
      format: 'video',
      duration: 60,
      interviewer: '',
      focus: '',
    }
    handleChange('interviewRounds', [...data.interviewRounds, newRound])
  }

  const updateRound = (index: number, updates: Partial<InterviewRound>) => {
    const updated = [...data.interviewRounds]
    updated[index] = { ...updated[index], ...updates }
    handleChange('interviewRounds', updated)
  }

  const removeRound = (index: number) => {
    handleChange('interviewRounds', data.interviewRounds.filter((_, i) => i !== index))
  }

  // Submission requirement toggle
  const toggleRequirement = (req: string) => {
    const current = data.submissionRequirements
    if (current.includes(req)) {
      handleChange('submissionRequirements', current.filter((r) => r !== req))
    } else {
      handleChange('submissionRequirements', [...current, req])
    }
  }

  // Format icons
  const formatIcons: Record<string, React.ReactNode> = {
    phone: <Phone className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    onsite: <MapPin className="w-4 h-4" />,
    panel: <Users className="w-4 h-4" />,
    technical: <Code className="w-4 h-4" />,
    behavioral: <UserCheck className="w-4 h-4" />,
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Interview Process"
          subtitle="Interview stages and submission requirements"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Interview Rounds Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">Interview Rounds</CardTitle>
                <p className="text-xs text-charcoal-500">Define each stage of the interview process</p>
              </div>
            </div>
            {isEditable && (
              <Button type="button" variant="outline" size="sm" onClick={addRound} className="rounded-lg">
                <Plus className="w-4 h-4 mr-1" />
                Add Round
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.interviewRounds.length > 0 ? (
            <div className="space-y-3">
              {data.interviewRounds.map((round, index) => (
                <div
                  key={round.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    isEditable
                      ? 'border-charcoal-200 bg-white'
                      : 'border-charcoal-100 bg-charcoal-50'
                  )}
                >
                  {isEditable ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="pt-2 text-charcoal-300 cursor-move">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Round Name */}
                            <div className="space-y-1">
                              <Label className="text-xs text-charcoal-500">Round Name</Label>
                              <Input
                                value={round.name}
                                onChange={(e) => updateRound(index, { name: e.target.value })}
                                placeholder="e.g., Technical Screen"
                                className="h-9 rounded-lg text-sm"
                              />
                            </div>
                            {/* Format */}
                            <div className="space-y-1">
                              <Label className="text-xs text-charcoal-500">Format</Label>
                              <Select
                                value={round.format}
                                onValueChange={(value) =>
                                  updateRound(index, { format: value as InterviewRound['format'] })
                                }
                              >
                                <SelectTrigger className="h-9 rounded-lg text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {INTERVIEW_FORMATS.map((format) => (
                                    <SelectItem key={format.value} value={format.value}>
                                      <div className="flex items-center gap-2">
                                        {formatIcons[format.value]}
                                        {format.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Duration */}
                            <div className="space-y-1">
                              <Label className="text-xs text-charcoal-500">Duration (min)</Label>
                              <Select
                                value={round.duration.toString()}
                                onValueChange={(value) =>
                                  updateRound(index, { duration: parseInt(value) })
                                }
                              >
                                <SelectTrigger className="h-9 rounded-lg text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[15, 30, 45, 60, 90, 120, 180, 240].map((min) => (
                                    <SelectItem key={min} value={min.toString()}>
                                      {min < 60 ? `${min} min` : `${min / 60} hr${min > 60 ? 's' : ''}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Interviewer */}
                            <div className="space-y-1">
                              <Label className="text-xs text-charcoal-500">Interviewer</Label>
                              <Input
                                value={round.interviewer}
                                onChange={(e) => updateRound(index, { interviewer: e.target.value })}
                                placeholder="Name or role"
                                className="h-9 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                          {/* Focus Area */}
                          <div className="space-y-1">
                            <Label className="text-xs text-charcoal-500">Focus Area</Label>
                            <Input
                              value={round.focus}
                              onChange={(e) => updateRound(index, { focus: e.target.value })}
                              placeholder="What will be evaluated in this round?"
                              className="h-9 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRound(index)}
                          className="h-9 w-9 p-0 text-charcoal-400 hover:text-error-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        {formatIcons[round.format] || <Users className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-charcoal-900">{round.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {INTERVIEW_FORMATS.find((f) => f.value === round.format)?.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {round.duration} min
                          </Badge>
                        </div>
                        {(round.interviewer || round.focus) && (
                          <p className="text-sm text-charcoal-500 mt-1">
                            {round.interviewer && <span>With {round.interviewer}</span>}
                            {round.interviewer && round.focus && ' • '}
                            {round.focus && <span>{round.focus}</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-charcoal-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
              <p className="text-sm">No interview rounds defined yet</p>
              {isEditable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRound}
                  className="mt-4 rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add First Round
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timing & Expectations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Timeline */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Timeline & Expectations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Decision Days
                </Label>
                {isEditable ? (
                  <Input
                    type="number"
                    value={data.decisionDays}
                    onChange={(e) => handleChange('decisionDays', e.target.value)}
                    placeholder="e.g., 5"
                    className="h-11 rounded-xl border-charcoal-200 bg-white"
                  />
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.decisionDays ? `${data.decisionDays} days` : 'Not specified'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Feedback Turnaround
                </Label>
                {isEditable ? (
                  <Input
                    type="number"
                    value={data.feedbackTurnaround}
                    onChange={(e) => handleChange('feedbackTurnaround', e.target.value)}
                    placeholder="e.g., 2"
                    className="h-11 rounded-xl border-charcoal-200 bg-white"
                  />
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.feedbackTurnaround ? `${data.feedbackTurnaround} days` : 'Not specified'}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Candidates Per Week
              </Label>
              {isEditable ? (
                <Input
                  type="number"
                  value={data.candidatesPerWeek}
                  onChange={(e) => handleChange('candidatesPerWeek', e.target.value)}
                  placeholder="How many candidates to submit weekly?"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-sm text-charcoal-900">
                  {data.candidatesPerWeek
                    ? `${data.candidatesPerWeek} candidates/week`
                    : 'Not specified'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submission Requirements */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Submission Requirements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable ? (
              <div className="grid grid-cols-2 gap-2">
                {SUBMISSION_REQUIREMENTS.map((req) => (
                  <button
                    key={req.value}
                    type="button"
                    onClick={() => toggleRequirement(req.value)}
                    className={cn(
                      'p-2.5 rounded-lg border text-left text-sm transition-all duration-200',
                      data.submissionRequirements.includes(req.value)
                        ? 'border-green-400 bg-green-50'
                        : 'border-charcoal-100 bg-white hover:border-green-200'
                    )}
                  >
                    {req.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.submissionRequirements.length > 0 ? (
                  data.submissionRequirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="py-1">
                      {SUBMISSION_REQUIREMENTS.find((r) => r.value === req)?.label || req}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-charcoal-400">No specific requirements</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Screening Questions */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-base font-heading">Screening Questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <Textarea
              value={data.screeningQuestions}
              onChange={(e) => handleChange('screeningQuestions', e.target.value)}
              placeholder="List any screening questions that should be asked before submission..."
              className="min-h-[100px] rounded-xl border-charcoal-200 bg-white resize-none"
            />
          ) : (
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
              {data.screeningQuestions || (
                <span className="text-charcoal-400">No screening questions specified</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Client-Specific Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <CardTitle className="text-base font-heading">Client Interview Process</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <Textarea
                value={data.clientInterviewProcess}
                onChange={(e) => handleChange('clientInterviewProcess', e.target.value)}
                placeholder="Any special instructions from the client about their interview process..."
                className="min-h-[100px] rounded-xl border-charcoal-200 bg-white resize-none"
              />
            ) : (
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                {data.clientInterviewProcess || (
                  <span className="text-charcoal-400">No client instructions specified</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              <CardTitle className="text-base font-heading">Submission Instructions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <Textarea
                value={data.clientSubmissionInstructions}
                onChange={(e) => handleChange('clientSubmissionInstructions', e.target.value)}
                placeholder="How should candidates be submitted to the client..."
                className="min-h-[100px] rounded-xl border-charcoal-200 bg-white resize-none"
              />
            ) : (
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                {data.clientSubmissionInstructions || (
                  <span className="text-charcoal-400">No submission instructions specified</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Notes */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <Textarea
              value={data.submissionNotes}
              onChange={(e) => handleChange('submissionNotes', e.target.value)}
              placeholder="Any other notes about the submission or interview process..."
              className="min-h-[80px] rounded-xl border-charcoal-200 bg-white resize-none"
            />
          ) : (
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
              {data.submissionNotes || (
                <span className="text-charcoal-400">No additional notes</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InterviewProcessSection
