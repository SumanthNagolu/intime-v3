'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  User,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays, parse, isValid } from 'date-fns'

// Interview types configuration
const INTERVIEW_TYPES = [
  { value: 'phone_screen', label: 'Phone Screen', icon: Phone, duration: 30 },
  { value: 'video_call', label: 'Video Call', icon: Video, duration: 45 },
  { value: 'in_person', label: 'In Person', icon: MapPin, duration: 60 },
  { value: 'panel', label: 'Panel Interview', icon: Users, duration: 60 },
  { value: 'technical', label: 'Technical Interview', icon: Users, duration: 90 },
  { value: 'behavioral', label: 'Behavioral Interview', icon: Users, duration: 45 },
  { value: 'final_round', label: 'Final Round', icon: Users, duration: 60 },
] as const

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
] as const

// Form validation schema
const scheduleInterviewSchema = z.object({
  interviewType: z.enum([
    'phone_screen', 'video_call', 'in_person', 'panel',
    'technical', 'behavioral', 'final_round'
  ]),
  roundNumber: z.number().int().min(1).max(10),
  durationMinutes: z.number().int().min(15).max(480),
  timezone: z.string(),
  proposedTimes: z.array(z.object({
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
  })).min(1, 'At least one time slot is required').max(5),
  interviewers: z.array(z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Valid email required'),
    title: z.string().max(100).optional(),
  })).min(1, 'At least one interviewer is required').max(10),
  meetingLink: z.string().url().optional().or(z.literal('')),
  meetingLocation: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  internalNotes: z.string().max(1000).optional(),
})

type ScheduleInterviewFormData = z.infer<typeof scheduleInterviewSchema>

