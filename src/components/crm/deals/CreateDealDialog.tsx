'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, PlusCircle, Trash2, DollarSign } from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

const roleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  quantity: z.number().min(1),
  minRate: z.number().optional(),
  maxRate: z.number().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
})

const createDealSchema = z.object({
  // Basic info
  name: z.string().min(1, 'Deal name is required').max(200),
  dealType: z.enum(['new_business', 'expansion', 'renewal', 're_engagement']),
  // Value
  value: z.number().min(0, 'Value must be positive'),
  valueBasis: z.enum(['one_time', 'annual', 'monthly']),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.date(),
  // Optional link
  accountId: z.string().uuid().optional().or(z.literal('')),
  // Deal details
  estimatedPlacements: z.number().optional(),
  avgBillRate: z.number().optional(),
  contractLengthMonths: z.number().optional(),
  hiringNeeds: z.string().optional(),
  rolesBreakdown: z.array(roleSchema).optional(),
  servicesRequired: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
  competitiveAdvantage: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.date().optional(),
  notes: z.string().optional(),
})

type CreateDealFormValues = z.infer<typeof createDealSchema>

interface CreateDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (deal: { id: string; name: string }) => void
  defaultAccountId?: string
  defaultAccountName?: string
}

const dealTypes = [
  { value: 'new_business', label: 'New Business' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'renewal', label: 'Renewal' },
  { value: 're_engagement', label: 'Re-engagement' },
]

const valueBasisOptions = [
  { value: 'one_time', label: 'One-Time' },
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
]

const serviceOptions = [
  'Contract Staffing',
  'Contract-to-Hire',
  'Direct Hire',
  'RPO',
  'MSP',
  'Project-Based',
  'Executive Search',
]

