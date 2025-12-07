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
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Pause,
  ArrowRight,
  X,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Form validation schema
const recordFeedbackSchema = z.object({
  feedbackType: z.enum(['move_forward', 'hold', 'reject']),
  feedbackSummary: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(1000, 'Feedback must be 1000 characters or less'),
  rejectionReason: z.string().max(500).optional(),
})

type RecordFeedbackFormData = z.infer<typeof recordFeedbackSchema>

interface RecordFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  candidateName: string
  jobTitle: string
  accountName: string
  currentStatus: string
  daysPending?: number
  onSuccess?: () => void
}

const FEEDBACK_TYPES = [
  {
    value: 'move_forward',
    label: 'Move Forward',
    description: 'Client wants to proceed to next stage',
    icon: ThumbsUp,
    color: 'border-green-500 bg-green-50',
    iconColor: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
  },
  {
    value: 'hold',
    label: 'Hold',
    description: 'Pending decision, keep in current stage',
    icon: Pause,
    color: 'border-amber-500 bg-amber-50',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    value: 'reject',
    label: 'Reject',
    description: 'Client passed on this candidate',
    icon: ThumbsDown,
    color: 'border-red-500 bg-red-50',
    iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
  },
] as const

const REJECTION_REASONS = [
  'Skills mismatch',
  'Experience level',
  'Rate too high',
  'Cultural fit concerns',
  'Position filled',
  'Position cancelled',
  'Better candidate found',
  'Other',
] as const

export function RecordFeedbackDialog({
  open,
  onOpenChange,
  submissionId,
  candidateName,
  jobTitle,
  accountName,
  currentStatus,
  daysPending = 0,
  onSuccess,
}: RecordFeedbackDialogProps) {
  const { toast } = useToast()
  const [selectedReason, setSelectedReason] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<RecordFeedbackFormData>({
    resolver: zodResolver(recordFeedbackSchema),
    defaultValues: {
      feedbackType: 'move_forward',
      feedbackSummary: '',
      rejectionReason: '',
    },
    mode: 'onChange',
  })

  const feedbackType = watch('feedbackType')
  const feedbackSummary = watch('feedbackSummary')

  const recordFeedbackMutation = trpc.ats.submissions.recordFeedback.useMutation({
    onSuccess: (result) => {
      const message =
        result.feedbackType === 'move_forward'
          ? `${candidateName} moved to ${result.status}`
          : result.feedbackType === 'reject'
          ? `${candidateName} marked as rejected`
          : `Feedback recorded for ${candidateName}`

      toast({
        title: 'Feedback recorded',
        description: message,
      })
      reset()
      setSelectedReason(null)
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to record feedback',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: RecordFeedbackFormData) => {
    recordFeedbackMutation.mutate({
      id: submissionId,
      feedbackType: data.feedbackType,
      feedbackSummary: data.feedbackSummary,
      rejectionReason: data.feedbackType === 'reject' ? data.rejectionReason : undefined,
    })
  }

  const handleClose = () => {
    reset()
    setSelectedReason(null)
    onOpenChange(false)
  }

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason)
    if (reason !== 'Other') {
      setValue('rejectionReason', reason)
    } else {
      setValue('rejectionReason', '')
    }
  }

  // Determine next stage based on current status
  const getNextStage = () => {
    const stageMap: Record<string, string> = {
      submitted_to_client: 'Client Review',
      client_review: 'Interview',
      client_interview: 'Offer Stage',
    }
    return stageMap[currentStatus] || 'Next Stage'
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-500" />
            Record Client Feedback
          </DialogTitle>
          <DialogDescription>
            Record feedback for{' '}
            <span className="font-medium text-charcoal-900">{candidateName}</span>&apos;s
            submission to{' '}
            <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Pending Duration Warning */}
        {daysPending > 2 && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg p-3 text-sm',
              daysPending > 3
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>
              Pending for {daysPending} days -{' '}
              {daysPending > 3 ? 'Overdue for feedback' : 'Follow up recommended'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <Label>Decision *</Label>
            <div className="grid grid-cols-3 gap-3">
              {FEEDBACK_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = feedbackType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue('feedbackType', type.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                      isSelected ? type.color : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <Icon className={cn('w-6 h-6', isSelected ? type.iconColor : 'text-charcoal-400')} />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-charcoal-900' : 'text-charcoal-600'
                      )}
                    >
                      {type.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Show next stage indicator for move_forward */}
            {feedbackType === 'move_forward' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-3 flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Will move to: {getNextStage()}
                    </p>
                    <p className="text-xs text-green-600">Status will be updated automatically</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Rejection Reason (only if reject selected) */}
          {feedbackType === 'reject' && (
            <div className="space-y-3">
              <Label>Rejection Reason</Label>
              <div className="flex flex-wrap gap-2">
                {REJECTION_REASONS.map((reason) => (
                  <Badge
                    key={reason}
                    variant={selectedReason === reason ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedReason === reason
                        ? 'bg-charcoal-900 text-white'
                        : 'hover:bg-charcoal-100'
                    )}
                    onClick={() => handleReasonSelect(reason)}
                  >
                    {reason}
                  </Badge>
                ))}
              </div>
              {selectedReason === 'Other' && (
                <Textarea
                  {...register('rejectionReason')}
                  placeholder="Describe the reason..."
                  rows={2}
                  className="resize-none"
                />
              )}
            </div>
          )}

          {/* Feedback Summary */}
          <div className="space-y-2">
            <Label htmlFor="feedbackSummary">
              Feedback Summary *{' '}
              <span className="font-normal text-charcoal-400">(10-1000 chars)</span>
            </Label>
            <Textarea
              id="feedbackSummary"
              {...register('feedbackSummary')}
              placeholder={
                feedbackType === 'move_forward'
                  ? 'What did the client like? Any specific feedback or next steps...'
                  : feedbackType === 'hold'
                  ? 'Why is this on hold? When should we follow up...'
                  : 'Detailed rejection feedback for future reference...'
              }
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs">
              {errors.feedbackSummary ? (
                <span className="text-red-500">{errors.feedbackSummary.message}</span>
              ) : (
                <span className="text-charcoal-500">Record specific client feedback</span>
              )}
              <span
                className={cn(
                  feedbackSummary.length < 10 ? 'text-red-500' : 'text-charcoal-400'
                )}
              >
                {feedbackSummary.length}/1000
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={recordFeedbackMutation.isPending || !isValid}
              className={cn(
                feedbackType === 'move_forward'
                  ? 'bg-green-600 hover:bg-green-700'
                  : feedbackType === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              )}
            >
              {recordFeedbackMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {feedbackType === 'move_forward' && <ArrowRight className="w-4 h-4 mr-2" />}
                  {feedbackType === 'hold' && <Pause className="w-4 h-4 mr-2" />}
                  {feedbackType === 'reject' && <X className="w-4 h-4 mr-2" />}
                  {feedbackType === 'move_forward'
                    ? 'Move Forward'
                    : feedbackType === 'hold'
                    ? 'Mark as Hold'
                    : 'Reject Candidate'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
