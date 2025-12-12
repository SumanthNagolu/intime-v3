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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const CANCELLATION_REASONS = [
  { value: 'candidate_withdrew', label: 'Candidate Withdrew' },
  { value: 'client_cancelled', label: 'Client Cancelled' },
  { value: 'position_filled', label: 'Position Filled' },
  { value: 'candidate_not_qualified', label: 'Candidate Not Qualified' },
  { value: 'scheduling_conflict', label: 'Scheduling Conflict' },
  { value: 'other', label: 'Other' },
] as const

const cancelSchema = z.object({
  reason: z.enum([
    'candidate_withdrew',
    'client_cancelled',
    'position_filled',
    'candidate_not_qualified',
    'scheduling_conflict',
    'other',
  ]),
  additionalNotes: z.string().max(500).optional(),
  sendNotifications: z.boolean(),
})

type CancelFormData = z.infer<typeof cancelSchema>

interface CancelInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string
  candidateName: string
  interviewType: string
  roundNumber: number
  scheduledDate?: string
  onSuccess?: () => void
}

export function CancelInterviewDialog({
  open,
  onOpenChange,
  interviewId,
  candidateName,
  interviewType,
  roundNumber,
  scheduledDate,
  onSuccess,
}: CancelInterviewDialogProps) {
  const { toast } = useToast()
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: 'scheduling_conflict',
      additionalNotes: '',
      sendNotifications: true,
    },
  })

  const reason = watch('reason')
  const sendNotifications = watch('sendNotifications')

  const cancelMutation = trpc.ats.interviews.cancel.useMutation({
    onSuccess: () => {
      toast({
        title: 'Interview cancelled',
        description: 'The interview has been cancelled and notifications sent',
      })
      setShowConfirm(false)
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to cancel interview',
        description: error.message,
        variant: 'error',
      })
      setShowConfirm(false)
    },
  })

  const onSubmit = (data: CancelFormData) => {
    // Show confirmation dialog
    setShowConfirm(true)
  }

  const confirmCancel = () => {
    cancelMutation.mutate({
      interviewId,
      reason: reason,
      notes: watch('additionalNotes') || undefined,
      notifyParticipants: watch('sendNotifications'),
    })
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Cancel Interview
            </DialogTitle>
            <DialogDescription>
              Cancel the Round {roundNumber} {interviewType.replace(/_/g, ' ')} for{' '}
              <span className="font-medium text-charcoal-900">{candidateName}</span>
              {scheduledDate && (
                <>
                  {' '}
                  scheduled for{' '}
                  <span className="font-medium text-charcoal-900">{scheduledDate}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">This action cannot be undone</p>
                <p className="text-amber-700">
                  Cancelling will notify all participants and remove the interview from
                  calendars.
                </p>
              </div>
            </div>

            {/* Reason Select */}
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason *</Label>
              <Select
                value={reason}
                onValueChange={(value: CancelFormData['reason']) =>
                  setValue('reason', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {CANCELLATION_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reason && (
                <span className="text-sm text-red-500">{errors.reason.message}</span>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                {...register('additionalNotes')}
                placeholder="Any additional context or notes..."
                rows={3}
                className="resize-none"
              />
              {errors.additionalNotes && (
                <span className="text-sm text-red-500">
                  {errors.additionalNotes.message}
                </span>
              )}
            </div>

            {/* Notification Checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-cream border">
              <Checkbox
                id="sendNotifications"
                checked={sendNotifications}
                onCheckedChange={(checked) =>
                  setValue('sendNotifications', checked as boolean)
                }
              />
              <Label htmlFor="sendNotifications" className="cursor-pointer flex-1">
                <span className="font-medium">Send cancellation notifications</span>
                <p className="text-sm text-charcoal-500">
                  Email candidate and interviewers about the cancellation
                </p>
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Keep Interview
              </Button>
              <Button type="submit" variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Interview
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel the interview for {candidateName} and notify
              all participants. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={cancelMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Interview'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
