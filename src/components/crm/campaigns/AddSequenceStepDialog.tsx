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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  Mail,
  Linkedin,
  Phone,
  MessageSquare,
  FileText,
  PenLine,
  Sparkles,
  ExternalLink,
  LayoutTemplate,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { EmailTemplatePicker } from './EmailTemplatePicker'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Dynamic variables for personalization
const CAMPAIGN_VARIABLES = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'full_name', label: 'Full Name' },
  { key: 'company', label: 'Company' },
  { key: 'title', label: 'Job Title' },
  { key: 'email', label: 'Email' },
  { key: 'sender_name', label: 'Your Name' },
  { key: 'sender_company', label: 'Your Company' },
]

const sequenceStepSchema = z.object({
  channel: z.enum(['email', 'linkedin', 'phone', 'sms']),
  dayOffset: z.number().int().min(0),
  subject: z.string().optional(),
  templateName: z.string().min(1, 'Step name is required'),
  templateId: z.string().optional(),
  body: z.string().optional(),
  useExistingTemplate: z.boolean().optional(),
})

type SequenceStepFormData = z.infer<typeof sequenceStepSchema>

interface EmailTemplate {
  id: string
  name: string
  slug: string
  subject: string
  preview_text?: string
  body_html: string
  body_text?: string
  category: string
  status: string
  variables_used?: string[]
}

interface AddSequenceStepDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  onSuccess?: () => void
}

