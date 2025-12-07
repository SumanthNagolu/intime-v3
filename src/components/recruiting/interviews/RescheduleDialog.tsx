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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Calendar, Clock, RefreshCw, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'

const rescheduleSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason (min 10 characters)').max(500),
  sendNotifications: z.boolean().default(true),
})

type RescheduleFormData = z.infer<typeof rescheduleSchema>

interface TimeSlot {
  id: string
  date: string
  time: string
}

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string
  candidateName: string
  interviewType: string
  roundNumber: number
  onSuccess?: () => void
}

export function RescheduleDialog({
  open,
  onOpenChange,
  interviewId,
  candidateName,
  interviewType,
  roundNumber,
  onSuccess,
}: RescheduleDialogProps) {
  const { toast } = useToast()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '10:00' },
  ])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      reason: '',
      sendNotifications: true,
    },
  })

  const sendNotifications = watch('sendNotifications')

  const rescheduleMutation = trpc.ats.interviews.reschedule.useMutation({
    onSuccess: () => {
      toast({
        title: 'Interview rescheduled',
        description: 'New proposed times have been sent to all participants',
      })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to reschedule',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const addTimeSlot = () => {
    if (timeSlots.length >= 5) return
    const lastSlot = timeSlots[timeSlots.length - 1]
    setTimeSlots([
      ...timeSlots,
      {
        id: String(Date.now()),
        date: lastSlot?.date || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '14:00',
      },
    ])
  }

  const removeTimeSlot = (id: string) => {
    if (timeSlots.length <= 1) return
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id))
  }

  const updateTimeSlot = (id: string, field: 'date' | 'time', value: string) => {
    setTimeSlots(
      timeSlots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    )
  }

  const onSubmit = (data: RescheduleFormData) => {
    rescheduleMutation.mutate({
      interviewId,
      reason: data.reason,
      proposedTimes: timeSlots.map((slot) => ({
        date: slot.date,
        time: slot.time,
      })),
      sendNotifications: data.sendNotifications,
    })
  }

  const handleClose = () => {
    setTimeSlots([
      { id: '1', date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '10:00' },
    ])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-600" />
            Reschedule Interview
          </DialogTitle>
          <DialogDescription>
            Propose new times for{' '}
            <span className="font-medium text-charcoal-900">{candidateName}</span>&apos;s Round{' '}
            {roundNumber} {interviewType.replace(/_/g, ' ')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Rescheduling *</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Explain why the interview needs to be rescheduled..."
              rows={3}
              className="resize-none"
            />
            {errors.reason && (
              <span className="text-sm text-red-500">{errors.reason.message}</span>
            )}
          </div>

          {/* New Time Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Proposed New Times *</Label>
              <span className="text-xs text-charcoal-500">
                {timeSlots.length}/5 slots
              </span>
            </div>

            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-cream"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-hublot-900 text-white text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                      <Input
                        type="date"
                        value={slot.date}
                        onChange={(e) => updateTimeSlot(slot.id, 'date', e.target.value)}
                        min={today}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                      <Input
                        type="time"
                        value={slot.time}
                        onChange={(e) => updateTimeSlot(slot.id, 'time', e.target.value)}
                        step={900}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeTimeSlot(slot.id)}
                    disabled={timeSlots.length <= 1}
                  >
                    <Trash2 className="w-4 h-4 text-charcoal-400" />
                  </Button>
                </div>
              ))}
            </div>

            {timeSlots.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
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
              <span className="font-medium">Send reschedule notifications</span>
              <p className="text-sm text-charcoal-500">
                Email candidate and interviewers with new proposed times
              </p>
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={rescheduleMutation.isPending}>
              {rescheduleMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reschedule Interview
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
