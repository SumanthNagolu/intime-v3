'use client'

import { useEffect } from 'react'
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
import { Loader2, Mail, Linkedin, Phone, MessageSquare, Trash2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

const sequenceStepSchema = z.object({
  channel: z.enum(['email', 'linkedin', 'phone', 'sms']),
  stepNumber: z.number().int().min(1),
  dayOffset: z.number().int().min(0),
  subject: z.string().optional(),
  templateName: z.string().min(1, 'Step name is required'),
})

type SequenceStepFormData = z.infer<typeof sequenceStepSchema>

interface EditSequenceStepDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  step: {
    id: string
    channel: string
    stepNumber: number
    dayOffset?: number
    subject?: string
    templateName?: string
  } | null
  onSuccess?: () => void
}

const channelOptions = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
]

export function EditSequenceStepDialog({
  open,
  onOpenChange,
  campaignId,
  step,
  onSuccess,
}: EditSequenceStepDialogProps) {
  const utils = trpc.useUtils()

  const form = useForm<SequenceStepFormData>({
    resolver: zodResolver(sequenceStepSchema),
    defaultValues: {
      channel: 'email',
      stepNumber: 1,
      dayOffset: 1,
      subject: '',
      templateName: '',
    },
  })

  // Update form when step changes
  useEffect(() => {
    if (step) {
      form.reset({
        channel: step.channel as 'email' | 'linkedin' | 'phone' | 'sms',
        stepNumber: step.stepNumber,
        dayOffset: step.dayOffset ?? 1,
        subject: step.subject ?? '',
        templateName: step.templateName ?? `Step ${step.stepNumber}`,
      })
    }
  }, [step, form])

  const updateStepMutation = trpc.crm.campaigns.sequence.updateStep.useMutation({
    onSuccess: () => {
      toast.success('Sequence step updated')
      onOpenChange(false)
      utils.crm.campaigns.sequence.list.invalidate({ campaignId })
      utils.crm.campaigns.getFullEntity.invalidate({ id: campaignId })
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update step')
    },
  })

  const deleteStepMutation = trpc.crm.campaigns.sequence.deleteStep.useMutation({
    onSuccess: () => {
      toast.success('Sequence step removed')
      onOpenChange(false)
      utils.crm.campaigns.sequence.list.invalidate({ campaignId })
      utils.crm.campaigns.getFullEntity.invalidate({ id: campaignId })
      onSuccess?.()
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to remove step')
    },
  })

  const onSubmit = async (data: SequenceStepFormData) => {
    if (!step) return

    await updateStepMutation.mutateAsync({
      campaignId,
      channel: step.channel as 'email' | 'linkedin' | 'phone' | 'sms',
      stepNumber: step.stepNumber,
      updates: {
        dayOffset: data.dayOffset,
        subject: data.subject,
        templateName: data.templateName,
      },
    })
  }

  const handleDelete = async () => {
    if (!step) return

    if (confirm('Are you sure you want to remove this step?')) {
      await deleteStepMutation.mutateAsync({
        campaignId,
        channel: step.channel as 'email' | 'linkedin' | 'phone' | 'sms',
        stepNumber: step.stepNumber,
      })
    }
  }

  const watchChannel = form.watch('channel')

  if (!step) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Sequence Step</DialogTitle>
          <DialogDescription>
            Modify step {step.stepNumber} in your outreach sequence
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Channel (read-only display) */}
            <div className="space-y-2">
              <FormLabel>Channel</FormLabel>
              <div className="flex items-center gap-2 px-3 py-2 bg-charcoal-50 rounded-md border border-charcoal-200">
                {channelOptions.find(c => c.value === step.channel)?.icon && (
                  (() => {
                    const Icon = channelOptions.find(c => c.value === step.channel)!.icon
                    return <Icon className="w-4 h-4 text-charcoal-500" />
                  })()
                )}
                <span className="text-sm text-charcoal-700 capitalize">{step.channel}</span>
                <span className="text-xs text-charcoal-400 ml-auto">(cannot be changed)</span>
              </div>
            </div>

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
                    Number of days to wait after the previous step
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject (for email) */}
            {step.channel === 'email' && (
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

            <DialogFooter className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteStepMutation.isPending}
              >
                {deleteStepMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Step
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateStepMutation.isPending}>
                  {updateStepMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
