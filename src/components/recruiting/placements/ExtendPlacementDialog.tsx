'use client'

import { useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addMonths, differenceInDays } from 'date-fns'

// Extension form schema
const extendPlacementSchema = z.object({
  newEndDate: z.string().min(1, 'New end date is required'),
  // Optional rate changes
  adjustRates: z.boolean(),
  newPayRate: z.number().positive().optional().nullable(),
  newBillRate: z.number().positive().optional().nullable(),
  // Extension details
  extensionReason: z.string().max(500).optional(),
  clientApproval: z.boolean(),
  clientApprovalDate: z.string().optional(),
  clientApprovalBy: z.string().max(100).optional(),
  // Notes
  internalNotes: z.string().max(2000).optional(),
})

type ExtendPlacementFormData = z.infer<typeof extendPlacementSchema>

interface ExtendPlacementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placementId: string
  candidateName: string
  jobTitle: string
  accountName: string
  currentEndDate: string
  currentPayRate: number
  currentBillRate: number
  onSuccess?: () => void
}

const EXTENSION_PRESETS = [
  { label: '1 Month', months: 1 },
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
  { label: '12 Months', months: 12 },
]

const EXTENSION_REASONS = [
  'Project extended by client',
  'Client requested continuation',
  'Candidate performance excellent',
  'Original timeline underestimated',
  'Additional scope added',
  'Other',
]