interface ScheduleInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  candidateName: string
  jobTitle: string
  accountName: string
  currentRound?: number
  onSuccess?: () => void
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  submissionId,
  candidateName,
  jobTitle,
  accountName,
  currentRound = 0,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'type' | 'times' | 'details'>('type')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ScheduleInterviewFormData>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      interviewType: 'phone_screen',
      roundNumber: currentRound + 1,
      durationMinutes: 30,
      timezone: 'America/New_York',
      proposedTimes: [{ date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '10:00' }],
      interviewers: [{ name: '', email: '', title: '' }],
      meetingLink: '',
      meetingLocation: '',
      description: '',
      internalNotes: '',
    },
    mode: 'onChange',
  })

  const {
    fields: proposedTimesFields,
    append: appendTime,
    remove: removeTime,
  } = useFieldArray({
    control,
    name: 'proposedTimes',
  })

  const {
    fields: interviewersFields,
    append: appendInterviewer,
    remove: removeInterviewer,
  } = useFieldArray({
    control,
    name: 'interviewers',
  })

  const interviewType = watch('interviewType')
  const durationMinutes = watch('durationMinutes')
  const proposedTimes = watch('proposedTimes')
  const interviewers = watch('interviewers')
  const timezone = watch('timezone')
  const meetingLink = watch('meetingLink')
  const meetingLocation = watch('meetingLocation')

  const scheduleMutation = trpc.ats.interviews.schedule.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Interview scheduled',
        description: `Round ${result.proposedTimesCount > 1 ? 'times proposed' : 'scheduled'} for ${candidateName}`,
      })
      reset()
      setStep('type')
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to schedule interview',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: ScheduleInterviewFormData) => {
    scheduleMutation.mutate({
      submissionId,
      interviewType: data.interviewType,
      roundNumber: data.roundNumber,
      durationMinutes: data.durationMinutes,
      timezone: data.timezone,
      proposedTimes: data.proposedTimes,
      interviewers: data.interviewers.filter(i => i.name && i.email),
      meetingLink: data.meetingLink || undefined,
      meetingLocation: data.meetingLocation || undefined,
      description: data.description || undefined,
      internalNotes: data.internalNotes || undefined,
    })
  }

  const handleClose = () => {
    reset()
    setStep('type')
    onOpenChange(false)
  }

  const handleInterviewTypeSelect = (type: typeof interviewType) => {
    setValue('interviewType', type)
    const config = INTERVIEW_TYPES.find(t => t.value === type)
    if (config) {
      setValue('durationMinutes', config.duration)
    }
  }

  const selectedTypeConfig = INTERVIEW_TYPES.find(t => t.value === interviewType)
  const requiresLink = ['video_call', 'panel'].includes(interviewType)
  const requiresLocation = interviewType === 'in_person'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-500" />
            Schedule Interview
          </DialogTitle>
          <DialogDescription>
            Schedule an interview for{' '}
            <span className="font-medium text-charcoal-900">{candidateName}</span> at{' '}
            <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 py-2">
          {['type', 'times', 'details'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === s
                    ? 'bg-hublot-900 text-white'
                    : ['type', 'times', 'details'].indexOf(step) > i
                    ? 'bg-green-100 text-green-800'
                    : 'bg-charcoal-100 text-charcoal-500'
                )}
              >
                {['type', 'times', 'details'].indexOf(step) > i ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2',
                    ['type', 'times', 'details'].indexOf(step) > i
                      ? 'bg-green-400'
                      : 'bg-charcoal-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Interview Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Select Interview Type</h3>

              <div className="grid grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = interviewType === type.value
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
                    value={String(watch('roundNumber'))}
                    onValueChange={(v) => setValue('roundNumber', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          Round {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration (mins)</Label>
                  <Select
                    value={String(durationMinutes)}
                    onValueChange={(v) => setValue('durationMinutes', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 30, 45, 60, 90, 120, 180, 240].map((d) => (
                        <SelectItem key={d} value={String(d)}>
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
          {step === 'times' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-charcoal-900">Proposed Times</h3>
                <Badge variant="outline" className="text-xs">
                  {selectedTypeConfig?.label} - {durationMinutes} mins
                </Badge>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={timezone}
                  onValueChange={(v) => setValue('timezone', v)}
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
                {proposedTimesFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="date"
                        {...register(`proposedTimes.${index}.date`)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="time"
                        {...register(`proposedTimes.${index}.time`)}
                      />
                    </div>
                    {proposedTimesFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTime(index)}
                      >
                        <Trash2 className="w-4 h-4 text-charcoal-400" />
                      </Button>
                    )}
                  </div>
                ))}

                {proposedTimesFields.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTime({ date: '', time: '' })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time Slot
                  </Button>
                )}

                {errors.proposedTimes && (
                  <p className="text-sm text-red-500">{errors.proposedTimes.message}</p>
                )}
              </div>

              {/* Interviewers */}
              <div className="space-y-3 border-t pt-4">
                <Label>Interviewers</Label>
                {interviewersFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Name"
                      {...register(`interviewers.${index}.name`)}
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      {...register(`interviewers.${index}.email`)}
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        placeholder="Title (optional)"
                        {...register(`interviewers.${index}.title`)}
                      />
                      {interviewersFields.length > 1 && (
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

                {interviewersFields.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendInterviewer({ name: '', email: '', title: '' })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Interviewer
                  </Button>
                )}

                {errors.interviewers && (
                  <p className="text-sm text-red-500">{errors.interviewers.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Details & Review */}
          {step === 'details' && (
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
                    {...register('meetingLink')}
                    placeholder="https://zoom.us/j/..."
                  />
                  {errors.meetingLink && (
                    <p className="text-sm text-red-500">{errors.meetingLink.message}</p>
                  )}
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
                    {...register('meetingLocation')}
                    placeholder="123 Main St, Suite 100, New York, NY"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Interview Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
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
                  {...register('internalNotes')}
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
                      Round {watch('roundNumber')} - {selectedTypeConfig?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Duration</span>
                    <span className="font-medium text-charcoal-900">{durationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Time Slots</span>
                    <span className="font-medium text-charcoal-900">
                      {proposedTimes.filter(t => t.date && t.time).length} option(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Interviewers</span>
                    <span className="font-medium text-charcoal-900">
                      {interviewers.filter(i => i.name && i.email).length} person(s)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            {step !== 'type' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step === 'details' ? 'times' : 'type')}
              >
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {step !== 'details' ? (
                <Button
                  type="button"
                  onClick={() => setStep(step === 'type' ? 'times' : 'details')}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={scheduleMutation.isPending}
                >
                  {scheduleMutation.isPending ? (
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