export function CreateDealDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultAccountId,
  defaultAccountName,
}: CreateDealDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [roles, setRoles] = React.useState<z.infer<typeof roleSchema>[]>([])
  const [competitorInput, setCompetitorInput] = React.useState('')
  const [competitors, setCompetitors] = React.useState<string[]>([])
  const [selectedServices, setSelectedServices] = React.useState<string[]>([])

  const form = useForm<CreateDealFormValues>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      name: '',
      dealType: 'new_business',
      value: 0,
      valueBasis: 'annual',
      probability: 20,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      accountId: defaultAccountId || '',
      estimatedPlacements: 1,
      contractLengthMonths: 12,
      hiringNeeds: '',
      notes: '',
    },
  })

  const createDeal = trpc.crm.deals.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Deal Created',
        description: `Successfully created deal: ${data.name}`,
      })
      utils.crm.deals.list.invalidate()
      utils.crm.deals.pipeline.invalidate()
      onOpenChange(false)
      form.reset()
      setRoles([])
      setCompetitors([])
      setSelectedServices([])
      onSuccess?.({ id: data.id, name: data.name })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: CreateDealFormValues) => {
    createDeal.mutate({
      name: data.name,
      dealType: data.dealType,
      value: data.value,
      valueBasis: data.valueBasis,
      probability: data.probability,
      expectedCloseDate: format(data.expectedCloseDate, 'yyyy-MM-dd'),
      accountId: data.accountId || undefined,
      estimatedPlacements: data.estimatedPlacements,
      avgBillRate: data.avgBillRate,
      contractLengthMonths: data.contractLengthMonths,
      hiringNeeds: data.hiringNeeds,
      rolesBreakdown: roles.length > 0 ? roles : undefined,
      servicesRequired: selectedServices.length > 0 ? selectedServices : undefined,
      competitors: competitors.length > 0 ? competitors : undefined,
      competitiveAdvantage: data.competitiveAdvantage,
      nextAction: data.nextAction,
      nextActionDate: data.nextActionDate ? format(data.nextActionDate, 'yyyy-MM-dd') : undefined,
      notes: data.notes,
    })
  }

  const addRole = () => {
    setRoles([...roles, { title: '', quantity: 1, priority: 'medium' }])
  }

  const updateRole = (index: number, field: keyof z.infer<typeof roleSchema>, value: unknown) => {
    const newRoles = [...roles]
    newRoles[index] = { ...newRoles[index], [field]: value }
    setRoles(newRoles)
  }

  const removeRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index))
  }

  const addCompetitor = () => {
    if (competitorInput.trim() && !competitors.includes(competitorInput.trim())) {
      setCompetitors([...competitors, competitorInput.trim()])
      setCompetitorInput('')
    }
  }

  const removeCompetitor = (competitor: string) => {
    setCompetitors(competitors.filter(c => c !== competitor))
  }

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  // Calculate estimated value from roles
  const calculateFromRoles = () => {
    if (roles.length === 0) return
    const avgBillRate = form.getValues('avgBillRate') || 75
    const months = form.getValues('contractLengthMonths') || 12
    const totalPlacements = roles.reduce((sum, r) => sum + r.quantity, 0)
    const estimatedValue = totalPlacements * avgBillRate * 160 * months // 160 hours/month
    form.setValue('value', estimatedValue)
    form.setValue('estimatedPlacements', totalPlacements)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg uppercase tracking-wider">
            Create New Deal
          </DialogTitle>
          <DialogDescription>
            Create a new sales opportunity to track through the pipeline.
            {defaultAccountName && (
              <span className="text-hublot-700 font-medium ml-1">
                For: {defaultAccountName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="roles">Roles & Services</TabsTrigger>
                <TabsTrigger value="competition">Competition</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Deal Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Acme Corp - Q1 Hiring Initiative"
                            {...field}
                          />
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
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dealTypes.map((type) => (
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
                    name="expectedCloseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Close Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
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
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Value ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-9"
                              placeholder="100000"
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
                            {valueBasisOptions.map((opt) => (
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
                    name="probability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Win Probability (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="20"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
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
                        <FormLabel>Est. Placements</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
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
                            placeholder="75"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractLengthMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Length (mo)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="hiringNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hiring Needs / Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the client's hiring needs and requirements..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Roles & Services Tab */}
              <TabsContent value="roles" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Roles Breakdown</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={calculateFromRoles}
                        disabled={roles.length === 0}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Calculate Value
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addRole}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Role
                      </Button>
                    </div>
                  </div>

                  {roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                      No roles added yet. Click &quot;Add Role&quot; to specify hiring positions.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {roles.map((role, index) => (
                        <div key={index} className="flex items-end gap-2 p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground">Title</label>
                            <Input
                              placeholder="e.g., Senior Developer"
                              value={role.title}
                              onChange={(e) => updateRole(index, 'title', e.target.value)}
                            />
                          </div>
                          <div className="w-20">
                            <label className="text-xs text-muted-foreground">Qty</label>
                            <Input
                              type="number"
                              min={1}
                              value={role.quantity}
                              onChange={(e) => updateRole(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="w-28">
                            <label className="text-xs text-muted-foreground">Min Rate</label>
                            <Input
                              type="number"
                              placeholder="$/hr"
                              value={role.minRate || ''}
                              onChange={(e) => updateRole(index, 'minRate', parseFloat(e.target.value) || undefined)}
                            />
                          </div>
                          <div className="w-28">
                            <label className="text-xs text-muted-foreground">Max Rate</label>
                            <Input
                              type="number"
                              placeholder="$/hr"
                              value={role.maxRate || ''}
                              onChange={(e) => updateRole(index, 'maxRate', parseFloat(e.target.value) || undefined)}
                            />
                          </div>
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

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Services Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((service) => (
                      <Button
                        key={service}
                        type="button"
                        variant={selectedServices.includes(service) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleService(service)}
                        className="text-xs"
                      >
                        {service}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Competition Tab */}
              <TabsContent value="competition" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Known Competitors</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter competitor name"
                      value={competitorInput}
                      onChange={(e) => setCompetitorInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                    />
                    <Button type="button" variant="outline" onClick={addCompetitor}>
                      Add
                    </Button>
                  </div>
                  {competitors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {competitors.map((competitor) => (
                        <span
                          key={competitor}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          {competitor}
                          <button
                            type="button"
                            onClick={() => removeCompetitor(competitor)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
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
                          placeholder="What makes us the best choice for this client?"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="nextAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Action</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Schedule discovery call"
                            {...field}
                          />
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes about this deal..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDeal.isPending}>
                {createDeal.isPending ? 'Creating...' : 'Create Deal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
