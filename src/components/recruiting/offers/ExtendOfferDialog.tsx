'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Heart,
  MapPin,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays, addMonths } from 'date-fns'

// Form validation schema
const extendOfferSchema = z.object({
  // Rates
  payRate: z.number().positive('Pay rate must be positive'),
  billRate: z.number().positive('Bill rate must be positive'),
  rateType: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  overtimeRate: z.number().positive().optional().nullable(),
  // Dates
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  durationMonths: z.number().int().min(1).max(60).optional().nullable(),
  // Employment
  employmentType: z.enum(['w2', 'c2c', '1099']),
  // Benefits (W2 only)
  ptoDays: z.number().int().min(0).max(30).optional().nullable(),
  sickDays: z.number().int().min(0).max(30).optional().nullable(),
  healthInsurance: z.boolean().optional(),
  has401k: z.boolean().optional(),
  // Work Details
  workLocation: z.enum(['remote', 'onsite', 'hybrid']),
  standardHoursPerWeek: z.number().int().min(10).max(60),
  // Notes
  internalNotes: z.string().max(2000).optional(),
})

type ExtendOfferFormData = z.infer<typeof extendOfferSchema>

interface ExtendOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  candidateName: string
  jobTitle: string
  accountName: string
  jobRateMin?: number
  jobRateMax?: number
  defaultPayRate?: number
  defaultBillRate?: number
  onSuccess?: (offerId: string) => void
}

const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const EMPLOYMENT_TYPES = [
  { value: 'w2', label: 'W-2 Employee', description: 'Full employee benefits available' },
  { value: 'c2c', label: 'Corp-to-Corp', description: 'Through consulting company' },
  { value: '1099', label: '1099 Contractor', description: 'Independent contractor' },
]

const WORK_LOCATIONS = [
  { value: 'remote', label: 'Remote', icon: '🏠' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔄' },
  { value: 'onsite', label: 'On-site', icon: '🏢' },
]

const DURATION_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 9, label: '9 months' },
  { value: 12, label: '12 months' },
  { value: 18, label: '18 months' },
  { value: 24, label: '24 months' },
]

