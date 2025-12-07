'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Megaphone,
  Users,
  Mail,
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Linkedin,
  Phone,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const campaignFormSchema = z.object({
  // Step 1: Campaign Setup
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  campaignType: z.enum(['lead_generation', 're_engagement', 'event_promotion', 'brand_awareness', 'candidate_sourcing']),
  goal: z.enum(['generate_qualified_leads', 'book_discovery_meetings', 'drive_event_registrations', 'build_brand_awareness', 'expand_candidate_pool']),
  description: z.string().optional(),
  // Step 2: Target Audience
  audienceSource: z.enum(['new_prospects', 'existing_leads', 'dormant_accounts', 'import_list']),
  industries: z.array(z.string()).optional(),
  companySizes: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  fundingStages: z.array(z.string()).optional(),
  targetTitles: z.array(z.string()).optional(),
  excludeExistingClients: z.boolean(),
  excludeRecentlyContacted: z.number(),
  excludeCompetitors: z.boolean(),
  // Step 3: Channels & Sequences
  channels: z.array(z.enum(['linkedin', 'email', 'phone', 'event', 'direct_mail'])).min(1, 'Select at least one channel'),
  emailSteps: z.number().min(1).max(10),
  emailDaysBetween: z.number().min(1).max(14),
  linkedinSteps: z.number().min(1).max(5),
  linkedinDaysBetween: z.number().min(1).max(14),
  stopOnReply: z.boolean(),
  stopOnBooking: z.boolean(),
  dailyLimit: z.number().min(10).max(500),
  // Step 4: Schedule & Budget
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  launchImmediately: z.boolean(),
  budgetTotal: z.number().min(0),
  targetLeads: z.number().min(0),
  targetMeetings: z.number().min(0),
  targetRevenue: z.number().min(0),
  // Step 5: Compliance
  gdpr: z.boolean(),
  canSpam: z.boolean(),
  casl: z.boolean(),
  includeUnsubscribe: z.boolean(),
})

type CampaignFormValues = z.infer<typeof campaignFormSchema>

interface EditCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  onSuccess?: () => void
}

const STEPS = [
  { id: 1, title: 'Campaign Setup', icon: Megaphone },
  { id: 2, title: 'Target Audience', icon: Users },
  { id: 3, title: 'Channels', icon: Mail },
  { id: 4, title: 'Schedule & Budget', icon: Calendar },
  { id: 5, title: 'Compliance', icon: Shield },
]

const CAMPAIGN_TYPES = [
  { value: 'lead_generation', label: 'Lead Generation', description: 'Generate new business leads' },
  { value: 're_engagement', label: 'Re-Engagement', description: 'Reconnect with cold leads' },
  { value: 'event_promotion', label: 'Event Promotion', description: 'Drive event registrations' },
  { value: 'brand_awareness', label: 'Brand Awareness', description: 'Build brand recognition' },
  { value: 'candidate_sourcing', label: 'Candidate Sourcing', description: 'Expand talent pool' },
]

const GOALS = [
  { value: 'generate_qualified_leads', label: 'Generate Qualified Leads' },
  { value: 'book_discovery_meetings', label: 'Book Discovery Meetings' },
  { value: 'drive_event_registrations', label: 'Drive Event Registrations' },
  { value: 'build_brand_awareness', label: 'Build Brand Awareness' },
  { value: 'expand_candidate_pool', label: 'Expand Candidate Pool' },
]

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
  'Professional Services', 'Telecommunications', 'Energy', 'Government', 'Education',
]

const COMPANY_SIZES = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

const REGIONS = [
  { value: 'north_america_west', label: 'North America - West' },
  { value: 'north_america_east', label: 'North America - East' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia_pacific', label: 'Asia Pacific' },
  { value: 'latam', label: 'Latin America' },
]

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'phone', label: 'Phone', icon: Phone },
]

