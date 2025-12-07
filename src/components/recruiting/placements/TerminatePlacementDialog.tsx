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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  AlertTriangle,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  UserX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'

// Termination form schema
const terminatePlacementSchema = z.object({
  lastDay: z.string().min(1, 'Last day is required'),
  initiatedBy: z.enum(['client', 'contractor', 'mutual', 'intime']),
  terminationReason: z.string().min(1, 'Termination reason is required'),
  reasonDetails: z.string().max(2000).optional(),
  noticeCompliance: z.enum(['met', 'below_met', 'waived']).optional(),
  // Offboarding
  finalTimesheetSubmitted: z.boolean(),
  equipmentReturnArranged: z.boolean(),
  accessRevoked: z.boolean(),
  exitInterviewScheduled: z.boolean(),
  // Replacement
  offerReplacement: z.boolean(),
  // Notes
  internalNotes: z.string().max(2000).optional(),
  lessonsLearned: z.string().max(2000).optional(),
})

type TerminatePlacementFormData = z.infer<typeof terminatePlacementSchema>

interface TerminatePlacementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placementId: string
  candidateName: string
  jobTitle: string
  accountName: string
  startDate: string
  currentEndDate: string | null
  payRate: number
  billRate: number
  onSuccess?: () => void
}

const TERMINATION_INITIATED_BY = [
  { value: 'client', label: 'Client', description: 'Client requests contractor removal' },
  { value: 'contractor', label: 'Contractor', description: 'Contractor resigns' },
  { value: 'mutual', label: 'Mutual Agreement', description: 'Both parties agreed to end' },
  { value: 'intime', label: 'InTime (Performance/Compliance)', description: 'Performance or compliance issue' },
] as const

const TERMINATION_REASONS = [
  'Performance - Not meeting expectations',
  'Budget/Headcount reduction',
  'Project cancelled/postponed',
  'Better opportunity (contractor)',
  'Personal reasons (contractor)',
  'Culture fit issues',
  'Skill mismatch',
  'Client-side organizational change',
  'Other',
]

const GUARANTEE_TIERS = [
  { days: 7, guarantee: 'Full', discount: 100 },
  { days: 30, guarantee: 'Performance-based', discount: 100 },
  { days: 60, guarantee: 'Partial', discount: 50 },
  { days: 90, guarantee: 'Partial', discount: 25 },
  { days: Infinity, guarantee: 'None', discount: 0 },
]

