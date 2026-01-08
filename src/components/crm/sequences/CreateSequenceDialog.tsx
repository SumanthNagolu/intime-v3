'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Switch } from '@/components/ui/switch'
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
import { Card } from '@/components/ui/card'
import { Plus, Trash, Loader2, GripVertical, Mail, Linkedin, Phone, MessageSquare } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

const sequenceStepSchema = z.object({
  day: z.number().int().min(0),
  action: z.string(),
  subject: z.string().optional(),
  body: z.string().optional(),
})

const sequenceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  channel: z.enum(['email', 'linkedin', 'phone', 'sms']),
  steps: z.array(sequenceStepSchema).min(1, 'At least one step is required'),
  stopOnReply: z.boolean(),
  stopOnMeeting: z.boolean(),
  dailyLimit: z.number().int().min(1).max(500).optional(),
})

type SequenceFormData = z.infer<typeof sequenceSchema>

interface CreateSequenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
}

const actionOptions: Record<string, Array<{ value: string; label: string }>> = {
  email: [
    { value: 'send_email', label: 'Send Email' },
    { value: 'follow_up_email', label: 'Follow-up Email' },
    { value: 'breakup_email', label: 'Breakup Email' },
  ],
  linkedin: [
    { value: 'connection_request', label: 'Connection Request' },
    { value: 'linkedin_message', label: 'LinkedIn Message' },
    { value: 'linkedin_inmail', label: 'LinkedIn InMail' },
  ],
  phone: [
    { value: 'call', label: 'Phone Call' },
    { value: 'voicemail', label: 'Leave Voicemail' },
  ],
  sms: [
    { value: 'send_sms', label: 'Send SMS' },
  ],
}

export function CreateSequenceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSequenceDialogProps) {
  const form = useForm<SequenceFormData>({
    resolver: zodResolver(sequenceSchema),
    defaultValues: {
      name: '',
      description: '',
      channel: 'email',
      steps: [{ day: 1, action: 'send_email', subject: '', body: '' }],
      stopOnReply: true,
      stopOnMeeting: true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  })

  const createMutation = trpc.sequences.create.useMutation({
    onSuccess: () => {
      toast.success('Sequence created successfully')
      form.reset()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (data: SequenceFormData) => {
    await createMutation.mutateAsync({
      name: data.name,
      description: data.description,
      channel: data.channel,
      steps: data.steps,
      settings: {
        stopOnReply: data.stopOnReply,
        stopOnMeeting: data.stopOnMeeting,
        dailyLimit: data.dailyLimit,
      },
    })
  }

  const watchChannel = form.watch('channel')

  // Reset steps when channel changes
  const handleChannelChange = (channel: string) => {
    form.setValue('channel', channel as 'email' | 'linkedin' | 'phone' | 'sms')
    const defaultAction = actionOptions[channel]?.[0]?.value || 'send_email'
    form.setValue('steps', [{ day: 1, action: defaultAction, subject: '', body: '' }])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sequence Template</DialogTitle>
          <DialogDescription>
            Create a reusable outreach sequence for campaigns
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5-Day Email Nurture" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this sequence..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select
                      onValueChange={handleChannelChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email
                          </div>
                        </SelectItem>
                        <SelectItem value="linkedin">
                          <div className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4" /> LinkedIn
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" /> Phone
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> SMS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Sequence Steps</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    day: fields.length > 0 ? (fields[fields.length - 1].day || 0) + 2 : 1,
                    action: actionOptions[watchChannel]?.[0]?.value || 'send_email',
                    subject: '',
                    body: '',
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Step
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-charcoal-400" />
                      <span className="font-medium text-sm">Step {index + 1}</span>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.day`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Day</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.action`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Action</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {actionOptions[watchChannel]?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {(watchChannel === 'email' || watchChannel === 'linkedin') && (
                    <>
                      {watchChannel === 'email' && (
                        <FormField
                          control={form.control}
                          name={`steps.${index}.subject`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Subject Line</FormLabel>
                              <FormControl>
                                <Input placeholder="Email subject..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name={`steps.${index}.body`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              {watchChannel === 'email' ? 'Email Body' : 'Message'}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={`${watchChannel === 'email' ? 'Email body' : 'Message'}... Use {first_name}, {company} for variables`}
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </Card>
              ))}
            </div>

            {/* Settings */}
            <div className="space-y-3 pt-2 border-t border-charcoal-100">
              <FormLabel className="text-base">Stop Conditions</FormLabel>

              <FormField
                control={form.control}
                name="stopOnReply"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-normal">Stop on Reply</FormLabel>
                      <FormDescription className="text-xs">
                        Stop sequence when prospect responds
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stopOnMeeting"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-normal">Stop on Meeting Booked</FormLabel>
                      <FormDescription className="text-xs">
                        Stop sequence when meeting is scheduled
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sequence'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}













