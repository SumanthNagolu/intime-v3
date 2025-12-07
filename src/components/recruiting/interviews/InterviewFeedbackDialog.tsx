'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Clock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Form validation schema
const interviewFeedbackSchema = z.object({
  attendanceStatus: z.enum(['attended', 'no_show', 'rescheduled']),
  rating: z.number().int().min(1).max(5),
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters').max(2000),
  technicalRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  cultureFitRating: z.number().int().min(1).max(5).optional(),
  strengths: z.string().max(500).optional(),
  concerns: z.string().max(500).optional(),
  nextSteps: z.enum(['schedule_next_round', 'extend_offer', 'reject', 'on_hold']).optional(),
})

type InterviewFeedbackFormData = z.infer<typeof interviewFeedbackSchema>

interface InterviewFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string
  candidateName: string
  jobTitle: string
  interviewType: string
  roundNumber: number
  scheduledDate?: string
  daysSinceInterview?: number
  onSuccess?: () => void
}

const ATTENDANCE_OPTIONS = [
  { value: 'attended', label: 'Attended', icon: UserCheck, color: 'text-green-600' },
  { value: 'no_show', label: 'No Show', icon: UserX, color: 'text-red-600' },
  { value: 'rescheduled', label: 'Rescheduled', icon: Clock, color: 'text-amber-600' },
] as const

const RECOMMENDATIONS = [
  { value: 'strong_yes', label: 'Strong Yes', color: 'bg-green-600 hover:bg-green-700' },
  { value: 'yes', label: 'Yes', color: 'bg-green-500 hover:bg-green-600' },
  { value: 'maybe', label: 'Maybe', color: 'bg-amber-500 hover:bg-amber-600' },
  { value: 'no', label: 'No', color: 'bg-red-400 hover:bg-red-500' },
  { value: 'strong_no', label: 'Strong No', color: 'bg-red-600 hover:bg-red-700' },
] as const

const NEXT_STEPS = [
  { value: 'schedule_next_round', label: 'Schedule Next Round', icon: ArrowRight },
  { value: 'extend_offer', label: 'Move to Offer', icon: CheckCircle },
  { value: 'on_hold', label: 'Put on Hold', icon: Clock },
  { value: 'reject', label: 'Reject Candidate', icon: XCircle },
] as const