export function TerminatePlacementDialog({
  open,
  onOpenChange,
  placementId,
  candidateName,
  jobTitle,
  accountName,
  startDate,
  currentEndDate,
  payRate,
  billRate,
  onSuccess,
}: TerminatePlacementDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TerminatePlacementFormData>({
    resolver: zodResolver(terminatePlacementSchema),
    defaultValues: {
      lastDay: format(new Date(), 'yyyy-MM-dd'),
      initiatedBy: 'client',
      terminationReason: '',
      reasonDetails: '',
      noticeCompliance: 'met',
      finalTimesheetSubmitted: false,
      equipmentReturnArranged: false,
      accessRevoked: false,
      exitInterviewScheduled: false,
      offerReplacement: false,
      internalNotes: '',
      lessonsLearned: '',
    },
    mode: 'onChange',
  })

  const lastDay = watch('lastDay')
  const initiatedBy = watch('initiatedBy')
  const offerReplacement = watch('offerReplacement')

  // Calculate days active
  const daysActive = differenceInDays(
    lastDay ? new Date(lastDay) : new Date(),
    new Date(startDate)
  )

  // Calculate remaining contract days and revenue lost
  const remainingDays = currentEndDate
    ? differenceInDays(new Date(currentEndDate), lastDay ? new Date(lastDay) : new Date())
    : 0

  const HOURS_PER_DAY = 8
  const COMMISSION_RATE = 0.05
  const lostBilling = remainingDays > 0 ? remainingDays * HOURS_PER_DAY * billRate : 0
  const lostCommission = lostBilling * COMMISSION_RATE

  // Determine guarantee tier
  const guaranteeTier = GUARANTEE_TIERS.find((tier) => daysActive <= tier.days) || GUARANTEE_TIERS[GUARANTEE_TIERS.length - 1]

  const terminateMutation = trpc.ats.placements.terminate.useMutation({
    onSuccess: () => {
      toast({
        title: 'Placement terminated',
        description: `${candidateName}'s placement has been terminated effective ${format(new Date(lastDay), 'MMM d, yyyy')}`,
      })
      reset()
      setStep(1)
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to terminate placement',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: TerminatePlacementFormData) => {
    terminateMutation.mutate({
      placementId,
      lastDay: data.lastDay,
      initiatedBy: data.initiatedBy,
      terminationReason: data.terminationReason,
      reasonDetails: data.reasonDetails || undefined,
      noticeCompliance: data.noticeCompliance,
      finalTimesheetSubmitted: data.finalTimesheetSubmitted,
      equipmentReturnArranged: data.equipmentReturnArranged,
      accessRevoked: data.accessRevoked,
      exitInterviewScheduled: data.exitInterviewScheduled,
      offerReplacement: data.offerReplacement,
      internalNotes: data.internalNotes || undefined,
      lessonsLearned: data.lessonsLearned || undefined,
    })
  }

  const handleClose = () => {
    reset()
    setStep(1)
    onOpenChange(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Early Termination
          </DialogTitle>
          <DialogDescription>
            Terminate <span className="font-medium text-charcoal-900">{candidateName}</span>&apos;s
            placement at <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Current Placement Info */}
          <Card className="bg-charcoal-50">
            <CardContent className="py-3">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-charcoal-500">Position</span>
                  <p className="font-medium">{jobTitle}</p>
                </div>
                <div>
                  <span className="text-charcoal-500">Start Date</span>
                  <p className="font-medium">{format(new Date(startDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <span className="text-charcoal-500">Contract End</span>
                  <p className="font-medium">
                    {currentEndDate ? format(new Date(currentEndDate), 'MMM d, yyyy') : 'Ongoing'}
                  </p>
                </div>
                <div>
                  <span className="text-charcoal-500">Days Active</span>
                  <p className="font-medium">{daysActive} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Termination Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="font-medium text-charcoal-900">Step 1: Termination Details</h3>

              {/* Initiated By */}
              <div className="space-y-2">
                <Label>Termination Initiated By *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TERMINATION_INITIATED_BY.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('initiatedBy', option.value)}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all',
                        initiatedBy === option.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-charcoal-500">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Termination Reason */}
              <div className="space-y-2">
                <Label>Termination Reason *</Label>
                <Select
                  value={watch('terminationReason')}
                  onValueChange={(v) => setValue('terminationReason', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMINATION_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.terminationReason && (
                  <p className="text-sm text-red-500">{errors.terminationReason.message}</p>
                )}
              </div>

              {/* Reason Details */}
              <div className="space-y-2">
                <Label>Reason Details</Label>
                <Textarea
                  {...register('reasonDetails')}
                  placeholder="Provide more details about the termination reason..."
                  rows={3}
                />
              </div>

              {/* Last Day */}
              <div className="space-y-2">
                <Label>Requested Last Day *</Label>
                <Input
                  type="date"
                  {...register('lastDay')}
                />
                {errors.lastDay && (
                  <p className="text-sm text-red-500">{errors.lastDay.message}</p>
                )}
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full"
                disabled={!lastDay || !watch('terminationReason')}
              >
                Next: Assess Impact
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Impact Assessment */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-medium text-charcoal-900">Step 2: Guarantee Assessment</h3>

              {/* Guarantee Status */}
              <Card className={cn(
                'border-2',
                guaranteeTier.discount === 0 ? 'border-charcoal-200' :
                guaranteeTier.discount === 100 ? 'border-green-500 bg-green-50' :
                'border-amber-500 bg-amber-50'
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Replacement Guarantee Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-charcoal-500">Days Worked</span>
                      <p className="font-medium">{daysActive} days</p>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Guarantee Status</span>
                      <p className="font-medium flex items-center gap-1">
                        {guaranteeTier.discount === 0 ? (
                          <XCircle className="w-4 h-4 text-charcoal-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {guaranteeTier.guarantee}
                        {guaranteeTier.discount > 0 && guaranteeTier.discount < 100 && (
                          <span className="text-amber-600">({guaranteeTier.discount}% discount)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Guarantee Policy */}
                  <div className="p-3 bg-white/50 rounded-lg text-xs space-y-1">
                    <p className="font-medium text-charcoal-700">Standard Guarantee Policy:</p>
                    <ul className="space-y-0.5 text-charcoal-600">
                      <li className={daysActive <= 7 ? 'font-medium text-charcoal-900' : ''}>
                        0-7 days: Free replacement, no questions
                      </li>
                      <li className={daysActive > 7 && daysActive <= 30 ? 'font-medium text-charcoal-900' : ''}>
                        8-30 days: Free replacement if performance
                      </li>
                      <li className={daysActive > 30 && daysActive <= 60 ? 'font-medium text-charcoal-900' : ''}>
                        31-60 days: 50% discount on replacement
                      </li>
                      <li className={daysActive > 60 && daysActive <= 90 ? 'font-medium text-charcoal-900' : ''}>
                        61-90 days: 25% discount on replacement
                      </li>
                      <li className={daysActive > 90 ? 'font-medium text-charcoal-900' : ''}>
                        90+ days: No guarantee (standard fee)
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Impact */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <DollarSign className="w-4 h-4" />
                    Financial Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-red-600">Remaining Contract</span>
                      <p className="font-medium text-red-900">{remainingDays} days</p>
                    </div>
                    <div>
                      <span className="text-red-600">Lost Billing</span>
                      <p className="font-medium text-red-900">{formatCurrency(lostBilling)}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">Commission Impact</span>
                      <span className="text-lg font-bold text-red-900">-{formatCurrency(lostCommission)}</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Remaining months of recurring commission will no longer be earned
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Replacement Offer */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Offer Replacement to Client?</CardTitle>
                    <Switch
                      checked={offerReplacement}
                      onCheckedChange={(checked) => setValue('offerReplacement', checked)}
                    />
                  </div>
                  <CardDescription className="text-xs">
                    {guaranteeTier.discount > 0
                      ? `Client eligible for ${guaranteeTier.discount === 100 ? 'free' : `${guaranteeTier.discount}% discounted`} replacement`
                      : 'Standard placement fee applies'}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)} className="flex-1">
                  Next: Offboarding
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Offboarding & Final */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="font-medium text-charcoal-900">Step 3: Complete Termination</h3>

              {/* Offboarding Checklist */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Offboarding Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: 'finalTimesheetSubmitted', label: 'Final timesheet submitted' },
                    { key: 'equipmentReturnArranged', label: 'Equipment return arranged (laptop, badge)' },
                    { key: 'accessRevoked', label: 'Access revocation requested' },
                    { key: 'exitInterviewScheduled', label: 'Exit interview scheduled' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label className="text-sm font-normal cursor-pointer">{item.label}</Label>
                      <Switch
                        checked={watch(item.key as keyof TerminatePlacementFormData) as boolean}
                        onCheckedChange={(checked) =>
                          setValue(item.key as keyof TerminatePlacementFormData, checked as never)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Internal Notes */}
              <div className="space-y-2">
                <Label>Internal Notes (Not shared with client/contractor)</Label>
                <Textarea
                  {...register('internalNotes')}
                  placeholder="Internal observations about this termination..."
                  rows={2}
                />
              </div>

              {/* Lessons Learned */}
              <div className="space-y-2">
                <Label>Lessons Learned</Label>
                <Textarea
                  {...register('lessonsLearned')}
                  placeholder="What can we learn from this experience for future placements?"
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={terminateMutation.isPending}
                >
                  {terminateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Process Termination
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