export function EditCampaignDialog({ open, onOpenChange, campaignId, onSuccess }: EditCampaignDialogProps) {
  const [step, setStep] = useState(1)
  const [titleInput, setTitleInput] = useState('')

  const { data: campaign, isLoading: isLoadingCampaign } = trpc.crm.campaigns.getById.useQuery(
    { id: campaignId },
    { enabled: open && !!campaignId }
  )

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: '',
      campaignType: 'lead_generation',
      goal: 'generate_qualified_leads',
      description: '',
      audienceSource: 'new_prospects',
      industries: [],
      companySizes: [],
      regions: [],
      fundingStages: [],
      targetTitles: [],
      excludeExistingClients: true,
      excludeRecentlyContacted: 90,
      excludeCompetitors: true,
      channels: ['email'],
      emailSteps: 3,
      emailDaysBetween: 3,
      linkedinSteps: 2,
      linkedinDaysBetween: 5,
      stopOnReply: true,
      stopOnBooking: true,
      dailyLimit: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      launchImmediately: true,
      budgetTotal: 0,
      targetLeads: 50,
      targetMeetings: 10,
      targetRevenue: 0,
      gdpr: true,
      canSpam: true,
      casl: true,
      includeUnsubscribe: true,
    },
  })

  // Pre-populate form when campaign data loads
  useEffect(() => {
    if (campaign) {
      const targetCriteria = campaign.targetCriteria as {
        audienceSource?: string
        industries?: string[]
        companySizes?: string[]
        regions?: string[]
        fundingStages?: string[]
        targetTitles?: string[]
        exclusions?: {
          excludeExistingClients?: boolean
          excludeRecentlyContacted?: number
          excludeCompetitors?: boolean
        }
      } | null

      const sequences = campaign.sequences as {
        email?: { steps?: unknown[]; dailyLimit?: number; stopConditions?: string[] }
        linkedin?: { steps?: unknown[]; stopConditions?: string[] }
      } | null

      const complianceSettings = campaign.complianceSettings as {
        gdpr?: boolean
        canSpam?: boolean
        casl?: boolean
        includeUnsubscribe?: boolean
      } | null

      // Calculate email/linkedin settings from sequences
      const emailSequence = sequences?.email
      const linkedinSequence = sequences?.linkedin
      const emailSteps = emailSequence?.steps?.length ?? 3
      const linkedinSteps = linkedinSequence?.steps?.length ?? 2

      form.reset({
        name: campaign.name || '',
        campaignType: (campaign.campaign_type as CampaignFormValues['campaignType']) || 'lead_generation',
        goal: (campaign.goal as CampaignFormValues['goal']) || 'generate_qualified_leads',
        description: campaign.description || '',
        audienceSource: (targetCriteria?.audienceSource as CampaignFormValues['audienceSource']) || 'new_prospects',
        industries: targetCriteria?.industries || [],
        companySizes: targetCriteria?.companySizes || [],
        regions: targetCriteria?.regions || [],
        fundingStages: targetCriteria?.fundingStages || [],
        targetTitles: targetCriteria?.targetTitles || [],
        excludeExistingClients: targetCriteria?.exclusions?.excludeExistingClients ?? true,
        excludeRecentlyContacted: targetCriteria?.exclusions?.excludeRecentlyContacted ?? 90,
        excludeCompetitors: targetCriteria?.exclusions?.excludeCompetitors ?? true,
        channels: (campaign.channels as CampaignFormValues['channels']) || ['email'],
        emailSteps,
        emailDaysBetween: 3,
        linkedinSteps,
        linkedinDaysBetween: 5,
        stopOnReply: emailSequence?.stopConditions?.includes('reply') ?? true,
        stopOnBooking: emailSequence?.stopConditions?.includes('booking') ?? true,
        dailyLimit: emailSequence?.dailyLimit ?? 100,
        startDate: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        launchImmediately: campaign.status === 'active',
        budgetTotal: campaign.budget_total || 0,
        targetLeads: campaign.target_leads || 50,
        targetMeetings: campaign.target_meetings || 10,
        targetRevenue: campaign.target_revenue || 0,
        gdpr: complianceSettings?.gdpr ?? true,
        canSpam: complianceSettings?.canSpam ?? true,
        casl: complianceSettings?.casl ?? true,
        includeUnsubscribe: complianceSettings?.includeUnsubscribe ?? true,
      })
    }
  }, [campaign, form])

  const channels = form.watch('channels') || []
  const targetTitles = form.watch('targetTitles') || []

  const utils = trpc.useUtils()

  const updateCampaign = trpc.crm.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success('Campaign updated successfully!')
      setStep(1)
      onOpenChange(false)
      utils.crm.campaigns.getById.invalidate({ id: campaignId })
      utils.crm.campaigns.list.invalidate()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update campaign')
    },
  })

  const onSubmit = (data: CampaignFormValues) => {
    // Build sequences based on channel config
    type SequenceStep = {
      stepNumber: number
      dayOffset: number
      subject?: string
      templateId?: string
      templateName?: string
    }
    type SequenceConfig = {
      steps: SequenceStep[]
      stopConditions?: string[]
      sendTime?: string
      respectTimezone?: boolean
      dailyLimit?: number
    }
    const sequences: Record<string, SequenceConfig> = {}
    if (data.channels.includes('email')) {
      sequences.email = {
        steps: Array.from({ length: data.emailSteps }, (_, i) => ({
          stepNumber: i + 1,
          dayOffset: i * data.emailDaysBetween,
          subject: '',
          templateId: '',
        })),
        stopConditions: [
          ...(data.stopOnReply ? ['reply'] : []),
          ...(data.stopOnBooking ? ['booking'] : []),
          'unsubscribe',
        ],
        dailyLimit: data.dailyLimit,
      }
    }
    if (data.channels.includes('linkedin')) {
      sequences.linkedin = {
        steps: Array.from({ length: data.linkedinSteps }, (_, i) => ({
          stepNumber: i + 1,
          dayOffset: i * data.linkedinDaysBetween,
        })),
        stopConditions: [
          ...(data.stopOnReply ? ['reply'] : []),
          ...(data.stopOnBooking ? ['booking'] : []),
        ],
      }
    }

    updateCampaign.mutate({
      id: campaignId,
      name: data.name,
      description: data.description,
      targetCriteria: {
        audienceSource: data.audienceSource,
        industries: data.industries,
        companySizes: data.companySizes,
        regions: data.regions,
        fundingStages: data.fundingStages,
        targetTitles: data.targetTitles,
        exclusions: {
          excludeExistingClients: data.excludeExistingClients,
          excludeRecentlyContacted: data.excludeRecentlyContacted,
          excludeCompetitors: data.excludeCompetitors,
        },
      },
      channels: data.channels,
      sequences,
      startDate: data.startDate,
      endDate: data.endDate,
      budgetTotal: data.budgetTotal,
      targetLeads: data.targetLeads,
      targetMeetings: data.targetMeetings,
      targetRevenue: data.targetRevenue,
      complianceSettings: {
        gdpr: data.gdpr,
        canSpam: data.canSpam,
        casl: data.casl,
        includeUnsubscribe: data.includeUnsubscribe,
      },
    })
  }

  const nextStep = async () => {
    // Validate current step before proceeding
    const fieldsToValidate: (keyof CampaignFormValues)[] = []
    switch (step) {
      case 1:
        fieldsToValidate.push('name', 'campaignType', 'goal')
        break
      case 2:
        fieldsToValidate.push('audienceSource')
        break
      case 3:
        fieldsToValidate.push('channels')
        break
      case 4:
        fieldsToValidate.push('startDate', 'endDate')
        break
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid && step < 5) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const addTitle = () => {
    if (titleInput.trim() && !targetTitles.includes(titleInput.trim())) {
      form.setValue('targetTitles', [...targetTitles, titleInput.trim()])
      setTitleInput('')
    }
  }

  const removeTitle = (title: string) => {
    form.setValue('targetTitles', targetTitles.filter(t => t !== title))
  }

  const toggleArrayValue = (field: 'industries' | 'companySizes' | 'regions' | 'fundingStages', value: string) => {
    const current = form.watch(field) || []
    if (current.includes(value)) {
      form.setValue(field, current.filter((v: string) => v !== value))
    } else {
      form.setValue(field, [...current, value])
    }
  }

  const toggleChannel = (channel: 'email' | 'linkedin' | 'phone' | 'event' | 'direct_mail') => {
    if (channels.includes(channel)) {
      form.setValue('channels', channels.filter(c => c !== channel))
    } else {
      form.setValue('channels', [...channels, channel])
    }
  }

  if (isLoadingCampaign) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Edit Campaign</DialogTitle>
          <DialogDescription>
            Update campaign settings and configuration
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 py-4 border-b">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  step === s.id && 'bg-hublot-100',
                  step > s.id && 'text-green-600'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    step === s.id && 'bg-hublot-900 text-white',
                    step > s.id && 'bg-green-100 text-green-600',
                    step < s.id && 'bg-charcoal-100 text-charcoal-500'
                  )}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className="hidden sm:block text-sm font-medium">{s.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="w-8 h-px bg-charcoal-200 mx-2" />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Step 1: Campaign Setup */}
              {step === 1 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Q1 Tech Lead Gen Campaign" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="campaignType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Type *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            {CAMPAIGN_TYPES.map((type) => (
                              <div key={type.value} className="relative">
                                <RadioGroupItem
                                  value={type.value}
                                  id={`edit-${type.value}`}
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor={`edit-${type.value}`}
                                  className={cn(
                                    'flex flex-col p-4 border rounded-lg cursor-pointer transition-all',
                                    'hover:border-charcoal-300',
                                    'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
                                  )}
                                >
                                  <span className="font-medium">{type.label}</span>
                                  <span className="text-sm text-charcoal-500">{type.description}</span>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Goal *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GOALS.map((goal) => (
                              <SelectItem key={goal.value} value={goal.value}>
                                {goal.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the campaign objectives..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Target Audience */}
              {step === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="audienceSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audience Source *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div className="relative">
                              <RadioGroupItem value="new_prospects" id="edit-new_prospects" className="peer sr-only" />
                              <label htmlFor="edit-new_prospects" className={cn(
                                'flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-charcoal-300',
                                'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
                              )}>
                                <span className="font-medium">New Prospects</span>
                                <span className="text-sm text-charcoal-500">Build list from scratch</span>
                              </label>
                            </div>
                            <div className="relative">
                              <RadioGroupItem value="existing_leads" id="edit-existing_leads" className="peer sr-only" />
                              <label htmlFor="edit-existing_leads" className={cn(
                                'flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-charcoal-300',
                                'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
                              )}>
                                <span className="font-medium">Existing Leads</span>
                                <span className="text-sm text-charcoal-500">From your CRM</span>
                              </label>
                            </div>
                            <div className="relative">
                              <RadioGroupItem value="dormant_accounts" id="edit-dormant_accounts" className="peer sr-only" />
                              <label htmlFor="edit-dormant_accounts" className={cn(
                                'flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-charcoal-300',
                                'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
                              )}>
                                <span className="font-medium">Dormant Accounts</span>
                                <span className="text-sm text-charcoal-500">Re-engage old clients</span>
                              </label>
                            </div>
                            <div className="relative">
                              <RadioGroupItem value="import_list" id="edit-import_list" className="peer sr-only" />
                              <label htmlFor="edit-import_list" className={cn(
                                'flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-charcoal-300',
                                'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
                              )}>
                                <span className="font-medium">Import List</span>
                                <span className="text-sm text-charcoal-500">Upload CSV/Excel</span>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Industry Filters</h4>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map((industry) => {
                        const selected = (form.watch('industries') || []).includes(industry)
                        return (
                          <Badge
                            key={industry}
                            variant={selected ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleArrayValue('industries', industry)}
                          >
                            {industry}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Company Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {COMPANY_SIZES.map((size) => {
                        const selected = (form.watch('companySizes') || []).includes(size.value)
                        return (
                          <Badge
                            key={size.value}
                            variant={selected ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleArrayValue('companySizes', size.value)}
                          >
                            {size.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Regions</h4>
                    <div className="flex flex-wrap gap-2">
                      {REGIONS.map((region) => {
                        const selected = (form.watch('regions') || []).includes(region.value)
                        return (
                          <Badge
                            key={region.value}
                            variant={selected ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleArrayValue('regions', region.value)}
                          >
                            {region.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Target Titles</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., VP Engineering, CTO"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTitle()
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addTitle}>Add</Button>
                    </div>
                    {targetTitles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {targetTitles.map((title) => (
                          <Badge key={title} variant="secondary" className="flex items-center gap-1">
                            {title}
                            <button type="button" onClick={() => removeTitle(title)} className="hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h4 className="text-sm font-medium">Exclusions</h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="excludeExistingClients"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="font-normal">Exclude existing clients</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="excludeCompetitors"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="font-normal">Exclude competitors</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="excludeRecentlyContacted"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="font-normal">Exclude contacted within (days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Channels & Sequences */}
              {step === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="channels"
                    render={() => (
                      <FormItem>
                        <FormLabel>Outreach Channels *</FormLabel>
                        <FormDescription>Select channels for this campaign</FormDescription>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {CHANNEL_OPTIONS.map((channel) => {
                            const Icon = channel.icon
                            const selected = channels.includes(channel.value as 'email' | 'linkedin' | 'phone')
                            return (
                              <div
                                key={channel.value}
                                onClick={() => toggleChannel(channel.value as 'email' | 'linkedin' | 'phone')}
                                className={cn(
                                  'flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all',
                                  selected && 'border-hublot-900 bg-hublot-50',
                                  !selected && 'hover:border-charcoal-300'
                                )}
                              >
                                <Icon className={cn('w-8 h-8 mb-2', selected ? 'text-hublot-900' : 'text-charcoal-400')} />
                                <span className="font-medium">{channel.label}</span>
                              </div>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {channels.includes('email') && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email Sequence
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="emailSteps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Steps</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emailDaysBetween"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Days Between Steps</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={14}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {channels.includes('linkedin') && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Linkedin className="w-4 h-4" /> LinkedIn Sequence
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="linkedinSteps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Steps</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={5}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="linkedinDaysBetween"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Days Between Steps</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={14}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-4">
                    <h4 className="text-sm font-medium">Automation Settings</h4>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="stopOnReply"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="font-normal">Stop sequence when prospect replies</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stopOnBooking"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="font-normal">Stop sequence when meeting is booked</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dailyLimit"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="font-normal">Daily send limit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="w-24"
                                min={10}
                                max={500}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Schedule & Budget */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="launchImmediately"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between border rounded-lg p-4">
                        <div>
                          <FormLabel>Launch Immediately</FormLabel>
                          <FormDescription>Start campaign as soon as it&apos;s saved</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-4">Budget & Targets</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budgetTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Budget ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="targetRevenue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Revenue ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="targetLeads"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Leads</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="targetMeetings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Meetings</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Compliance */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">Email Compliance</h4>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="gdpr"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">GDPR Compliant</FormLabel>
                              <FormDescription>
                                Ensure compliance with EU data protection regulations
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="canSpam"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">CAN-SPAM Compliant</FormLabel>
                              <FormDescription>
                                Follow US commercial email regulations
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="casl"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">CASL Compliant</FormLabel>
                              <FormDescription>
                                Follow Canadian anti-spam legislation
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="includeUnsubscribe"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">Include Unsubscribe Link</FormLabel>
                              <FormDescription>
                                Add unsubscribe option to all emails (required)
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Important Notice</h4>
                    <p className="text-sm text-yellow-700">
                      By updating this campaign, you confirm that you have obtained proper consent
                      to contact the prospects in your target audience and will comply with all
                      applicable email marketing regulations.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-charcoal-50">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                {step < 5 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={updateCampaign.isPending}>
                    {updateCampaign.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