export function ExtendPlacementDialog({
  open,
  onOpenChange,
  placementId,
  candidateName,
  jobTitle,
  accountName,
  currentEndDate,
  currentPayRate,
  currentBillRate,
  onSuccess,
}: ExtendPlacementDialogProps) {
  const { toast } = useToast()
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ExtendPlacementFormData>({
    resolver: zodResolver(extendPlacementSchema),
    defaultValues: {
      newEndDate: '',
      adjustRates: false,
      newPayRate: null,
      newBillRate: null,
      extensionReason: '',
      clientApproval: false,
      clientApprovalDate: '',
      clientApprovalBy: '',
      internalNotes: '',
    },
    mode: 'onChange',
  })

  const adjustRates = watch('adjustRates')
  const newEndDate = watch('newEndDate')
  const newPayRate = watch('newPayRate')
  const newBillRate = watch('newBillRate')
  const clientApproval = watch('clientApproval')

  // Calculate extension duration
  const extensionDays = newEndDate
    ? differenceInDays(new Date(newEndDate), new Date(currentEndDate))
    : 0
  const extensionMonths = Math.ceil(extensionDays / 30)

  // Commission calculation constants
  const HOURS_PER_MONTH = 160
  const COMMISSION_RATE = 0.05

  // Calculate current and proposed margins
  const currentMargin = ((currentBillRate - currentPayRate) / currentBillRate * 100).toFixed(1)
  const proposedPayRate = adjustRates && newPayRate ? newPayRate : currentPayRate
  const proposedBillRate = adjustRates && newBillRate ? newBillRate : currentBillRate
  const proposedMargin = proposedBillRate > 0
    ? ((proposedBillRate - proposedPayRate) / proposedBillRate * 100).toFixed(1)
    : '0.0'

  // Rate change indicators
  const payRateChange = adjustRates && newPayRate
    ? ((newPayRate - currentPayRate) / currentPayRate * 100).toFixed(1)
    : null
  const billRateChange = adjustRates && newBillRate
    ? ((newBillRate - currentBillRate) / currentBillRate * 100).toFixed(1)
    : null

  const extendMutation = trpc.ats.placements.extend.useMutation({
    onSuccess: () => {
      toast({
        title: 'Placement extended',
        description: `${candidateName}'s placement has been extended to ${format(new Date(newEndDate), 'MMM d, yyyy')}`,
      })
      reset()
      setSelectedPreset(null)
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to extend placement',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: ExtendPlacementFormData) => {
    extendMutation.mutate({
      placementId,
      newEndDate: data.newEndDate,
      newPayRate: data.adjustRates && data.newPayRate ? data.newPayRate : undefined,
      newBillRate: data.adjustRates && data.newBillRate ? data.newBillRate : undefined,
      extensionReason: data.extensionReason || undefined,
      clientApproval: data.clientApproval,
      clientApprovalDate: data.clientApprovalDate || undefined,
      clientApprovalBy: data.clientApprovalBy || undefined,
      internalNotes: data.internalNotes || undefined,
    })
  }

  const handleClose = () => {
    reset()
    setSelectedPreset(null)
    onOpenChange(false)
  }

  const applyPreset = (months: number) => {
    const newDate = addMonths(new Date(currentEndDate), months)
    setValue('newEndDate', format(newDate, 'yyyy-MM-dd'))
    setSelectedPreset(months)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-gold-500" />
            Extend Placement
          </DialogTitle>
          <DialogDescription>
            Extend <span className="font-medium text-charcoal-900">{candidateName}</span>&apos;s
            placement at <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Current Status */}
          <Card className="bg-charcoal-50">
            <CardContent className="py-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-charcoal-500">Position</span>
                  <p className="font-medium">{jobTitle}</p>
                </div>
                <div>
                  <span className="text-charcoal-500">Current End Date</span>
                  <p className="font-medium">{format(new Date(currentEndDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <span className="text-charcoal-500">Current Margin</span>
                  <p className="font-medium text-green-600">{currentMargin}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New End Date */}
          <div className="space-y-3">
            <Label>New End Date *</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {EXTENSION_PRESETS.map((preset) => (
                <Button
                  key={preset.months}
                  type="button"
                  size="sm"
                  variant={selectedPreset === preset.months ? 'default' : 'outline'}
                  onClick={() => applyPreset(preset.months)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Input
              type="date"
              {...register('newEndDate')}
              min={format(new Date(currentEndDate), 'yyyy-MM-dd')}
            />
            {errors.newEndDate && (
              <p className="text-sm text-red-500">{errors.newEndDate.message}</p>
            )}
            {extensionDays > 0 && (
              <p className="text-sm text-charcoal-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Extension: {extensionDays} days ({Math.ceil(extensionDays / 30)} months)
              </p>
            )}
          </div>

          {/* Extension Reason */}
          <div className="space-y-2">
            <Label>Extension Reason</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {EXTENSION_REASONS.map((reason) => (
                <Badge
                  key={reason}
                  variant={watch('extensionReason') === reason ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setValue('extensionReason', reason)}
                >
                  {reason}
                </Badge>
              ))}
            </div>
            <Textarea
              {...register('extensionReason')}
              placeholder="Additional details about the extension..."
              rows={2}
            />
          </div>

          {/* Rate Adjustment */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Rate Adjustment
                </CardTitle>
                <Switch
                  checked={adjustRates}
                  onCheckedChange={(checked) => setValue('adjustRates', checked)}
                />
              </div>
              <CardDescription className="text-xs">
                Update pay and bill rates for the extension period
              </CardDescription>
            </CardHeader>
            {adjustRates && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">New Pay Rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-charcoal-400 text-sm">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('newPayRate', { valueAsNumber: true })}
                        className="pl-7"
                        placeholder={currentPayRate.toString()}
                      />
                    </div>
                    {payRateChange && (
                      <p className={cn(
                        'text-xs flex items-center gap-1',
                        parseFloat(payRateChange) > 0 ? 'text-amber-600' : 'text-green-600'
                      )}>
                        <TrendingUp className="w-3 h-3" />
                        {parseFloat(payRateChange) > 0 ? '+' : ''}{payRateChange}% from ${currentPayRate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">New Bill Rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-charcoal-400 text-sm">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('newBillRate', { valueAsNumber: true })}
                        className="pl-7"
                        placeholder={currentBillRate.toString()}
                      />
                    </div>
                    {billRateChange && (
                      <p className={cn(
                        'text-xs flex items-center gap-1',
                        parseFloat(billRateChange) > 0 ? 'text-green-600' : 'text-amber-600'
                      )}>
                        <TrendingUp className="w-3 h-3" />
                        {parseFloat(billRateChange) > 0 ? '+' : ''}{billRateChange}% from ${currentBillRate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Margin Impact */}
                <div className={cn(
                  'p-3 rounded-lg text-sm flex items-center justify-between',
                  parseFloat(proposedMargin) < 10 ? 'bg-red-50 text-red-700' :
                  parseFloat(proposedMargin) < 15 ? 'bg-amber-50 text-amber-700' :
                  'bg-green-50 text-green-700'
                )}>
                  <span>New Margin:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-charcoal-500">{currentMargin}%</span>
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-medium">{proposedMargin}%</span>
                  </div>
                </div>

                {parseFloat(proposedMargin) < 10 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Warning: Margin below 10% threshold
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Client Approval */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Client Approval</CardTitle>
                <Switch
                  checked={clientApproval}
                  onCheckedChange={(checked) => setValue('clientApproval', checked)}
                />
              </div>
            </CardHeader>
            {clientApproval && (
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Approval Date</Label>
                    <Input
                      type="date"
                      {...register('clientApprovalDate')}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Approved By</Label>
                    <Input
                      {...register('clientApprovalBy')}
                      placeholder="Client contact name"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <Textarea
              {...register('internalNotes')}
              placeholder="Any additional notes about this extension..."
              rows={2}
            />
          </div>

          {/* Commission Impact Preview */}
          {extensionDays > 0 && (
            <Card className="bg-gradient-to-br from-gold-50 to-gold-100 border-gold-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-gold-800">
                  <DollarSign className="w-4 h-4" />
                  Commission Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gold-600">Extension Duration</span>
                    <p className="font-medium text-gold-900">
                      {extensionMonths} month{extensionMonths !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-gold-600">Bill Rate (for calc)</span>
                    <p className="font-medium text-gold-900">${proposedBillRate}/hr</p>
                  </div>
                </div>

                <div className="p-3 bg-gold-200/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gold-700">Additional Commission</span>
                    <span className="text-lg font-bold text-gold-900">
                      ${((proposedBillRate * HOURS_PER_MONTH * extensionMonths) * COMMISSION_RATE).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <p className="text-xs text-gold-600 mt-1">
                    Based on {COMMISSION_RATE * 100}% of gross billing (${proposedBillRate} x {HOURS_PER_MONTH}hrs x {extensionMonths}mo)
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gold-700">
                  <TrendingUp className="w-3 h-3" />
                  Great decision! Extensions are a key driver of recurring commission.
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={extendMutation.isPending || !newEndDate}>
              {extendMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extending...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Extend Placement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