const channelOptions = [
  { value: 'email', label: 'Email', icon: Mail, description: 'Automated email outreach' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, description: 'LinkedIn message or InMail' },
  { value: 'phone', label: 'Phone Call', icon: Phone, description: 'Manual call task' },
  { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message outreach' },
]

export function AddSequenceStepDialog({
  open,
  onOpenChange,
  campaignId,
  onSuccess,
}: AddSequenceStepDialogProps) {
  const utils = trpc.useUtils()
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [contentMode, setContentMode] = useState<'template' | 'custom'>('template')

  const form = useForm<SequenceStepFormData>({
    resolver: zodResolver(sequenceStepSchema),
    defaultValues: {
      channel: 'email',
      dayOffset: 1,
      subject: '',
      templateName: '',
      templateId: undefined,
      body: '',
      useExistingTemplate: true,
    },
  })

  const addStepMutation = trpc.crm.campaigns.sequence.addStep.useMutation({
    onSuccess: () => {
      toast.success('Sequence step added successfully')
      form.reset()
      setSelectedTemplate(null)
      setContentMode('template')
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
        subject: data.subject || selectedTemplate?.subject,
        templateId: selectedTemplate?.id || data.templateId,
        templateName: data.templateName || selectedTemplate?.name,
      },
    })
  }

  const handleTemplateSelect = (template: EmailTemplate | null) => {
    setSelectedTemplate(template)
    if (template) {
      form.setValue('templateId', template.id)
      form.setValue('templateName', template.name)
      form.setValue('subject', template.subject)
    } else {
      form.setValue('templateId', undefined)
      form.setValue('templateName', '')
      form.setValue('subject', '')
    }
  }

  const watchChannel = form.watch('channel')

  // Reset template when channel changes
  const handleChannelChange = (channel: string) => {
    form.setValue('channel', channel as 'email' | 'linkedin' | 'phone' | 'sms')
    setSelectedTemplate(null)
    form.setValue('templateId', undefined)
    form.setValue('subject', '')
    form.setValue('body', '')
  }

  const showTemplateSection = watchChannel === 'email' || watchChannel === 'linkedin'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-hublot-600" />
            Add Sequence Step
          </DialogTitle>
          <DialogDescription>
            Add a new step to your campaign outreach sequence
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Channel Selection - Visual Cards */}
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {channelOptions.map((option) => {
                      const isSelected = field.value === option.value
                      return (
                        <div
                          key={option.value}
                          onClick={() => handleChannelChange(option.value)}
                          className={cn(
                            'flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all',
                            isSelected
                              ? 'border-hublot-500 bg-hublot-50 ring-1 ring-hublot-500'
                              : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
                          )}
                        >
                          <div className={cn(
                            'p-2 rounded-lg',
                            isSelected ? 'bg-hublot-100' : 'bg-charcoal-100'
                          )}>
                            <option.icon className={cn(
                              'w-4 h-4',
                              isSelected ? 'text-hublot-600' : 'text-charcoal-500'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'font-medium text-sm',
                              isSelected ? 'text-hublot-700' : 'text-charcoal-700'
                            )}>
                              {option.label}
                            </p>
                            <p className="text-xs text-charcoal-500 truncate">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
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
                    <Input
                      placeholder="e.g., Initial Outreach, Follow-up #1, Re-engagement"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    A descriptive name to identify this step in your sequence
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
                  <FormLabel>Timing</FormLabel>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-charcoal-500">Wait</span>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="w-20"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <span className="text-sm text-charcoal-500">day(s) after previous step</span>
                  </div>
                  <FormDescription className="text-xs">
                    Use 0 for same day as enrollment or previous step
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Template/Content Section for email/linkedin */}
            {showTemplateSection && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">
                    {watchChannel === 'email' ? 'Email Content' : 'Message Content'}
                  </FormLabel>
                  <Tabs value={contentMode} onValueChange={(v) => setContentMode(v as 'template' | 'custom')}>
                    <TabsList className="h-8">
                      <TabsTrigger value="template" className="text-xs px-3 h-7">
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Use Template
                      </TabsTrigger>
                      <TabsTrigger value="custom" className="text-xs px-3 h-7">
                        <PenLine className="w-3.5 h-3.5 mr-1.5" />
                        Custom
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {contentMode === 'template' ? (
                  <div className="space-y-3">
                    <EmailTemplatePicker
                      value={selectedTemplate?.id}
                      onSelect={handleTemplateSelect}
                      channelType={watchChannel as 'email' | 'linkedin'}
                    />

                    {/* Link to create new template */}
                    <div className="flex items-center justify-between text-xs text-charcoal-500 pt-2">
                      <span>Don't see the right template?</span>
                      <Link
                        href="/employee/admin/email-templates/new"
                        target="_blank"
                        className="inline-flex items-center gap-1 text-hublot-600 hover:text-hublot-700 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Create new template
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Body/Content */}
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {watchChannel === 'email' ? 'Email Body' : 'Message'}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={`${watchChannel === 'email' ? 'Email body' : 'Message'} content...`}
                              rows={5}
                              className="font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Dynamic Variables Reference */}
                    <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                      <p className="text-xs font-medium text-violet-700 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Available Dynamic Fields
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {CAMPAIGN_VARIABLES.map((v) => (
                          <Badge
                            key={v.key}
                            variant="secondary"
                            className="text-xs font-mono cursor-pointer hover:bg-violet-100"
                            onClick={() => {
                              const textarea = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement
                              if (textarea) {
                                const start = textarea.selectionStart
                                const end = textarea.selectionEnd
                                const text = textarea.value
                                const newText = text.substring(0, start) + `{{${v.key}}}` + text.substring(end)
                                form.setValue('body', newText)
                                // Refocus and position cursor
                                setTimeout(() => {
                                  textarea.focus()
                                  textarea.setSelectionRange(start + v.key.length + 4, start + v.key.length + 4)
                                }, 0)
                              }
                            }}
                          >
                            {`{{${v.key}}}`}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-violet-600 mt-2">
                        Click to insert at cursor position
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Phone instructions */}
            {watchChannel === 'phone' && (
              <div className="rounded-lg border border-charcoal-200 p-4 bg-charcoal-50">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-charcoal-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-charcoal-700 text-sm">Phone Call Step</p>
                    <p className="text-sm text-charcoal-600 mt-1">
                      This will create a task for manual phone outreach. The system will:
                    </p>
                    <ul className="text-sm text-charcoal-500 mt-2 space-y-1">
                      <li>• Schedule call tasks based on timing</li>
                      <li>• Track call outcomes and dispositions</li>
                      <li>• Automatically schedule follow-ups</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* SMS content */}
            {watchChannel === 'sms' && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMS Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Message content... Keep it short (160 chars recommended)"
                        rows={3}
                        maxLength={320}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs flex justify-between">
                      <span>Use {'{first_name}'}, {'{company}'} for personalization</span>
                      <span className="text-charcoal-400">{(field.value?.length || 0)}/320</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
