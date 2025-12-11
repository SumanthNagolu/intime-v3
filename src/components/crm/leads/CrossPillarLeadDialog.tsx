'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Briefcase,
  Users,
  DollarSign,
  GraduationCap,
  AlertCircle,
  Keyboard,
} from 'lucide-react'
import { toast } from 'sonner'

const crossPillarLeadSchema = z.object({
  leadType: z.enum(['ta_lead', 'bench_lead', 'sales_lead', 'academy_lead']),
  companyName: z.string().min(2, 'Company name required').max(200),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  source: z.enum([
    'candidate_call',
    'client_call',
    'job_discussion',
    'placement_followup',
    'referral',
    'networking',
    'research',
    'other',
  ]),
  sourceDetails: z.string().optional(),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']),
  estimatedValue: z.number().min(0).optional(),
  handoffNotes: z.string().optional(),
})

type CrossPillarLeadFormValues = z.infer<typeof crossPillarLeadSchema>

interface CrossPillarLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const LEAD_TYPES = [
  {
    value: 'ta_lead',
    label: 'TA Lead',
    description: 'Talent Acquisition opportunity',
    icon: Users,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'bench_lead',
    label: 'Bench Lead',
    description: 'Consultant placement opportunity',
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'sales_lead',
    label: 'Sales Lead',
    description: 'New business development',
    icon: DollarSign,
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'academy_lead',
    label: 'Academy Lead',
    description: 'Training program opportunity',
    icon: GraduationCap,
    color: 'bg-amber-100 text-amber-700',
  },
] as const

const SOURCES = [
  { value: 'candidate_call', label: 'Candidate Call' },
  { value: 'client_call', label: 'Client Call' },
  { value: 'job_discussion', label: 'Job Discussion' },
  { value: 'placement_followup', label: 'Placement Follow-up' },
  { value: 'referral', label: 'Referral' },
  { value: 'networking', label: 'Networking' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
]

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
]

export function CrossPillarLeadDialog({
  open,
  onOpenChange,
  onSuccess,
}: CrossPillarLeadDialogProps) {
  const utils = trpc.useUtils()

  const form = useForm<CrossPillarLeadFormValues>({
    resolver: zodResolver(crossPillarLeadSchema),
    defaultValues: {
      leadType: 'ta_lead',
      source: 'candidate_call',
      urgency: 'normal',
    },
  })

  const selectedType = form.watch('leadType')
  const selectedTypeInfo = LEAD_TYPES.find((t) => t.value === selectedType)

  const createLead = trpc.crm.crossPillarLeads.create.useMutation({
    onSuccess: () => {
      toast.success('Cross-pillar lead created! Points earned.')
      utils.unifiedContacts.leads.list.invalidate()
      utils.unifiedContacts.leads.stats.invalidate()
      utils.crm.crossPillarLeads.getLeaderboard.invalidate()
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create lead')
    },
  })

  const onSubmit = (data: CrossPillarLeadFormValues) => {
    createLead.mutate({
      leadType: data.leadType,
      companyName: data.companyName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone,
      description: data.description,
      source: data.source,
      sourceDetails: data.sourceDetails,
      urgency: data.urgency,
      estimatedValue: data.estimatedValue,
      handoffNotes: data.handoffNotes,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center gap-2">
            <span className="text-gold-500">+</span> Create Cross-Pillar Lead
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Quick lead creation from any context. Earn points for leads that convert!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Lead Type Selection */}
            <FormField
              control={form.control}
              name="leadType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Type *</FormLabel>
                  <FormDescription>
                    Select the business pillar this lead belongs to
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {LEAD_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = field.value === type.value
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-gold-500 bg-gold-50'
                              : 'border-charcoal-100 hover:border-charcoal-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${type.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-charcoal-900">{type.label}</p>
                              <p className="text-sm text-charcoal-500">{type.description}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company & Contact Info */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium">Company & Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Lead Details */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium">Lead Details</h4>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`What's the opportunity? e.g., "Client mentioned they're expanding their ${
                          selectedTypeInfo?.label.split(' ')[0] || 'development'
                        } team..."`}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the opportunity in detail (min 10 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How did you find this?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOURCES.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
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
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {URGENCY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={option.color}>
                                  {option.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sourceDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Details</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., During placement call with John at TechCorp"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Value ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="handoffNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handoff Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific notes for the team handling this lead..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Notes for the receiving pillar team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Points Info */}
            <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gold-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gold-800">Earn Recognition Points!</p>
                  <p className="text-sm text-gold-700 mt-1">
                    Creating cross-pillar leads helps grow the business. If this lead converts to
                    an opportunity or placement, you&apos;ll earn recognition points visible on the
                    leaderboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLead.isPending}>
                {createLead.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Lead
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
