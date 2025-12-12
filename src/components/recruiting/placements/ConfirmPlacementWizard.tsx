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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Loader2,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  MapPin,
  Clock,
  FileText,
  Laptop,
  Video,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
  TrendingUp,
  PartyPopper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { PlacementCelebration } from './PlacementCelebration'

// Form validation schema
const confirmPlacementSchema = z.object({
  // Rates (editable from offer defaults)
  billRate: z.number().positive('Bill rate is required'),
  payRate: z.number().positive('Pay rate is required'),
  // Step 1: Start Details
  confirmedStartDate: z.string().min(1, 'Start date is required'),
  confirmedEndDate: z.string().optional(),
  workSchedule: z.string().max(100).optional(),
  timezone: z.string(),
  // Step 2: First Day Logistics
  onboardingFormat: z.enum(['virtual', 'in_person', 'hybrid']),
  firstDayMeetingLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  firstDayLocation: z.string().max(200).optional(),
  // Step 3: Contacts
  hiringManagerName: z.string().min(1, 'Hiring manager name is required').max(100),
  hiringManagerEmail: z.string().email('Valid email required'),
  hiringManagerPhone: z.string().max(20).optional(),
  hrContactName: z.string().max(100).optional(),
  hrContactEmail: z.string().email().optional().or(z.literal('')),
  // Step 4: Paperwork
  paperworkComplete: z.boolean(),
  backgroundCheckStatus: z.enum(['pending', 'passed', 'failed', 'waived']).optional(),
  i9Complete: z.boolean().optional(),
  ndaSigned: z.boolean().optional(),
  equipmentOrdered: z.boolean().optional(),
  equipmentNotes: z.string().max(500).optional(),
  // Notes
  internalNotes: z.string().max(2000).optional(),
})

type ConfirmPlacementFormData = z.infer<typeof confirmPlacementSchema>

interface OfferDetails {
  id: string
  payRate: number
  billRate: number
  startDate: string
  endDate?: string
  employmentType: string
  workLocation: string
}

interface ConfirmPlacementWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: OfferDetails
  candidateName: string
  jobTitle: string
  accountName: string
  onSuccess?: (placementId: string) => void
}

const ONBOARDING_FORMATS = [
  { value: 'virtual', label: 'Virtual', icon: Video, description: 'Remote onboarding via video call' },
  { value: 'in_person', label: 'In-Person', icon: Building, description: 'On-site at client location' },
  { value: 'hybrid', label: 'Hybrid', icon: Laptop, description: 'Combination of virtual and in-person' },
]

const BACKGROUND_CHECK_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'passed', label: 'Passed', color: 'green' },
  { value: 'waived', label: 'Waived', color: 'gray' },
]

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'UTC', label: 'UTC' },
]

type WizardStep = 'schedule' | 'rates' | 'logistics' | 'contacts' | 'paperwork' | 'review'

const STEPS: { id: WizardStep; title: string; icon: React.ElementType }[] = [
  { id: 'schedule', title: 'Schedule', icon: Calendar },
  { id: 'rates', title: 'Rates', icon: DollarSign },
  { id: 'logistics', title: 'First Day', icon: MapPin },
  { id: 'contacts', title: 'Contacts', icon: User },
  { id: 'paperwork', title: 'Paperwork', icon: FileText },
  { id: 'review', title: 'Review', icon: CheckCircle },
]

