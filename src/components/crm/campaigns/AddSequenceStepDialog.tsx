'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Loader2, Mail, Linkedin, Phone, MessageSquare } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

const sequenceStepSchema = z.object({
  channel: z.enum(['email', 'linkedin', 'phone', 'sms']),
  dayOffset: z.number().int().min(0),
  subject: z.string().optional(),
  templateName: z.string().min(1, 'Step name is required'),
  body: z.string().optional(),
})

type SequenceStepFormData = z.infer<typeof sequenceStepSchema>

interface AddSequenceStepDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  onSuccess?: () => void
}

const channelOptions = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
]

export function AddSequenceStepDialog({
  open,
  onOpenChange,
  campaignId,
  onSuccess,
}: AddSequenceStepDialogProps) {
  const utils = trpc.useUtils()

  const form = useForm<SequenceStepFormData>({
    resolver: zodResolver(sequenceStepSchema),
    defaultValues: {
      channel: 'email',
      dayOffset: 1,
      subject: '',
      templateName: '',
      body: '',
    },
  })

  const addStepMutation = trpc.crm.campaigns.sequence.addStep.useMutation({
    onSuccess: () => {
      toast.success('Sequence step added successfully')
      form.reset()
      onOpenChange(false)
      // Invalidate to refresh sequence data
      utils.crm.campaigns.sequence.list.invalidate({ campaignId })
      utils.crm.campaigns.getFullEntity.invalidate({ id: campaignId })
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add sequence step')
    },
  })

  const onSubmit = async (data: SequenceStepFormData) => {
    await addStepMutation.mutateAsync({
      campaignId,
      channel: data.channel,
      step: {
        dayOffset: data.dayOffset,
        subject: data.subject,
        templateName: data.templateName,
      },
    })
  }

  const watchChannel = form.watch('channel')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Sequence Step</DialogTitle>
          <DialogDescription>
            Add a new step to your campaign outreach sequence
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Channel Selection */}
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {channelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Step Name */}
            <FormField
              control={form.control}
              name="templateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Step Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Initial Outreach, Follow-up #1" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    A descriptive name for this step
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Day Offset */}
            <FormField
              control={form.control}
              name="dayOffset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day Offset</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Days after previous step"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Number of days to wait after the previous step (0 = same day as enrollment)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject (for email) */}
            {watchChannel === 'email' && (
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Subject line for this email..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Use {'{first_name}'}, {'{company}'} for personalization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Body/Content (for email and linkedin) */}
            {(watchChannel === 'email' || watchChannel === 'linkedin' || watchChannel === 'sms') && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchChannel === 'email' ? 'Email Body' : watchChannel === 'linkedin' ? 'Message' : 'SMS Text'}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`${watchChannel === 'email' ? 'Email body' : 'Message'} content... Use {first_name}, {company} for personalization`}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Phone instructions */}
            {watchChannel === 'phone' && (
              <div className="rounded-lg border border-charcoal-200 p-3 bg-charcoal-50">
                <p className="text-sm text-charcoal-600">
                  Phone call steps will create a task for manual outreach.
                  The system will track call outcomes and schedule follow-ups.
                </p>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addStepMutation.isPending}>
                {addStepMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Step'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
