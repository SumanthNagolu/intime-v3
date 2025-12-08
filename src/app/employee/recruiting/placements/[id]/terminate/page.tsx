'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  useTerminatePlacementStore,
  TERMINATION_INITIATED_BY,
  TERMINATION_REASONS,
  GUARANTEE_TIERS,
  OFFBOARDING_CHECKLIST,
} from '@/stores/terminate-placement-store'
import {
  Loader2,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  UserX,
  ChevronLeft,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'

export default function TerminatePlacementPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const placementId = params.id as string

  // URL-based step management
  const stepParam = searchParams.get('step')
  const urlStep = stepParam ? Math.min(Math.max(parseInt(stepParam), 1), 3) as 1 | 2 | 3 : 1

  const {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    resetForm,
    initializeFromPlacement,
    isDirty,
    lastSaved,
  } = useTerminatePlacementStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync step with URL
  useEffect(() => {
    setCurrentStep(urlStep)
  }, [urlStep, setCurrentStep])

  // Fetch placement data
  const placementQuery = trpc.ats.placements.getById.useQuery(
    { placementId },
    { enabled: !!placementId }
  )

  // Initialize from placement data
  useEffect(() => {
    if (placementQuery.data) {
      const pl = placementQuery.data
      // Extract names from joined data
      const candidateName = pl.candidate
        ? `${pl.candidate.first_name || ''} ${pl.candidate.last_name || ''}`.trim()
        : 'Contractor'
      const jobTitle = pl.job?.title || 'Position'
      const accountName = pl.job?.account?.name || 'Account'

      initializeFromPlacement(
        placementId,
        candidateName,
        jobTitle,
        accountName,
        pl.start_date || format(new Date(), 'yyyy-MM-dd'),
        pl.end_date || null,
        pl.pay_rate || pl.offer?.pay_rate || 0,
        pl.bill_rate || pl.offer?.bill_rate || 0
      )
    }
  }, [placementQuery.data, placementId, initializeFromPlacement])

  // Terminate mutation
  const terminateMutation = trpc.ats.placements.terminate.useMutation({
    onSuccess: () => {
      toast({
        title: 'Placement terminated',
        description: `${formData.candidateName}'s placement has been terminated effective ${format(new Date(formData.lastDay), 'MMM d, yyyy')}`,
      })
      resetForm()
      router.push(`/employee/recruiting/placements/${placementId}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to terminate placement',
        description: error.message,
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  // Calculate days active
  const daysActive = differenceInDays(
    formData.lastDay ? new Date(formData.lastDay) : new Date(),
    formData.startDate ? new Date(formData.startDate) : new Date()
  )

  // Calculate remaining contract days and revenue lost
  const remainingDays = formData.currentEndDate
    ? differenceInDays(
        new Date(formData.currentEndDate),
        formData.lastDay ? new Date(formData.lastDay) : new Date()
      )
    : 0

  const HOURS_PER_DAY = 8
  const COMMISSION_RATE = 0.05
  const lostBilling = remainingDays > 0 ? remainingDays * HOURS_PER_DAY * formData.billRate : 0
  const lostCommission = lostBilling * COMMISSION_RATE

  // Determine guarantee tier
  const guaranteeTier =
    GUARANTEE_TIERS.find((tier) => daysActive <= tier.days) || GUARANTEE_TIERS[GUARANTEE_TIERS.length - 1]

  const navigateToStep = (step: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleNext = () => {
    if (currentStep < 3) {
      navigateToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    terminateMutation.mutate({
      placementId,
      lastDay: formData.lastDay,
      initiatedBy: formData.initiatedBy,
      terminationReason: formData.terminationReason,
      reasonDetails: formData.reasonDetails || undefined,
      noticeCompliance: formData.noticeCompliance,
      finalTimesheetSubmitted: formData.finalTimesheetSubmitted,
      equipmentReturnArranged: formData.equipmentReturnArranged,
      accessRevoked: formData.accessRevoked,
      exitInterviewScheduled: formData.exitInterviewScheduled,
      offerReplacement: formData.offerReplacement,
      internalNotes: formData.internalNotes || undefined,
      lessonsLearned: formData.lessonsLearned || undefined,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (placementQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-6">
        <Link
          href={`/employee/recruiting/placements/${placementId}`}
          className="hover:text-hublot-700 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Placement
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Early Termination
        </h1>
        <p className="text-charcoal-500 mt-1">
          Terminate <span className="font-medium text-charcoal-900">{formData.candidateName}</span>&apos;s
          placement at <span className="font-medium text-charcoal-900">{formData.accountName}</span>
        </p>
        {lastSaved && isDirty && (
          <p className="text-sm text-charcoal-500 mt-2">
            <Save className="w-3 h-3 inline mr-1" />
            Auto-saved {new Date(lastSaved).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Current Placement Info */}
      <Card className="bg-charcoal-50 mb-6">
        <CardContent className="py-3">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-charcoal-500">Position</span>
              <p className="font-medium">{formData.jobTitle}</p>
            </div>
            <div>
              <span className="text-charcoal-500">Start Date</span>
              <p className="font-medium">
                {formData.startDate ? format(new Date(formData.startDate), 'MMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-500">Contract End</span>
              <p className="font-medium">
                {formData.currentEndDate ? format(new Date(formData.currentEndDate), 'MMM d, yyyy') : 'Ongoing'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-500">Days Active</span>
              <p className="font-medium">{daysActive} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 py-4 mb-6">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => navigateToStep(s)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                currentStep === s
                  ? 'bg-red-600 text-white shadow-lg'
                  : currentStep > s
                  ? 'bg-red-100 text-red-800 cursor-pointer'
                  : 'bg-charcoal-100 text-charcoal-500 cursor-pointer'
              )}
            >
              {currentStep > s ? <CheckCircle className="w-4 h-4" /> : s}
            </button>
            {i < 2 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2',
                  currentStep > s ? 'bg-red-400' : 'bg-charcoal-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Step 1: Termination Details */}
          {currentStep === 1 && (
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
                      onClick={() => setFormData({ initiatedBy: option.value })}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all',
                        formData.initiatedBy === option.value
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
                  value={formData.terminationReason}
                  onValueChange={(v) => setFormData({ terminationReason: v })}
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
              </div>

              {/* Reason Details */}
              <div className="space-y-2">
                <Label>Reason Details</Label>
                <Textarea
                  value={formData.reasonDetails}
                  onChange={(e) => setFormData({ reasonDetails: e.target.value })}
                  placeholder="Provide more details about the termination reason..."
                  rows={3}
                />
              </div>

              {/* Last Day */}
              <div className="space-y-2">
                <Label>Requested Last Day *</Label>
                <Input
                  type="date"
                  value={formData.lastDay}
                  onChange={(e) => setFormData({ lastDay: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Impact Assessment */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h3 className="font-medium text-charcoal-900">Step 2: Guarantee Assessment</h3>

              {/* Guarantee Status */}
              <Card
                className={cn(
                  'border-2',
                  guaranteeTier.discount === 0
                    ? 'border-charcoal-200'
                    : guaranteeTier.discount === 100
                    ? 'border-green-500 bg-green-50'
                    : 'border-amber-500 bg-amber-50'
                )}
              >
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
                      checked={formData.offerReplacement}
                      onCheckedChange={(checked) => setFormData({ offerReplacement: checked })}
                    />
                  </div>
                  <CardDescription className="text-xs">
                    {guaranteeTier.discount > 0
                      ? `Client eligible for ${guaranteeTier.discount === 100 ? 'free' : `${guaranteeTier.discount}% discounted`} replacement`
                      : 'Standard placement fee applies'}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Step 3: Offboarding & Final */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h3 className="font-medium text-charcoal-900">Step 3: Complete Termination</h3>

              {/* Offboarding Checklist */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Offboarding Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {OFFBOARDING_CHECKLIST.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label className="text-sm font-normal cursor-pointer">{item.label}</Label>
                      <Switch
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) =>
                          setFormData({ [item.key]: checked } as Partial<typeof formData>)
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
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ internalNotes: e.target.value })}
                  placeholder="Internal observations about this termination..."
                  rows={2}
                />
              </div>

              {/* Lessons Learned */}
              <div className="space-y-2">
                <Label>Lessons Learned</Label>
                <Textarea
                  value={formData.lessonsLearned}
                  onChange={(e) => setFormData({ lessonsLearned: e.target.value })}
                  placeholder="What can we learn from this experience for future placements?"
                  rows={2}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
                resetForm()
                router.push(`/employee/recruiting/placements/${placementId}`)
              }
            }}
          >
            Cancel
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={currentStep === 1 && (!formData.lastDay || !formData.terminationReason)}
            >
              Next: {currentStep === 1 ? 'Assess Impact' : 'Offboarding'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
          )}
        </div>
      </div>
    </div>
  )
}
