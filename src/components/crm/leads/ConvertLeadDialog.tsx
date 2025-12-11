'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  ArrowRight,
  Plus,
  X,
  DollarSign,
  Calendar,
  Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const convertFormSchema = z.object({
  dealName: z.string().min(1, 'Deal name is required').max(200),
  dealType: z.enum(['new_business', 'expansion', 'renewal', 're_engagement']),
  dealValue: z.number().min(0, 'Value must be positive'),
  valueBasis: z.enum(['one_time', 'annual', 'monthly']),
  winProbability: z.number().min(0).max(100),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
  estimatedPlacements: z.number().optional(),
  avgBillRate: z.number().optional(),
  contractLengthMonths: z.number().optional(),
  hiringNeeds: z.string().optional(),
  rolesBreakdown: z.array(z.object({
    title: z.string(),
    quantity: z.number(),
    minRate: z.number().optional(),
    maxRate: z.number().optional(),
    priority: z.enum(['high', 'medium', 'low']).optional(),
  })).optional(),
  servicesRequired: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
  competitiveAdvantage: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().optional(),
  notes: z.string().optional(),
})

type ConvertFormValues = z.infer<typeof convertFormSchema>

interface ConvertLeadDialogProps {
  lead: {
    id: string
    company_name?: string
    first_name?: string
    last_name?: string
    estimated_value?: number
    business_need?: string
    positions_count?: number
    skills_needed?: string[]
    bant_total_score?: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (deal: any) => void
}

export function ConvertLeadDialog({ lead, open, onOpenChange, onSuccess }: ConvertLeadDialogProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [roleInput, setRoleInput] = useState({ title: '', quantity: 1 })

  const leadName = lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'

  // Calculate default close date (90 days from now)
  const defaultCloseDate = new Date()
  defaultCloseDate.setDate(defaultCloseDate.getDate() + 90)

  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(convertFormSchema),
    defaultValues: {
      dealName: leadName,
      dealType: 'new_business',
      dealValue: lead.estimated_value || 0,
      valueBasis: 'one_time',
      winProbability: 20,
      expectedCloseDate: defaultCloseDate.toISOString().split('T')[0],
      estimatedPlacements: lead.positions_count,
      hiringNeeds: lead.business_need,
      rolesBreakdown: [],
      servicesRequired: [],
      competitors: [],
    },
  })

  const roles = form.watch('rolesBreakdown') || []
  const services = form.watch('servicesRequired') || []
  const competitors = form.watch('competitors') || []

  const convertLead = trpc.unifiedContacts.leads.convertToDeal.useMutation({
    onSuccess: (deal) => {
      toast.success('Lead converted to deal successfully')
      utils.unifiedContacts.leads.list.invalidate()
      utils.unifiedContacts.leads.stats.invalidate()
      utils.crm.deals.list.invalidate()
      utils.crm.deals.pipeline.invalidate()
      onOpenChange(false)
      onSuccess?.(deal)
      // Navigate to the new deal
      router.push(`/employee/crm/deals/${deal.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to convert lead')
    },
  })

  const onSubmit = (data: ConvertFormValues) => {
    convertLead.mutate({
      leadId: lead.id,
      ...data,
    })
  }

  const addRole = () => {
    if (roleInput.title.trim()) {
      form.setValue('rolesBreakdown', [
        ...roles,
        {
          title: roleInput.title.trim(),
          quantity: roleInput.quantity,
          priority: 'medium',
        },
      ])
      setRoleInput({ title: '', quantity: 1 })
    }
  }

  const removeRole = (index: number) => {
    form.setValue('rolesBreakdown', roles.filter((_, i) => i !== index))
  }

  const addService = (service: string) => {
    if (!services.includes(service)) {
      form.setValue('servicesRequired', [...services, service])
    }
  }

  const removeService = (service: string) => {
    form.setValue('servicesRequired', services.filter((s) => s !== service))
  }

  const addCompetitor = (competitor: string) => {
    if (competitor.trim() && !competitors.includes(competitor.trim())) {
      form.setValue('competitors', [...competitors, competitor.trim()])
    }
  }

  const removeCompetitor = (competitor: string) => {
    form.setValue('competitors', competitors.filter((c) => c !== competitor))
  }

  // Calculate deal value from roles
  const calculateDealValue = () => {
    const avgRate = form.getValues('avgBillRate') || 75
    const placements = form.getValues('estimatedPlacements') || 1
    const months = form.getValues('contractLengthMonths') || 6
    const hoursPerMonth = 173

    const value = placements * avgRate * hoursPerMonth * months
    form.setValue('dealValue', Math.round(value))
  }

  const SERVICE_OPTIONS = [
    'Contract Staffing',
    'Contract to Hire',
    'Direct Hire',
    'RPO',
    'MSP',
    'SOW/Statement of Work',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center gap-2">
            <span>Convert Lead to Deal</span>
            <ArrowRight className="w-5 h-5 text-charcoal-400" />
            <Badge variant="outline">{leadName}</Badge>
          </DialogTitle>
          <DialogDescription>
            Create a new deal opportunity from this qualified lead
          </DialogDescription>
        </DialogHeader>

        {/* Lead Summary */}
        {lead.bant_total_score && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">BANT Score</span>
              <Badge className="bg-green-500">{lead.bant_total_score}/100</Badge>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Deal Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Deal Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dealName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Acme Corp - Q1 Hiring" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new_business">New Business</SelectItem>
                          <SelectItem value="expansion">Expansion</SelectItem>
                          <SelectItem value="renewal">Renewal</SelectItem>
                          <SelectItem value="re_engagement">Re-engagement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Value & Timeline */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Value & Timeline
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dealValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Value ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valueBasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value Basis</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one_time">One-time</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="winProbability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Win Probability (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedPlacements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Placements</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avgBillRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg Bill Rate ($/hr)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractLengthMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Length (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Calculate button */}
              <Button type="button" variant="outline" size="sm" onClick={calculateDealValue}>
                Calculate Deal Value
              </Button>
            </div>

            {/* Expected Close */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Close Date & Next Steps
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expectedCloseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Close Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextActionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Action Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="nextAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Action</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Schedule proposal review meeting" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Roles Breakdown */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium">Roles Breakdown</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Role title (e.g., Senior React Developer)"
                  value={roleInput.title}
                  onChange={(e) => setRoleInput({ ...roleInput, title: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  value={roleInput.quantity}
                  onChange={(e) => setRoleInput({ ...roleInput, quantity: Number(e.target.value) || 1 })}
                  className="w-20"
                />
                <Button type="button" variant="outline" onClick={addRole}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {roles.length > 0 && (
                <div className="space-y-2">
                  {roles.map((role, index) => (
                    <div key={index} className="flex items-center gap-2 bg-charcoal-50 rounded-lg p-2">
                      <span className="flex-1 font-medium">{role.title}</span>
                      <Badge variant="outline">{role.quantity} positions</Badge>
                      <button
                        type="button"
                        onClick={() => removeRole(index)}
                        className="text-charcoal-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services Required */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium">Services Required</h4>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() =>
                      services.includes(service)
                        ? removeService(service)
                        : addService(service)
                    }
                    className={cn(
                      'px-3 py-1 rounded-full text-sm border transition-all',
                      services.includes(service)
                        ? 'bg-hublot-900 text-white border-hublot-900'
                        : 'border-charcoal-300 hover:border-charcoal-400'
                    )}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Competition */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium">Competition</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel>Known Competitors</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Competitor name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCompetitor((e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                  </div>
                  {competitors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {competitors.map((comp) => (
                        <Badge key={comp} variant="secondary" className="flex items-center gap-1">
                          {comp}
                          <button type="button" onClick={() => removeCompetitor(comp)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="competitiveAdvantage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Our Competitive Advantage</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Why we'll win this deal..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this deal..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={convertLead.isPending}>
                {convertLead.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Convert to Deal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
