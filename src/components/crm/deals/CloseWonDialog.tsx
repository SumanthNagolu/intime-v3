'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, PlusCircle, Trash2, Trophy, DollarSign, Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

const confirmedRoleSchema = z.object({
  title: z.string().min(1),
  quantity: z.number().min(1),
  billRate: z.number().min(0),
  startDate: z.string().optional(),
})

const closeWonSchema = z.object({
  // Contract details
  finalValue: z.number().min(0, 'Final value is required'),
  contractSignedDate: z.date(),
  contractStartDate: z.date(),
  contractDurationMonths: z.number().min(1).max(120),
  contractType: z.enum(['msa', 'sow', 'po', 'email']),
  paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60']),
  billingFrequency: z.enum(['weekly', 'biweekly', 'monthly']),
  // Billing contact
  billingContactName: z.string().optional(),
  billingContactEmail: z.string().email().optional().or(z.literal('')),
  billingContactPhone: z.string().optional(),
  // Win details
  winReason: z.enum(['price_value', 'expertise_speed', 'relationship_trust', 'candidate_quality', 'response_time', 'other']),
  winDetails: z.string().optional(),
  // Account creation
  createAccount: z.boolean().default(false),
  accountName: z.string().optional(),
  accountIndustry: z.string().optional(),
  // Commission
  marginPercentage: z.number().min(0).max(100),
  commissionPercentage: z.number().min(0).max(100),
})

type CloseWonFormValues = z.infer<typeof closeWonSchema>

interface CloseWonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: {
    id: string
    name: string
    value?: number
    account?: { id: string; name: string } | null
    lead?: { company_name?: string } | null
    roles_breakdown?: Array<{ title: string; quantity: number; minRate?: number; maxRate?: number }> | null
    contract_length_months?: number | null
    competitors?: string[] | null
  }
  onSuccess?: () => void
}

const contractTypes = [
  { value: 'msa', label: 'Master Service Agreement (MSA)' },
  { value: 'sow', label: 'Statement of Work (SOW)' },
  { value: 'po', label: 'Purchase Order (PO)' },
  { value: 'email', label: 'Email Confirmation' },
]

const paymentTermsOptions = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
]

const billingFrequencyOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const winReasons = [
  { value: 'price_value', label: 'Price / Value Proposition' },
  { value: 'expertise_speed', label: 'Expertise & Speed' },
  { value: 'relationship_trust', label: 'Relationship & Trust' },
  { value: 'candidate_quality', label: 'Candidate Quality' },
  { value: 'response_time', label: 'Response Time' },
  { value: 'other', label: 'Other' },
]