export function ExtendOfferDialog({
  open,
  onOpenChange,
  submissionId,
  candidateName,
  jobTitle,
  accountName,
  jobRateMin = 0,
  jobRateMax = 0,
  defaultPayRate,
  defaultBillRate,
  onSuccess,
}: ExtendOfferDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'rates' | 'dates' | 'benefits'>('rates')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ExtendOfferFormData>({
    resolver: zodResolver(extendOfferSchema),
    defaultValues: {
      payRate: defaultPayRate || (jobRateMin > 0 ? Math.round(jobRateMin * 0.8) : 0),
      billRate: defaultBillRate || (jobRateMin > 0 ? jobRateMin : 0),
      rateType: 'hourly',
      overtimeRate: null,
      startDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      endDate: '',
      durationMonths: 6,
      employmentType: 'w2',
      ptoDays: 10,
      sickDays: 5,
      healthInsurance: true,
      has401k: false,
      workLocation: 'remote',
      standardHoursPerWeek: 40,
      internalNotes: '',
    },
    mode: 'onChange',
  })

  const payRate = watch('payRate')
  const billRate = watch('billRate')
  const rateType = watch('rateType')
  const employmentType = watch('employmentType')
  const startDate = watch('startDate')
  const durationMonths = watch('durationMonths')
  const workLocation = watch('workLocation')

  // Calculate margin
  const marginAmount = billRate - payRate
  const marginPercent = billRate > 0 ? ((marginAmount / billRate) * 100).toFixed(1) : '0.0'
  const isLowMargin = parseFloat(marginPercent) < 15
  const isBelowMinimum = parseFloat(marginPercent) < 10

  // Auto-calculate end date from duration
  useEffect(() => {
    if (startDate && durationMonths) {
      const start = new Date(startDate)
      const end = addMonths(start, durationMonths)
      setValue('endDate', format(end, 'yyyy-MM-dd'))
    }
  }, [startDate, durationMonths, setValue])

  const createOfferMutation = trpc.ats.offers.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Offer created successfully',
        description: `Draft offer created for ${candidateName}. Ready to send.`,
      })
      reset()
      setActiveTab('rates')
      onOpenChange(false)
      onSuccess?.(data.offerId)
    },
    onError: (error) => {
      toast({
        title: 'Failed to create offer',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: ExtendOfferFormData) => {
    createOfferMutation.mutate({
      submissionId,
      payRate: data.payRate,
      billRate: data.billRate,
      rateType: data.rateType,
      overtimeRate: data.overtimeRate ?? undefined,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      durationMonths: data.durationMonths ?? undefined,
      employmentType: data.employmentType,
      ptoDays: data.ptoDays ?? undefined,
      sickDays: data.sickDays ?? undefined,
      healthInsurance: data.healthInsurance,
      has401k: data.has401k,
      workLocation: data.workLocation,
      standardHoursPerWeek: data.standardHoursPerWeek,
      internalNotes: data.internalNotes || undefined,
    })
  }

  const handleClose = () => {
    reset()
    setActiveTab('rates')
    onOpenChange(false)
  }

  const isW2 = employmentType === 'w2'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold-500" />
            Extend Offer
          </DialogTitle>
          <DialogDescription>
            Create an offer for <span className="font-medium text-charcoal-900">{candidateName}</span> at{' '}
            <span className="font-medium text-charcoal-900">{accountName}</span> for{' '}
            <span className="font-medium text-charcoal-900">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rates' | 'dates' | 'benefits')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rates" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Rates
              </TabsTrigger>
              <TabsTrigger value="dates" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="benefits" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Benefits
              </TabsTrigger>
            </TabsList>

            {/* Rates Tab */}
            <TabsContent value="rates" className="space-y-4 pt-4">
              {/* Job Rate Range Hint */}
              {jobRateMin > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job rate range: ${jobRateMin} - ${jobRateMax}/{rateType === 'hourly' ? 'hr' : rateType}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payRate">Pay Rate *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-charcoal-500">$</span>
                    <Input
                      id="payRate"
                      type="number"
                      step="0.01"
                      {...register('payRate', { valueAsNumber: true })}
                      className="pl-7"
                      placeholder="75.00"
                    />
                  </div>
                  {errors.payRate && (
                    <p className="text-sm text-red-500">{errors.payRate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billRate">Bill Rate *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-charcoal-500">$</span>
                    <Input
                      id="billRate"
                      type="number"
                      step="0.01"
                      {...register('billRate', { valueAsNumber: true })}
                      className="pl-7"
                      placeholder="95.00"
                    />
                  </div>
                  {errors.billRate && (
                    <p className="text-sm text-red-500">{errors.billRate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateType">Rate Type</Label>
                  <Select
                    value={rateType}
                    onValueChange={(v) => setValue('rateType', v as 'hourly' | 'daily' | 'weekly' | 'monthly')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RATE_TYPES.map((rt) => (
                        <SelectItem key={rt.value} value={rt.value}>
                          {rt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtimeRate">Overtime Rate (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-charcoal-500">$</span>
                    <Input
                      id="overtimeRate"
                      type="number"
                      step="0.01"
                      {...register('overtimeRate', { valueAsNumber: true })}
                      className="pl-7"
                      placeholder="112.50"
                    />
                  </div>
                </div>
              </div>

              {/* Margin Preview */}
              <Card className={cn('bg-cream', isBelowMinimum && 'border-red-300 bg-red-50')}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-charcoal-500">Gross Margin</span>
                      <div className="text-xl font-bold text-charcoal-900">
                        ${marginAmount.toFixed(2)}/{rateType === 'hourly' ? 'hr' : rateType} ({marginPercent}%)
                      </div>
                    </div>
                    <Badge
                      variant={
                        parseFloat(marginPercent) >= 20
                          ? 'default'
                          : parseFloat(marginPercent) >= 15
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {parseFloat(marginPercent) >= 20
                        ? 'Excellent'
                        : parseFloat(marginPercent) >= 15
                        ? 'Good'
                        : parseFloat(marginPercent) >= 10
                        ? 'Low'
                        : 'Below Minimum'}
                    </Badge>
                  </div>
                  {isBelowMinimum && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Margin below 10% requires manager approval
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Employment Type */}
              <div className="space-y-2">
                <Label>Employment Type *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {EMPLOYMENT_TYPES.map((et) => (
                    <button
                      key={et.value}
                      type="button"
                      onClick={() => setValue('employmentType', et.value as 'w2' | 'c2c' | '1099')}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-colors',
                        employmentType === et.value
                          ? 'border-hublot-900 bg-hublot-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <div className="font-medium text-charcoal-900 text-sm">{et.label}</div>
                      <div className="text-xs text-charcoal-500">{et.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="dates" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationMonths">Contract Duration</Label>
                  <Select
                    value={durationMonths?.toString() || ''}
                    onValueChange={(v) => setValue('durationMonths', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value.toString()}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Auto-calculated)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className="bg-charcoal-50"
                />
                <p className="text-xs text-charcoal-500">
                  Calculated from start date + duration. Can be adjusted manually.
                </p>
              </div>

              {/* Work Location */}
              <div className="space-y-2">
                <Label>Work Location *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {WORK_LOCATIONS.map((wl) => (
                    <button
                      key={wl.value}
                      type="button"
                      onClick={() => setValue('workLocation', wl.value as 'remote' | 'hybrid' | 'onsite')}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-colors',
                        workLocation === wl.value
                          ? 'border-hublot-900 bg-hublot-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <span className="text-2xl">{wl.icon}</span>
                      <div className="font-medium text-charcoal-900 text-sm mt-1">{wl.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="standardHoursPerWeek">Standard Hours/Week</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-charcoal-500" />
                  <Input
                    id="standardHoursPerWeek"
                    type="number"
                    {...register('standardHoursPerWeek', { valueAsNumber: true })}
                    className="w-24"
                    min={10}
                    max={60}
                  />
                  <span className="text-charcoal-500">hours</span>
                </div>
              </div>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-4 pt-4">
              {!isW2 && (
                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Benefits are typically only available for W-2 employees
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Paid Time Off</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ptoDays">PTO Days/Year</Label>
                      <Input
                        id="ptoDays"
                        type="number"
                        {...register('ptoDays', { valueAsNumber: true })}
                        disabled={!isW2}
                        min={0}
                        max={30}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sickDays">Sick Days/Year</Label>
                      <Input
                        id="sickDays"
                        type="number"
                        {...register('sickDays', { valueAsNumber: true })}
                        disabled={!isW2}
                        min={0}
                        max={30}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Health & Retirement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Health Insurance</Label>
                      <p className="text-sm text-charcoal-500">Medical, dental, vision coverage</p>
                    </div>
                    <Switch
                      checked={watch('healthInsurance')}
                      onCheckedChange={(checked) => setValue('healthInsurance', checked)}
                      disabled={!isW2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>401(k) Retirement Plan</Label>
                      <p className="text-sm text-charcoal-500">With company match (if eligible)</p>
                    </div>
                    <Switch
                      checked={watch('has401k')}
                      onCheckedChange={(checked) => setValue('has401k', checked)}
                      disabled={!isW2}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <Textarea
                  id="internalNotes"
                  {...register('internalNotes')}
                  placeholder="Rate negotiation notes, special terms, etc..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-charcoal-500">Not visible to candidate or client</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Summary Card */}
          <Card className="bg-cream">
            <CardContent className="py-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xs text-charcoal-500">Pay Rate</div>
                  <div className="font-semibold text-charcoal-900">${payRate}/{rateType === 'hourly' ? 'hr' : rateType}</div>
                </div>
                <div>
                  <div className="text-xs text-charcoal-500">Bill Rate</div>
                  <div className="font-semibold text-charcoal-900">${billRate}/{rateType === 'hourly' ? 'hr' : rateType}</div>
                </div>
                <div>
                  <div className="text-xs text-charcoal-500">Margin</div>
                  <div className={cn('font-semibold', isBelowMinimum ? 'text-red-600' : 'text-green-600')}>
                    {marginPercent}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-charcoal-500">Duration</div>
                  <div className="font-semibold text-charcoal-900">{durationMonths} mo</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOfferMutation.isPending || !isValid || isBelowMinimum}
            >
              {createOfferMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Draft Offer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