export function ConfirmPlacementWizard({
  open,
  onOpenChange,
  offer,
  candidateName,
  jobTitle,
  accountName,
  onSuccess,
}: ConfirmPlacementWizardProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<WizardStep>('schedule')
  const [showCelebration, setShowCelebration] = useState(false)
  const [placementResult, setPlacementResult] = useState<{ placementId: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<ConfirmPlacementFormData>({
    resolver: zodResolver(confirmPlacementSchema),
    defaultValues: {
      billRate: offer.billRate,
      payRate: offer.payRate,
      confirmedStartDate: offer.startDate,
      confirmedEndDate: offer.endDate || '',
      workSchedule: 'Monday-Friday, 9am-5pm',
      timezone: 'America/New_York',
      onboardingFormat: 'virtual',
      firstDayMeetingLink: '',
      firstDayLocation: '',
      hiringManagerName: '',
      hiringManagerEmail: '',
      hiringManagerPhone: '',
      hrContactName: '',
      hrContactEmail: '',
      paperworkComplete: false,
      backgroundCheckStatus: 'pending',
      i9Complete: false,
      ndaSigned: false,
      equipmentOrdered: false,
      equipmentNotes: '',
      internalNotes: '',
    },
    mode: 'onChange',
  })

  const onboardingFormat = watch('onboardingFormat')
  const paperworkComplete = watch('paperworkComplete')
  const confirmedStartDate = watch('confirmedStartDate')
  const confirmedEndDate = watch('confirmedEndDate')
  const watchedBillRate = watch('billRate')
  const watchedPayRate = watch('payRate')

  // Calculate margin using watched values
  const marginAmount = watchedBillRate - watchedPayRate
  const marginPercent = watchedBillRate > 0 ? ((marginAmount / watchedBillRate) * 100) : 0

  // Commission calculation
  const HOURS_PER_MONTH = 160
  const COMMISSION_RATE = 0.05
  const monthlyBilling = watchedBillRate * HOURS_PER_MONTH
  const monthlyCommission = monthlyBilling * COMMISSION_RATE
  const durationMonths = confirmedEndDate && confirmedStartDate
    ? Math.ceil((new Date(confirmedEndDate).getTime() - new Date(confirmedStartDate).getTime()) / (30 * 24 * 60 * 60 * 1000))
    : 6 // Default estimate
  const estimatedTotalCommission = monthlyCommission * durationMonths

  const createPlacementMutation = trpc.ats.placements.create.useMutation({
    onSuccess: (data) => {
      // Show celebration first
      setPlacementResult(data)
      setShowCelebration(true)

      toast({
        title: 'Placement confirmed!',
        description: `${candidateName} has been placed at ${accountName}. First check-in scheduled.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to confirm placement',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: ConfirmPlacementFormData) => {
    createPlacementMutation.mutate({
      offerId: offer.id,
      // Note: billRate and payRate come from the offer, not from user input
      confirmedStartDate: data.confirmedStartDate,
      confirmedEndDate: data.confirmedEndDate || undefined,
      workSchedule: data.workSchedule || undefined,
      timezone: data.timezone,
      onboardingFormat: data.onboardingFormat,
      firstDayMeetingLink: data.firstDayMeetingLink || undefined,
      firstDayLocation: data.firstDayLocation || undefined,
      hiringManagerName: data.hiringManagerName,
      hiringManagerEmail: data.hiringManagerEmail,
      hiringManagerPhone: data.hiringManagerPhone || undefined,
      hrContactName: data.hrContactName || undefined,
      hrContactEmail: data.hrContactEmail || undefined,
      paperworkComplete: data.paperworkComplete,
      backgroundCheckStatus: data.backgroundCheckStatus,
      i9Complete: data.i9Complete,
      ndaSigned: data.ndaSigned,
      equipmentOrdered: data.equipmentOrdered,
      equipmentNotes: data.equipmentNotes || undefined,
      internalNotes: data.internalNotes || undefined,
    })
  }

  const handleClose = () => {
    reset()
    setCurrentStep('schedule')
    setShowCelebration(false)
    setPlacementResult(null)
    onOpenChange(false)
  }

  const handleCelebrationComplete = () => {
    const placementId = placementResult?.placementId
    handleClose()
    if (placementId) {
      onSuccess?.(placementId)
    }
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

  const goToNextStep = async () => {
    // Validate current step fields
    let fieldsToValidate: (keyof ConfirmPlacementFormData)[] = []

    if (currentStep === 'schedule') {
      fieldsToValidate = ['confirmedStartDate', 'timezone']
    } else if (currentStep === 'rates') {
      fieldsToValidate = ['billRate', 'payRate']
    } else if (currentStep === 'logistics') {
      fieldsToValidate = ['onboardingFormat']
    } else if (currentStep === 'contacts') {
      fieldsToValidate = ['hiringManagerName', 'hiringManagerEmail']
    }

    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid && currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id)
    }
  }

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id)
    }
  }

  return (
    <>
      {/* Celebration Overlay with Confetti */}
      <PlacementCelebration
        show={showCelebration}
        candidateName={candidateName}
        accountName={accountName}
        jobTitle={jobTitle}
        monthlyRevenue={monthlyBilling}
        monthlyCommission={monthlyCommission}
        totalCommission={estimatedTotalCommission}
        durationMonths={durationMonths}
        startDate={confirmedStartDate ? format(new Date(confirmedStartDate), 'MMM d, yyyy') : 'TBD'}
        onViewPlacement={handleCelebrationComplete}
        onClose={() => {
          setShowCelebration(false)
          handleClose()
        }}
      />

      <Dialog open={open && !showCelebration} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                Confirm Placement
              </DialogTitle>
              <DialogDescription>
                Finalize the placement of <span className="font-medium text-charcoal-900">{candidateName}</span> at{' '}
                <span className="font-medium text-charcoal-900">{accountName}</span>
              </DialogDescription>
            </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between py-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = index < currentStepIndex

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                    isActive ? 'bg-hublot-900 text-white' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-charcoal-100 text-charcoal-400'
                  )}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-12 h-1 mx-2',
                      index < currentStepIndex ? 'bg-green-500' : 'bg-charcoal-200'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Schedule */}
          {currentStep === 'schedule' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Confirm Start Schedule
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmedStartDate">Start Date *</Label>
                  <Input
                    id="confirmedStartDate"
                    type="date"
                    {...register('confirmedStartDate')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                  {errors.confirmedStartDate && (
                    <p className="text-sm text-red-500">{errors.confirmedStartDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmedEndDate">End Date</Label>
                  <Input
                    id="confirmedEndDate"
                    type="date"
                    {...register('confirmedEndDate')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workSchedule">Work Schedule</Label>
                  <Input
                    id="workSchedule"
                    {...register('workSchedule')}
                    placeholder="Monday-Friday, 9am-5pm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select
                    value={watch('timezone')}
                    onValueChange={(v) => setValue('timezone', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Rates */}
          {currentStep === 'rates' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billRate">Bill Rate (Client pays us) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                    <Input
                      id="billRate"
                      type="number"
                      step="0.01"
                      {...register('billRate', { valueAsNumber: true })}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-charcoal-500">/hr</p>
                  {errors.billRate && (
                    <p className="text-sm text-red-500">{errors.billRate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payRate">Pay Rate (We pay candidate) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                    <Input
                      id="payRate"
                      type="number"
                      step="0.01"
                      {...register('payRate', { valueAsNumber: true })}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-charcoal-500">/hr</p>
                  {errors.payRate && (
                    <p className="text-sm text-red-500">{errors.payRate.message}</p>
                  )}
                </div>
              </div>

              {/* Margin Calculation Display */}
              <Card className={cn(
                'border-2',
                marginPercent >= 20 ? 'border-green-500 bg-green-50' :
                marginPercent >= 15 ? 'border-amber-500 bg-amber-50' :
                'border-red-500 bg-red-50'
              )}>
                <CardContent className="py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-charcoal-500">Markup</p>
                      <p className="text-xl font-semibold">${marginAmount.toFixed(2)}/hr</p>
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Margin</p>
                      <p className={cn(
                        'text-xl font-semibold',
                        marginPercent >= 20 ? 'text-green-700' :
                        marginPercent >= 15 ? 'text-amber-700' :
                        'text-red-700'
                      )}>
                        {marginPercent.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Monthly Revenue</p>
                      <p className="text-xl font-semibold">${monthlyBilling.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commission Preview */}
              <Card className="bg-gold-50 border-gold-200">
                <CardContent className="py-4">
                  <h4 className="text-sm font-medium text-gold-800 flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    Your Commission Preview (5% of gross)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gold-600 text-sm">Monthly</p>
                      <p className="text-lg font-semibold text-gold-900">
                        ${monthlyCommission.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gold-600 text-sm">Contract Total ({durationMonths}mo)</p>
                      <p className="text-lg font-semibold text-gold-900">
                        ${estimatedTotalCommission.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: First Day Logistics */}
          {currentStep === 'logistics' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                First Day Logistics
              </h3>

              <div className="space-y-2">
                <Label>Onboarding Format *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ONBOARDING_FORMATS.map((format) => {
                    const Icon = format.icon
                    return (
                      <button
                        key={format.value}
                        type="button"
                        onClick={() => setValue('onboardingFormat', format.value as 'virtual' | 'in_person' | 'hybrid')}
                        className={cn(
                          'p-3 rounded-lg border text-left transition-colors',
                          onboardingFormat === format.value
                            ? 'border-hublot-900 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <Icon className="w-5 h-5 mb-2 text-charcoal-600" />
                        <div className="font-medium text-charcoal-900 text-sm">{format.label}</div>
                        <div className="text-xs text-charcoal-500 mt-1">{format.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {(onboardingFormat === 'virtual' || onboardingFormat === 'hybrid') && (
                <div className="space-y-2">
                  <Label htmlFor="firstDayMeetingLink">First Day Meeting Link</Label>
                  <Input
                    id="firstDayMeetingLink"
                    type="url"
                    {...register('firstDayMeetingLink')}
                    placeholder="https://zoom.us/j/..."
                  />
                  {errors.firstDayMeetingLink && (
                    <p className="text-sm text-red-500">{errors.firstDayMeetingLink.message}</p>
                  )}
                </div>
              )}

              {(onboardingFormat === 'in_person' || onboardingFormat === 'hybrid') && (
                <div className="space-y-2">
                  <Label htmlFor="firstDayLocation">First Day Location</Label>
                  <Textarea
                    id="firstDayLocation"
                    {...register('firstDayLocation')}
                    placeholder="Address, building, floor, who to ask for..."
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Contacts */}
          {currentStep === 'contacts' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Client Contacts
              </h3>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Hiring Manager *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Name *</Label>
                      <Input
                        {...register('hiringManagerName')}
                        placeholder="John Smith"
                      />
                      {errors.hiringManagerName && (
                        <p className="text-xs text-red-500">{errors.hiringManagerName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email *</Label>
                      <Input
                        type="email"
                        {...register('hiringManagerEmail')}
                        placeholder="john.smith@client.com"
                      />
                      {errors.hiringManagerEmail && (
                        <p className="text-xs text-red-500">{errors.hiringManagerEmail.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone</Label>
                    <Input
                      {...register('hiringManagerPhone')}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">HR Contact (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        {...register('hrContactName')}
                        placeholder="HR Contact Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        {...register('hrContactEmail')}
                        placeholder="hr@client.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Paperwork */}
          {currentStep === 'paperwork' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Paperwork Status
              </h3>

              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>All Paperwork Complete</Label>
                      <p className="text-sm text-charcoal-500">Offer letter, NDA, and other required docs signed</p>
                    </div>
                    <Switch
                      checked={paperworkComplete}
                      onCheckedChange={(checked) => setValue('paperworkComplete', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Background Check Status</Label>
                    <div className="flex gap-2">
                      {BACKGROUND_CHECK_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setValue('backgroundCheckStatus', option.value as 'pending' | 'passed' | 'waived')}
                          className={cn(
                            'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                            watch('backgroundCheckStatus') === option.value
                              ? option.color === 'green' ? 'border-green-500 bg-green-50 text-green-700' :
                                option.color === 'yellow' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                                'border-charcoal-500 bg-charcoal-50 text-charcoal-700'
                              : 'border-charcoal-200 hover:border-charcoal-300'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="i9Complete"
                        checked={watch('i9Complete')}
                        onCheckedChange={(checked) => setValue('i9Complete', checked as boolean)}
                      />
                      <Label htmlFor="i9Complete" className="text-sm">I-9 Completed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ndaSigned"
                        checked={watch('ndaSigned')}
                        onCheckedChange={(checked) => setValue('ndaSigned', checked as boolean)}
                      />
                      <Label htmlFor="ndaSigned" className="text-sm">NDA Signed</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Laptop className="w-4 h-4" />
                    Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="equipmentOrdered"
                      checked={watch('equipmentOrdered')}
                      onCheckedChange={(checked) => setValue('equipmentOrdered', checked as boolean)}
                    />
                    <Label htmlFor="equipmentOrdered" className="text-sm">Equipment Ordered/Shipped</Label>
                  </div>
                  <Textarea
                    {...register('equipmentNotes')}
                    placeholder="Laptop model, shipping tracking, other equipment notes..."
                    rows={2}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Review & Confirm
              </h3>

              <Card className="bg-cream">
                <CardContent className="py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-charcoal-500">Candidate</span>
                      <p className="font-medium">{candidateName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-charcoal-500">Position</span>
                      <p className="font-medium">{jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-sm text-charcoal-500">Client</span>
                      <p className="font-medium">{accountName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-charcoal-500">Start Date</span>
                      <p className="font-medium">{format(new Date(confirmedStartDate), 'MMM d, yyyy')}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-charcoal-500">Pay Rate</span>
                      <p className="font-medium">${watchedPayRate}/hr</p>
                    </div>
                    <div>
                      <span className="text-sm text-charcoal-500">Bill Rate</span>
                      <p className="font-medium">${watchedBillRate}/hr</p>
                    </div>
                    <div>
                      <span className="text-sm text-charcoal-500">Margin</span>
                      <p className={cn(
                        'font-medium',
                        marginPercent >= 15 ? 'text-green-600' :
                        marginPercent >= 10 ? 'text-amber-600' :
                        'text-red-600'
                      )}>{marginPercent.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-charcoal-500">Duration</span>
                      <p className="font-medium">{durationMonths} months</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline">{offer.employmentType.toUpperCase()}</Badge>
                    <Badge variant="outline">{offer.workLocation}</Badge>
                    <Badge variant={onboardingFormat === 'virtual' ? 'default' : 'secondary'}>
                      {onboardingFormat} onboarding
                    </Badge>
                    {paperworkComplete && <Badge className="bg-green-100 text-green-800">Paperwork Complete</Badge>}
                  </div>
                </CardContent>
              </Card>

              {/* Commission Preview */}
              <Card className="bg-gradient-to-br from-gold-50 to-gold-100 border-gold-200">
                <CardContent className="py-4">
                  <h4 className="font-medium text-gold-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gold-600" />
                    Your Commission Earnings
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gold-600">Monthly Commission</span>
                      <p className="text-lg font-bold text-gold-900">
                        ${monthlyCommission.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-gold-600">
                        ${watchedBillRate} x {HOURS_PER_MONTH}hrs x 5%
                      </p>
                    </div>
                    <div>
                      <span className="text-gold-600">Est. Total Commission</span>
                      <p className="text-lg font-bold text-gold-900">
                        ${estimatedTotalCommission.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-gold-600">
                        Over {durationMonths} month{durationMonths !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gold-700">
                    <TrendingUp className="w-3 h-3" />
                    Extensions earn additional monthly commission!
                  </div>
                </CardContent>
              </Card>

              {/* Pre-placement checklist */}
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-4">
                  <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Pre-Placement Checklist
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {paperworkComplete ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                      <span>Paperwork {paperworkComplete ? 'complete' : 'pending'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {watch('backgroundCheckStatus') === 'passed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                      <span>Background check {watch('backgroundCheckStatus')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {watch('hiringManagerEmail') ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span>Hiring manager contact {watch('hiringManagerEmail') ? 'provided' : 'missing'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <Textarea
                  id="internalNotes"
                  {...register('internalNotes')}
                  placeholder="Any additional notes about this placement..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-between">
            {currentStepIndex > 0 && (
              <Button type="button" variant="outline" onClick={goToPrevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {currentStep !== 'review' ? (
                <Button type="button" onClick={goToNextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={createPlacementMutation.isPending}>
                  {createPlacementMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Confirm Placement
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
          </>
        </DialogContent>
      </Dialog>
    </>
  )
}
