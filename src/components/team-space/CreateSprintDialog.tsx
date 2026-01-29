'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useTeamSpace } from './TeamSpaceProvider'

const createSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required').max(100),
  goal: z.string().max(500).optional(),
  startDate: z.date(),
  endDate: z.date(),
})

type CreateSprintForm = z.infer<typeof createSprintSchema>

interface CreateSprintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSprintDialog({ open, onOpenChange }: CreateSprintDialogProps) {
  const { refetchSprints } = useTeamSpace()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultStartDate = new Date()
  const defaultEndDate = addDays(defaultStartDate, 14) // 2 week sprint

  const form = useForm<CreateSprintForm>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    },
  })

  const createSprint = trpc.sprints.create.useMutation({
    onSuccess: () => {
      refetchSprints()
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      console.error('Failed to create sprint:', error)
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = (data: CreateSprintForm) => {
    setIsSubmitting(true)
    createSprint.mutate({
      name: data.name,
      goal: data.goal || undefined,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Sprint</DialogTitle>
          <DialogDescription>
            Set up a new sprint with a goal and timeline for your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Sprint Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Sprint Name</Label>
            <Input
              id="name"
              placeholder="e.g., Sprint 23 - Q1 Feature Push"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-error-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Sprint Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">Sprint Goal (Optional)</Label>
            <Textarea
              id="goal"
              placeholder="What does success look like for this sprint?"
              rows={3}
              {...form.register('goal')}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !form.watch('startDate') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('startDate') ? (
                      format(form.watch('startDate'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch('startDate')}
                    onSelect={(date) => date && form.setValue('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !form.watch('endDate') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('endDate') ? (
                      format(form.watch('endDate'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch('endDate')}
                    onSelect={(date) => date && form.setValue('endDate', date)}
                    initialFocus
                    disabled={(date) => date < form.watch('startDate')}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Sprint
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
