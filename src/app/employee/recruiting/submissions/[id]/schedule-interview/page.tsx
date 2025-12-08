'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  useScheduleInterviewStore,
  INTERVIEW_TYPES,
  TIMEZONES,
  DURATION_OPTIONS,
  ROUND_OPTIONS,
} from '@/stores/schedule-interview-store'
import {
  Loader2,
  Calendar,
  Clock,
  Video,
  Phone,
  Users,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Link2,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const INTERVIEW_TYPE_ICONS = {
  phone_screen: Phone,
  video_call: Video,
  in_person: MapPin,
  panel: Users,
  technical: Users,
  behavioral: Users,
  final_round: Users,
}

export default function ScheduleInterviewPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const submissionId = params.id as string

  // URL-based step management
  const stepParam = searchParams.get('step')
  const urlStep = stepParam ? Math.min(Math.max(parseInt(stepParam), 1), 3) as 1 | 2 | 3 : 1

  const {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    addProposedTime,
    removeProposedTime,
    updateProposedTime,
    addInterviewer,
    removeInterviewer,
    updateInterviewer,
    resetForm,
    initializeFromSubmission,
    isDirty,
    lastSaved,
  } = useScheduleInterviewStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync step with URL
  useEffect(() => {
    setCurrentStep(urlStep)
  }, [urlStep, setCurrentStep])

  // Fetch submission data
  const submissionQuery = trpc.ats.submissions.getById.useQuery(
    { id: submissionId },
    { enabled: !!submissionId }
  )

  // Initialize from submission data
  useEffect(() => {
    if (submissionQuery.data) {
      const sub = submissionQuery.data
      initializeFromSubmission(
        submissionId,
        sub.candidateName || 'Candidate',
        sub.jobTitle || 'Job',
        sub.accountName || 'Account',
        sub.currentInterviewRound || 0
      )
    }
  }, [submissionQuery.data, submissionId, initializeFromSubmission])

  // Schedule mutation
  const scheduleMutation = trpc.ats.interviews.schedule.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Interview scheduled',
        description: `Interview ${formData.proposedTimes.length > 1 ? 'times proposed' : 'scheduled'} for ${formData.candidateName}`,
      })
      resetForm()
      router.push(`/employee/recruiting/submissions/${submissionId}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to schedule interview',
        description: error.message,
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const navigateToStep = (step: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleNext = () => {
    if (currentStep < 3) {
      navigateToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1)
    }
  }

  const handleInterviewTypeSelect = (type: typeof formData.interviewType) => {
    setFormData({ interviewType: type })
    const config = INTERVIEW_TYPES.find((t) => t.value === type)
    if (config) {
      setFormData({ durationMinutes: config.duration })
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    scheduleMutation.mutate({
      submissionId,
      interviewType: formData.interviewType,
      roundNumber: formData.roundNumber,
      durationMinutes: formData.durationMinutes,
      timezone: formData.timezone,
      proposedTimes: formData.proposedTimes.filter((t) => t.date && t.time),
      interviewers: formData.interviewers.filter((i) => i.name && i.email),
      meetingLink: formData.meetingLink || undefined,
      meetingLocation: formData.meetingLocation || undefined,
      description: formData.description || undefined,
      internalNotes: formData.internalNotes || undefined,
    })
  }

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved locally.',
    })
  }

  const selectedTypeConfig = INTERVIEW_TYPES.find((t) => t.value === formData.interviewType)
  const requiresLink = ['video_call', 'panel'].includes(formData.interviewType)
  const requiresLocation = formData.interviewType === 'in_person'

  if (submissionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-6">
        <Link
          href={`/employee/recruiting/submissions/${submissionId}`}
          className="hover:text-hublot-700 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Submission
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-gold-500" />
          Schedule Interview
        </h1>
        <p className="text-charcoal-500 mt-1">
          Schedule an interview for{' '}
          <span className="font-medium text-charcoal-900">{formData.candidateName}</span> at{' '}
          <span className="font-medium text-charcoal-900">{formData.accountName}</span>
        </p>
        {lastSaved && isDirty && (
          <p className="text-sm text-charcoal-500 mt-2">
            <Save className="w-3 h-3 inline mr-1" />
            Auto-saved {new Date(lastSaved).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 py-4 mb-6">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => navigateToStep(s)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hublot-500 focus:ring-offset-2',
                currentStep === s
                  ? 'bg-hublot-900 text-white shadow-lg'
                  : currentStep > s
                  ? 'bg-green-100 text-green-800 cursor-pointer'
                  : 'bg-charcoal-100 text-charcoal-500 cursor-pointer'
              )}
            >
              {currentStep > s ? <CheckCircle className="w-4 h-4" /> : s}
            </button>
            {i < 2 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2',
                  currentStep > s ? 'bg-green-400' : 'bg-charcoal-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Step 1: Interview Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Select Interview Type</h3>

              <div className="grid grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((type) => {
                  const Icon = INTERVIEW_TYPE_ICONS[type.value]
                  const isSelected = formData.interviewType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInterviewTypeSelect(type.value)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                        isSelected
                          ? 'border-hublot-900 bg-hublot-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isSelected ? 'text-hublot-900' : 'text-charcoal-400')} />
                      <div>
                        <div className="font-medium text-charcoal-900">{type.label}</div>
                        <div className="text-xs text-charcoal-500">{type.duration} mins default</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="roundNumber">Round Number</Label>
                  <Select
                    value={formData.roundNumber.toString()}
                    onValueChange={(v) => setFormData({ roundNumber: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUND_OPTIONS.map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          Round {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration (mins)</Label>
                  <Select
                    value={formData.durationMinutes.toString()}
                    onValueChange={(v) => setFormData({ durationMinutes: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Proposed Times */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-charcoal-900">Proposed Times</h3>
                <Badge variant="outline" className="text-xs">
                  {selectedTypeConfig?.label} - {formData.durationMinutes} mins
                </Badge>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(v) => setFormData({ timezone: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                <Label>Time Slots (select 1-5 options)</Label>
                {formData.proposedTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={time.date}
                        onChange={(e) => updateProposedTime(index, { ...time, date: e.target.value })}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={time.time}
                        onChange={(e) => updateProposedTime(index, { ...time, time: e.target.value })}
                      />
                    </div>
                    {formData.proposedTimes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProposedTime(index)}
                      >
                        <Trash2 className="w-4 h-4 text-charcoal-400" />
                      </Button>
                    )}
                  </div>
                ))}

                {formData.proposedTimes.length < 5 && (
                  <Button type="button" variant="outline" size="sm" onClick={addProposedTime}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time Slot
                  </Button>
                )}
              </div>

              {/* Interviewers */}
              <div className="space-y-3 border-t pt-4">
                <Label>Interviewers</Label>
                {formData.interviewers.map((interviewer, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Name"
                      value={interviewer.name}
                      onChange={(e) =>
                        updateInterviewer(index, { ...interviewer, name: e.target.value })
                      }
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={interviewer.email}
                      onChange={(e) =>
                        updateInterviewer(index, { ...interviewer, email: e.target.value })
                      }
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        placeholder="Title (optional)"
                        value={interviewer.title || ''}
                        onChange={(e) =>
                          updateInterviewer(index, { ...interviewer, title: e.target.value })
                        }
                      />
                      {formData.interviewers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInterviewer(index)}
                        >
                          <Trash2 className="w-4 h-4 text-charcoal-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {formData.interviewers.length < 10 && (
                  <Button type="button" variant="outline" size="sm" onClick={addInterviewer}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Interviewer
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Details & Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Meeting Details</h3>

              {/* Meeting Link (required for video/panel) */}
              {requiresLink && (
                <div className="space-y-2">
                  <Label htmlFor="meetingLink" className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Meeting Link *
                  </Label>
                  <Input
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ meetingLink: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}

              {/* Location (required for in-person) */}
              {requiresLocation && (
                <div className="space-y-2">
                  <Label htmlFor="meetingLocation" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location *
                  </Label>
                  <Input
                    id="meetingLocation"
                    value={formData.meetingLocation}
                    onChange={(e) => setFormData({ meetingLocation: e.target.value })}
                    placeholder="123 Main St, Suite 100, New York, NY"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Interview Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ description: e.target.value })}
                  placeholder="What to expect, topics to cover..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes (Optional)</Label>
                <Textarea
                  id="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ internalNotes: e.target.value })}
                  placeholder="Prep notes, candidate concerns, etc..."
                  rows={2}
                  className="resize-none"
                />
                <p className="text-xs text-charcoal-500">Not visible to client or candidate</p>
              </div>

              {/* Summary */}
              <Card className="bg-cream">
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Interview Type</span>
                    <span className="font-medium text-charcoal-900">
                      Round {formData.roundNumber} - {selectedTypeConfig?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Duration</span>
                    <span className="font-medium text-charcoal-900">{formData.durationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Time Slots</span>
                    <span className="font-medium text-charcoal-900">
                      {formData.proposedTimes.filter((t) => t.date && t.time).length} option(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Interviewers</span>
                    <span className="font-medium text-charcoal-900">
                      {formData.interviewers.filter((i) => i.name && i.email).length} person(s)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
                resetForm()
                router.push(`/employee/recruiting/submissions/${submissionId}`)
              }
            }}
          >
            Cancel
          </Button>

          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-hublot-900 hover:bg-hublot-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Interview'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