export function InterviewFeedbackDialog({
  open,
  onOpenChange,
  interviewId,
  candidateName,
  jobTitle,
  interviewType,
  roundNumber,
  scheduledDate,
  daysSinceInterview = 0,
  onSuccess,
}: InterviewFeedbackDialogProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<InterviewFeedbackFormData>({
    resolver: zodResolver(interviewFeedbackSchema),
    defaultValues: {
      attendanceStatus: 'attended',
      rating: 3,
      recommendation: 'maybe',
      feedback: '',
      technicalRating: undefined,
      communicationRating: undefined,
      cultureFitRating: undefined,
      strengths: '',
      concerns: '',
      nextSteps: undefined,
    },
    mode: 'onChange',
  })

  const attendanceStatus = watch('attendanceStatus')
  const rating = watch('rating')
  const recommendation = watch('recommendation')
  const feedback = watch('feedback')
  const technicalRating = watch('technicalRating')
  const communicationRating = watch('communicationRating')
  const cultureFitRating = watch('cultureFitRating')
  const nextSteps = watch('nextSteps')

  const feedbackMutation = trpc.ats.interviews.addFeedback.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Feedback submitted',
        description: `Interview feedback recorded: ${result.recommendation.replace(/_/g, ' ')}`,
      })
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit feedback',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: InterviewFeedbackFormData) => {
    feedbackMutation.mutate({
      interviewId,
      attendanceStatus: data.attendanceStatus,
      rating: data.rating,
      recommendation: data.recommendation,
      feedback: data.feedback,
      technicalRating: data.technicalRating,
      communicationRating: data.communicationRating,
      cultureFitRating: data.cultureFitRating,
      strengths: data.strengths || undefined,
      concerns: data.concerns || undefined,
      nextSteps: data.nextSteps,
    })
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const renderStarRating = (
    value: number | undefined,
    onChange: (value: number) => void,
    label: string
  ) => (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5"
          >
            <Star
              className={cn(
                'w-5 h-5 transition-colors',
                (value ?? 0) >= star
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-charcoal-300'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-500" />
            Interview Feedback
          </DialogTitle>
          <DialogDescription>
            Record feedback for{' '}
            <span className="font-medium text-charcoal-900">{candidateName}</span>&apos;s{' '}
            Round {roundNumber} {interviewType.replace(/_/g, ' ')} for{' '}
            <span className="font-medium text-charcoal-900">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Overdue Warning */}
        {daysSinceInterview > 2 && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg p-3 text-sm',
              daysSinceInterview > 5
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            )}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>
              Interview was {daysSinceInterview} days ago -{' '}
              {daysSinceInterview > 5 ? 'Urgently needs feedback' : 'Feedback overdue'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Attendance Status */}
          <div className="space-y-2">
            <Label>Attendance Status *</Label>
            <div className="flex gap-2">
              {ATTENDANCE_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = attendanceStatus === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('attendanceStatus', option.value)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                      isSelected
                        ? 'border-hublot-900 bg-hublot-50'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isSelected ? option.color : 'text-charcoal-400')} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Only show rest of form if attended */}
          {attendanceStatus === 'attended' && (
            <>
              {/* Overall Rating */}
              <div className="space-y-2">
                <Label>Overall Rating *</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-colors',
                          rating >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-charcoal-300'
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-charcoal-500 self-center">
                    {rating}/5
                  </span>
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-2">
                <Label>Recommendation *</Label>
                <div className="flex flex-wrap gap-2">
                  {RECOMMENDATIONS.map((rec) => (
                    <Button
                      key={rec.value}
                      type="button"
                      size="sm"
                      variant={recommendation === rec.value ? 'default' : 'outline'}
                      className={cn(
                        recommendation === rec.value && rec.color,
                        'min-w-20'
                      )}
                      onClick={() => setValue('recommendation', rec.value)}
                    >
                      {rec.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Detailed Ratings */}
              <Card className="bg-cream">
                <CardContent className="py-4">
                  <div className="grid grid-cols-3 gap-4">
                    {renderStarRating(
                      technicalRating,
                      (v) => setValue('technicalRating', v),
                      'Technical'
                    )}
                    {renderStarRating(
                      communicationRating,
                      (v) => setValue('communicationRating', v),
                      'Communication'
                    )}
                    {renderStarRating(
                      cultureFitRating,
                      (v) => setValue('cultureFitRating', v),
                      'Culture Fit'
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  Interview Feedback *{' '}
                  <span className="font-normal text-charcoal-400">(10-2000 chars)</span>
                </Label>
                <Textarea
                  id="feedback"
                  {...register('feedback')}
                  placeholder="Describe the interview, candidate's responses, and your observations..."
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-xs">
                  {errors.feedback ? (
                    <span className="text-red-500">{errors.feedback.message}</span>
                  ) : (
                    <span className="text-charcoal-500">Be specific and objective</span>
                  )}
                  <span
                    className={cn(
                      feedback.length < 10 ? 'text-red-500' : 'text-charcoal-400'
                    )}
                  >
                    {feedback.length}/2000
                  </span>
                </div>
              </div>

              {/* Strengths & Concerns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strengths" className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    Strengths
                  </Label>
                  <Textarea
                    id="strengths"
                    {...register('strengths')}
                    placeholder="Key strengths observed..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concerns" className="flex items-center gap-1">
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                    Concerns
                  </Label>
                  <Textarea
                    id="concerns"
                    {...register('concerns')}
                    placeholder="Areas of concern..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-2 border-t pt-4">
                <Label>Suggested Next Steps</Label>
                <div className="grid grid-cols-2 gap-2">
                  {NEXT_STEPS.map((step) => {
                    const Icon = step.icon
                    const isSelected = nextSteps === step.value
                    return (
                      <button
                        key={step.value}
                        type="button"
                        onClick={() => setValue('nextSteps', isSelected ? undefined : step.value)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border transition-all text-left',
                          isSelected
                            ? 'border-hublot-900 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300',
                          step.value === 'reject' && isSelected && 'border-red-500 bg-red-50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4',
                            step.value === 'reject'
                              ? 'text-red-600'
                              : step.value === 'extend_offer'
                              ? 'text-green-600'
                              : 'text-charcoal-600'
                          )}
                        />
                        <span className="text-sm font-medium">{step.label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-charcoal-500">
                  This will update the submission status accordingly
                </p>
              </div>
            </>
          )}

          {/* Minimal form for no-show */}
          {attendanceStatus === 'no_show' && (
            <div className="space-y-2">
              <Label htmlFor="feedback">
                No Show Notes *
              </Label>
              <Textarea
                id="feedback"
                {...register('feedback')}
                placeholder="Document the no-show situation, any communication attempts..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Minimal form for rescheduled */}
          {attendanceStatus === 'rescheduled' && (
            <div className="space-y-2">
              <Label htmlFor="feedback">
                Reschedule Notes *
              </Label>
              <Textarea
                id="feedback"
                {...register('feedback')}
                placeholder="Reason for reschedule, new proposed times..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={feedbackMutation.isPending || !isValid}
            >
              {feedbackMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