export function CloseWonDialog({
  open,
  onOpenChange,
  deal,
  onSuccess,
}: CloseWonDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [confirmedRoles, setConfirmedRoles] = React.useState<z.infer<typeof confirmedRoleSchema>[]>(
    deal.roles_breakdown?.map(r => ({
      title: r.title,
      quantity: r.quantity,
      billRate: r.maxRate || r.minRate || 75,
    })) || []
  )
  const [competitorsBeat, setCompetitorsBeat] = React.useState<string[]>(deal.competitors || [])
  const [step, setStep] = React.useState(1)

  const form = useForm<CloseWonFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(closeWonSchema) as any,
    defaultValues: {
      finalValue: deal.value || 0,
      contractSignedDate: new Date(),
      contractStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      contractDurationMonths: deal.contract_length_months || 12,
      contractType: 'msa',
      paymentTerms: 'net_30',
      billingFrequency: 'biweekly',
      winReason: 'expertise_speed',
      createAccount: !deal.account,
      accountName: deal.lead?.company_name || deal.name,
      marginPercentage: 20,
      commissionPercentage: 5,
    },
  })

  const closeWon = trpc.crm.deals.closeWon.useMutation({
    onSuccess: () => {
      toast({
        title: 'Deal Closed Won!',
        description: `Congratulations! "${deal.name}" has been marked as won.`,
      })
      utils.crm.deals.list.invalidate()
      utils.crm.deals.pipeline.invalidate()
      utils.crm.deals.getById.invalidate({ id: deal.id })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: CloseWonFormValues) => {
    closeWon.mutate({
      id: deal.id,
      finalValue: data.finalValue,
      contractSignedDate: format(data.contractSignedDate, 'yyyy-MM-dd'),
      contractStartDate: format(data.contractStartDate, 'yyyy-MM-dd'),
      contractDurationMonths: data.contractDurationMonths,
      contractType: data.contractType,
      paymentTerms: data.paymentTerms,
      billingFrequency: data.billingFrequency,
      billingContactName: data.billingContactName,
      billingContactEmail: data.billingContactEmail || undefined,
      billingContactPhone: data.billingContactPhone,
      confirmedRoles: confirmedRoles.length > 0 ? confirmedRoles : undefined,
      winReason: data.winReason,
      winDetails: data.winDetails,
      competitorsBeat: competitorsBeat.length > 0 ? competitorsBeat : undefined,
      createAccount: data.createAccount,
      accountName: data.accountName,
      accountIndustry: data.accountIndustry,
      marginPercentage: data.marginPercentage,
      commissionPercentage: data.commissionPercentage,
    })
  }

  const addRole = () => {
    setConfirmedRoles([...confirmedRoles, { title: '', quantity: 1, billRate: 75 }])
  }

  const updateRole = (index: number, field: string, value: unknown) => {
    const newRoles = [...confirmedRoles]
    newRoles[index] = { ...newRoles[index], [field]: value }
    setConfirmedRoles(newRoles)
  }

  const removeRole = (index: number) => {
    setConfirmedRoles(confirmedRoles.filter((_, i) => i !== index))
  }

  const toggleCompetitor = (competitor: string) => {
    setCompetitorsBeat(prev =>
      prev.includes(competitor)
        ? prev.filter(c => c !== competitor)
        : [...prev, competitor]
    )
  }

  // Calculate projected commission
  const finalValue = form.watch('finalValue') || 0
  const marginPct = form.watch('marginPercentage') || 0
  const commissionPct = form.watch('commissionPercentage') || 0
  const grossMargin = finalValue * (marginPct / 100)
  const projectedCommission = grossMargin * (commissionPct / 100)

  const createAccount = form.watch('createAccount')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg uppercase tracking-wider">
                Close Deal as Won
              </DialogTitle>
              <DialogDescription>
                {deal.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 pb-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  className={cn(
                    'w-8 h-8 rounded-full text-sm font-medium transition-colors',
                    step === s
                      ? 'bg-green-600 text-white'
                      : step > s
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Step 1: Contract Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Contract Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="finalValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Deal Value ($) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-9"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractDurationMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (months)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={120}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 12)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractSignedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Signed Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contractTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentTermsOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="billingFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {billingFrequencyOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Confirmed Roles */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Confirmed Roles</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addRole}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Role
                    </Button>
                  </div>

                  {confirmedRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-3 border rounded-lg border-dashed">
                      No roles confirmed yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {confirmedRoles.map((role, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                          <Input
                            className="flex-1"
                            placeholder="Title"
                            value={role.title}
                            onChange={(e) => updateRole(index, 'title', e.target.value)}
                          />
                          <Input
                            className="w-16"
                            type="number"
                            min={1}
                            value={role.quantity}
                            onChange={(e) => updateRole(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                          <Input
                            className="w-24"
                            type="number"
                            placeholder="Bill Rate"
                            value={role.billRate}
                            onChange={(e) => updateRole(index, 'billRate', parseFloat(e.target.value) || 0)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRole(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Win Details & Account */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Win Details
                </h3>

                <FormField
                  control={form.control}
                  name="winReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Win Reason *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {winReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
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
                  name="winDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Win Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What specifically helped us win this deal?"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {deal.competitors && deal.competitors.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Competitors Beat</label>
                    <div className="flex flex-wrap gap-2">
                      {deal.competitors.map((competitor) => (
                        <label
                          key={competitor}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                            competitorsBeat.includes(competitor)
                              ? 'bg-green-50 border-green-300'
                              : 'bg-white hover:bg-muted/50'
                          )}
                        >
                          <Checkbox
                            checked={competitorsBeat.includes(competitor)}
                            onCheckedChange={() => toggleCompetitor(competitor)}
                          />
                          <span className="text-sm">{competitor}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Account Creation */}
                {!deal.account && (
                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="createAccount"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <FormLabel className="cursor-pointer">Create New Account</FormLabel>
                            </div>
                            <FormDescription>
                              Create a client account from this won deal
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {createAccount && (
                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <FormField
                          control={form.control}
                          name="accountName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accountIndustry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Technology" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Billing & Commission */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Billing Contact
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="billingContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billingContactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="billing@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billingContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Commission Settings
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="marginPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gross Margin (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Margin: ${grossMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commissionPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Commission: ${projectedCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-3">Deal Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-green-600">Deal Value</p>
                        <p className="text-xl font-bold text-green-800">
                          ${finalValue.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-600">Gross Margin</p>
                        <p className="text-xl font-bold text-green-800">
                          ${grossMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-600">Your Commission</p>
                        <p className="text-xl font-bold text-green-800">
                          ${projectedCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex justify-between">
              <div>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={() => setStep(step + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={closeWon.isPending} className="bg-green-600 hover:bg-green-700">
                    {closeWon.isPending ? 'Closing...' : 'Close as Won'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
