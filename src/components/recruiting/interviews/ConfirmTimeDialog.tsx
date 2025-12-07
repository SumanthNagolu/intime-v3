'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Calendar, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface ProposedTime {
  id: string
  proposedDate: string
  proposedTime: string
  timezone: string
  status: string
}

interface ConfirmTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string
  proposedTimes: ProposedTime[]
  candidateName: string
  interviewType: string
  roundNumber: number
  onSuccess?: () => void
}

export function ConfirmTimeDialog({
  open,
  onOpenChange,
  interviewId,
  proposedTimes,
  candidateName,
  interviewType,
  roundNumber,
  onSuccess,
}: ConfirmTimeDialogProps) {
  const { toast } = useToast()
  const [selectedTimeId, setSelectedTimeId] = useState<string>('')

  const confirmMutation = trpc.ats.interviews.confirm.useMutation({
    onSuccess: () => {
      toast({
        title: 'Time confirmed',
        description: 'The interview time has been confirmed and invitations sent',
      })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to confirm time',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleConfirm = () => {
    if (!selectedTimeId) return
    confirmMutation.mutate({
      interviewId,
      proposedTimeId: selectedTimeId,
    })
  }

  const pendingTimes = proposedTimes.filter((t) => t.status === 'pending')

  const formatTimeSlot = (time: ProposedTime) => {
    try {
      const dateTime = parseISO(`${time.proposedDate}T${time.proposedTime}`)
      const formattedDate = format(dateTime, 'EEEE, MMMM d, yyyy')
      const formattedTime = format(dateTime, 'h:mm a')
      return { date: formattedDate, time: formattedTime }
    } catch {
      return { date: time.proposedDate, time: time.proposedTime }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Confirm Interview Time
          </DialogTitle>
          <DialogDescription>
            Select the confirmed time for{' '}
            <span className="font-medium text-charcoal-900">{candidateName}</span>&apos;s Round{' '}
            {roundNumber} {interviewType.replace(/_/g, ' ')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="mb-3 block">Select Confirmed Time</Label>
          <RadioGroup
            value={selectedTimeId}
            onValueChange={setSelectedTimeId}
            className="space-y-3"
          >
            {pendingTimes.map((time) => {
              const formatted = formatTimeSlot(time)
              return (
                <label
                  key={time.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    selectedTimeId === time.id
                      ? 'border-hublot-900 bg-hublot-50'
                      : 'border-charcoal-200 hover:border-charcoal-300'
                  )}
                >
                  <RadioGroupItem value={time.id} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-charcoal-900">
                      <Calendar className="w-4 h-4 text-charcoal-500" />
                      {formatted.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal-600 mt-1">
                      <Clock className="w-4 h-4 text-charcoal-400" />
                      {formatted.time} ({time.timezone})
                    </div>
                  </div>
                </label>
              )
            })}
          </RadioGroup>

          {pendingTimes.length === 0 && (
            <div className="text-center py-6 text-charcoal-500">
              No pending time slots available
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTimeId || confirmMutation.isPending}
          >
            {confirmMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Time
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
