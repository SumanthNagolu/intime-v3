'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Video,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Rocket,
  MessageSquare,
  FileText,
  Briefcase,
  AlertTriangle,
  MoreHorizontal,
  Users,
  CheckCircle2,
  X,
  Link2,
  Building2,
  Home,
  Globe,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  PhoneInput,
  type PhoneCountryCode,
  PHONE_COUNTRY_CODES,
} from '@/components/ui/phone-input'
import {
  OPERATING_COUNTRIES,
  getStatesByCountry,
  validatePostalCode,
} from '@/components/addresses'

// =============================================================================
// TYPES & SCHEMA
// =============================================================================

const scheduleMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  meetingType: z.enum(['kickoff', 'check_in', 'qbr', 'intake', 'escalation', 'other']),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  durationMinutes: z.number().int().min(15).max(480),
  locationType: z.enum(['video', 'phone', 'in_person']),
  // Video call fields
  meetingLink: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  // Phone call fields
  phoneCountryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  // In-person address fields
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
  // Common fields
  agenda: z.string().max(2000).optional(),
  description: z.string().max(500).optional(),
})

type ScheduleMeetingFormData = z.infer<typeof scheduleMeetingSchema>

interface CreateContactMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  contactName: string
  accountId: string | null
  accountName: string | null
  onSuccess?: () => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MEETING_TYPES = [
  {
    value: 'kickoff' as const,
    label: 'Kickoff',
    description: 'Initial project start',
    icon: Rocket,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-400',
  },
  {
    value: 'check_in' as const,
    label: 'Check-In',
    description: 'Recurring touchpoint',
    icon: MessageSquare,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-400',
  },
  {
    value: 'qbr' as const,
    label: 'QBR',
    description: 'Quarterly review',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-400',
  },
  {
    value: 'intake' as const,
    label: 'Job Intake',
    description: 'New requisition',
    icon: Briefcase,
    color: 'from-gold-500 to-amber-600',
    bgColor: 'bg-gold-50',
    textColor: 'text-gold-700',
    borderColor: 'border-gold-400',
  },
  {
    value: 'escalation' as const,
    label: 'Escalation',
    description: 'Issue resolution',
    icon: AlertTriangle,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-400',
  },
  {
    value: 'other' as const,
    label: 'Other',
    description: 'General meeting',
    icon: MoreHorizontal,
    color: 'from-charcoal-500 to-charcoal-600',
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-700',
    borderColor: 'border-charcoal-400',
  },
] as const

const LOCATION_TYPES = [
  {
    value: 'video' as const,
    label: 'Video Call',
    description: 'Zoom, Teams, Meet',
    icon: Video,
  },
  {
    value: 'phone' as const,
    label: 'Phone Call',
    description: 'Direct dial',
    icon: Phone,
  },
  {
    value: 'in_person' as const,
    label: 'In Person',
    description: 'On-site meeting',
    icon: MapPin,
  },
] as const

const DURATION_OPTIONS = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1.5h' },
  { value: 120, label: '2h' },
] as const

// =============================================================================
// SECTION COMPONENT
// =============================================================================

function MeetingSection({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-hublot-100 to-hublot-200 flex items-center justify-center shadow-sm">
          <Icon className="w-4 h-4 text-hublot-700" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-charcoal-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CreateContactMeetingDialog({
  open,
  onOpenChange,
  contactId,
  contactName,
  accountId,
  accountName,
  onSuccess,
}: CreateContactMeetingDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null)

  // Form setup with react-hook-form + Zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleMeetingFormData>({
    resolver: zodResolver(scheduleMeetingSchema),
    defaultValues: {
      title: '',
      meetingType: 'check_in',
      scheduledDate: '',
      scheduledTime: '',
      durationMinutes: 30,
      locationType: 'video',
      meetingLink: '',
      phoneCountryCode: 'US',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      countryCode: 'US',
      agenda: '',
      description: '',
    },
  })

  const meetingType = watch('meetingType')
  const locationType = watch('locationType')
  const durationMinutes = watch('durationMinutes')
  const agenda = watch('agenda') || ''
  const countryCode = watch('countryCode') || 'US'
  const phoneCountryCode = watch('phoneCountryCode') || 'US'
  const phoneNumber = watch('phoneNumber') || ''

  // Get states for selected country
  const stateOptions = useMemo(() => getStatesByCountry(countryCode), [countryCode])

  const createMeetingMutation = trpc.crm.meetingNotes.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Meeting scheduled',
        description: `Meeting scheduled with ${contactName}.`,
      })
      // Invalidate relevant queries
      if (accountId) {
        utils.crm.meetingNotes.listByAccount.invalidate({ accountId })
      }
      resetForm()
      onOpenChange(false)
      // Trigger data refresh in parent workspace
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule meeting.',
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    reset()
    setPostalCodeError(null)
  }

  const onSubmit = (data: ScheduleMeetingFormData) => {
    if (!accountId) {
      toast({
        title: 'Cannot schedule meeting',
        description: 'This contact is not linked to any account. Please link them to an account first.',
        variant: 'error',
      })
      return
    }

    // Validate postal code if in-person location
    if (data.locationType === 'in_person' && data.postalCode) {
      const result = validatePostalCode(data.postalCode, data.countryCode || 'US')
      if (!result.valid) {
        setPostalCodeError(result.message || 'Invalid postal code')
        toast({
          title: 'Validation Error',
          description: result.message || 'Please enter a valid postal code.',
          variant: 'error',
        })
        return
      }
    }

    const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}`)

    // Build location details based on location type
    let locationDetails = ''
    if (data.locationType === 'video') {
      locationDetails = data.meetingLink || ''
    } else if (data.locationType === 'phone') {
      const phoneConfig = PHONE_COUNTRY_CODES.find(c => c.code === data.phoneCountryCode)
      locationDetails = phoneConfig ? `${phoneConfig.dialCode}${data.phoneNumber}` : data.phoneNumber || ''
    } else if (data.locationType === 'in_person') {
      const parts = [
        data.addressLine1,
        data.addressLine2,
        [data.city, data.stateProvince].filter(Boolean).join(', '),
        data.postalCode,
        OPERATING_COUNTRIES.find(c => c.value === data.countryCode)?.label,
      ].filter(Boolean)
      locationDetails = parts.join('\n')
    }

    createMeetingMutation.mutate({
      accountId,
      title: data.title.trim(),
      meetingType: data.meetingType,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: data.durationMinutes,
      locationType: data.locationType,
      locationDetails: locationDetails.trim() || undefined,
      agenda: data.agenda?.trim() || undefined,
      description: data.description?.trim() || undefined,
      contactIds: [contactId],  // Pre-select the contact
    })
  }

  const handleMeetingTypeSelect = (type: typeof meetingType) => {
    setValue('meetingType', type)
    const config = MEETING_TYPES.find((t) => t.value === type)
    if (config && !watch('title')) {
      setValue('title', config.label)
    }
  }

  const handleCountryChange = (newCountryCode: string) => {
    setValue('countryCode', newCountryCode)
    setValue('stateProvince', '') // Reset state when country changes
    // Re-validate postal code
    const postalCode = watch('postalCode')
    if (postalCode) {
      const result = validatePostalCode(postalCode, newCountryCode)
      setPostalCodeError(result.valid ? null : result.message || 'Invalid postal code')
    } else {
      setPostalCodeError(null)
    }
  }

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const result = validatePostalCode(value, countryCode)
      setPostalCodeError(result.valid ? null : result.message || 'Invalid postal code')
    } else {
      setPostalCodeError(null)
    }
  }

  const handlePostalCodeBlur = () => {
    const postalCode = watch('postalCode')
    if (postalCode) {
      const result = validatePostalCode(postalCode, countryCode)
      setPostalCodeError(result.valid ? null : result.message || 'Invalid postal code')
    } else {
      setPostalCodeError(null)
    }
  }

  const selectedMeetingType = MEETING_TYPES.find((t) => t.value === meetingType)

  // If no account is linked, show a message
  if (!accountId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-charcoal-900 mb-2">
              No Account Linked
            </h2>
            <p className="text-sm text-charcoal-500 mb-6">
              To schedule a meeting with <span className="font-medium">{contactName}</span>, they must first be linked to an account.
            </p>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Premium Header */}
        <div className="relative px-8 py-6 bg-gradient-to-br from-charcoal-50 via-white to-purple-50/30 border-b border-charcoal-100">
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-gold-400 to-purple-600" />

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-charcoal-900 tracking-tight">
                Schedule Meeting
              </h2>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Schedule a meeting with <span className="font-medium">{contactName}</span>
                {accountName && (
                  <span className="text-charcoal-400"> at {accountName}</span>
                )}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg hover:bg-charcoal-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-8">
            {/* Meeting Type Section */}
            <MeetingSection icon={Briefcase} title="Meeting Type" subtitle="Select the purpose of this meeting">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {MEETING_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = meetingType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleMeetingTypeSelect(type.value)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 group',
                        isSelected
                          ? `${type.borderColor} ${type.bgColor} shadow-md`
                          : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5">
                          <CheckCircle2 className={cn('w-5 h-5', type.textColor)} />
                        </div>
                      )}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isSelected
                            ? `bg-gradient-to-br ${type.color} text-white shadow-sm`
                            : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-charcoal-200'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span
                          className={cn(
                            'text-xs font-semibold block',
                            isSelected ? type.textColor : 'text-charcoal-800'
                          )}
                        >
                          {type.label}
                        </span>
                        <span className="text-[10px] text-charcoal-500 hidden md:block">
                          {type.description}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </MeetingSection>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - When */}
              <MeetingSection icon={Clock} title="When" subtitle="Date, time and duration">
                <div className="space-y-4 p-5 bg-charcoal-50/50 rounded-2xl border border-charcoal-100">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-charcoal-700 font-medium text-sm">
                      Meeting Title <span className="text-gold-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="e.g., Weekly Sync with Engineering Team"
                      className="h-11 rounded-xl border-charcoal-200 bg-white"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-charcoal-700 font-medium text-sm">
                        Date <span className="text-gold-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        {...register('scheduledDate')}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="h-11 rounded-xl border-charcoal-200 bg-white"
                      />
                      {errors.scheduledDate && (
                        <p className="text-xs text-red-500">{errors.scheduledDate.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-charcoal-700 font-medium text-sm">
                        Time <span className="text-gold-500">*</span>
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        {...register('scheduledTime')}
                        className="h-11 rounded-xl border-charcoal-200 bg-white"
                      />
                      {errors.scheduledTime && (
                        <p className="text-xs text-red-500">{errors.scheduledTime.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Duration Pills */}
                  <div className="space-y-2">
                    <Label className="text-charcoal-700 font-medium text-sm">Duration</Label>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setValue('durationMinutes', option.value)}
                          className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                            durationMinutes === option.value
                              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-white shadow-sm shadow-gold-500/30'
                              : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-charcoal-300 hover:bg-charcoal-50'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </MeetingSection>

              {/* Right Column - Where */}
              <MeetingSection icon={MapPin} title="Where" subtitle="Location and meeting details">
                <div className="space-y-4 p-5 bg-charcoal-50/50 rounded-2xl border border-charcoal-100">
                  {/* Location Type Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {LOCATION_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = locationType === type.value
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setValue('locationType', type.value)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
                            isSelected
                              ? 'border-purple-500 bg-purple-50 shadow-sm'
                              : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-white'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5',
                              isSelected ? 'text-purple-700' : 'text-charcoal-500'
                            )}
                          />
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              isSelected ? 'text-purple-700' : 'text-charcoal-700'
                            )}
                          >
                            {type.label}
                          </span>
                          <span className="text-[10px] text-charcoal-500">{type.description}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Conditional Location Fields */}
                  {locationType === 'video' && (
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink" className="text-charcoal-700 font-medium text-sm">
                        Meeting Link
                      </Label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <Input
                          id="meetingLink"
                          {...register('meetingLink')}
                          placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                          className="h-11 pl-10 rounded-xl border-charcoal-200 bg-white"
                        />
                      </div>
                      {errors.meetingLink && (
                        <p className="text-xs text-red-500">{errors.meetingLink.message}</p>
                      )}
                    </div>
                  )}

                  {locationType === 'phone' && (
                    <div className="space-y-2">
                      <PhoneInput
                        label="Phone Number"
                        value={{
                          countryCode: phoneCountryCode as PhoneCountryCode,
                          number: phoneNumber,
                        }}
                        onChange={(value) => {
                          setValue('phoneCountryCode', value.countryCode)
                          setValue('phoneNumber', value.number)
                        }}
                        className="[&_input]:rounded-xl [&_input]:h-11 [&>div>button]:rounded-xl [&>div>button]:h-11"
                      />
                    </div>
                  )}

                  {locationType === 'in_person' && (
                    <div className="space-y-4">
                      {/* Street Address */}
                      <div className="space-y-2">
                        <Label htmlFor="addressLine1" className="text-charcoal-700 font-medium text-sm">
                          Street Address
                        </Label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                          <Input
                            id="addressLine1"
                            {...register('addressLine1')}
                            placeholder="123 Main Street"
                            className="h-11 pl-10 rounded-xl border-charcoal-200 bg-white"
                          />
                        </div>
                      </div>

                      {/* Suite/Floor */}
                      <div className="space-y-2">
                        <Label htmlFor="addressLine2" className="text-charcoal-700 font-medium text-sm">
                          Suite / Floor
                          <span className="text-[10px] text-charcoal-400 font-normal ml-2">(Optional)</span>
                        </Label>
                        <Input
                          id="addressLine2"
                          {...register('addressLine2')}
                          placeholder="Suite 400, Floor 5..."
                          className="h-11 rounded-xl border-charcoal-200 bg-white"
                        />
                      </div>

                      {/* City & State */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-charcoal-700 font-medium text-sm">
                            City
                          </Label>
                          <Input
                            id="city"
                            {...register('city')}
                            placeholder="San Francisco"
                            className="h-11 rounded-xl border-charcoal-200 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-charcoal-700 font-medium text-sm">
                            State / Province
                          </Label>
                          <Select
                            value={watch('stateProvince') || ''}
                            onValueChange={(v) => setValue('stateProvince', v)}
                          >
                            <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {stateOptions.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Postal Code & Country */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="postalCode" className="text-charcoal-700 font-medium text-sm">
                            ZIP / Postal Code
                          </Label>
                          <Input
                            id="postalCode"
                            {...register('postalCode', {
                              onChange: handlePostalCodeChange,
                            })}
                            placeholder={countryCode === 'US' ? '12345' : countryCode === 'CA' ? 'K1A 0B1' : '110001'}
                            className={cn(
                              'h-11 rounded-xl border-charcoal-200 bg-white',
                              postalCodeError && 'border-red-500 focus:ring-red-500'
                            )}
                            onBlur={handlePostalCodeBlur}
                            maxLength={10}
                          />
                          {postalCodeError && (
                            <p className="text-xs text-red-500">{postalCodeError}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-charcoal-700 font-medium text-sm flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            Country
                          </Label>
                          <Select
                            value={countryCode}
                            onValueChange={handleCountryChange}
                          >
                            <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATING_COUNTRIES.map((country) => (
                                <SelectItem key={country.value} value={country.value}>
                                  {country.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </MeetingSection>
            </div>

            {/* Attendee Info */}
            <MeetingSection icon={Users} title="Attendee" subtitle="Meeting participant">
              <div className="p-5 bg-charcoal-50/50 rounded-2xl border border-charcoal-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-semibold text-sm">
                    {contactName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">{contactName}</p>
                    {accountName && (
                      <p className="text-sm text-charcoal-500">{accountName}</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </MeetingSection>

            {/* Agenda Section */}
            <MeetingSection icon={FileText} title="Agenda" subtitle="Meeting topics and preparation">
              <div className="p-5 bg-charcoal-50/50 rounded-2xl border border-charcoal-100 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agenda" className="text-charcoal-700 font-medium text-sm">
                    Meeting Agenda
                  </Label>
                  <Textarea
                    id="agenda"
                    {...register('agenda')}
                    placeholder={`What will you discuss in this ${selectedMeetingType?.label || 'meeting'}?\n\n• Topic 1\n• Topic 2\n• Topic 3`}
                    rows={4}
                    className="rounded-xl border-charcoal-200 bg-white resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-charcoal-400">
                      Add discussion points, questions, or objectives
                    </p>
                    <p className="text-[11px] text-charcoal-400">
                      {agenda.length}/2000
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-charcoal-700 font-medium text-sm">
                    Internal Notes
                    <span className="text-[10px] text-charcoal-400 font-normal ml-2">(Not visible to attendees)</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Preparation notes, context, or reminders..."
                    rows={2}
                    className="rounded-xl border-charcoal-200 bg-white resize-none"
                  />
                </div>
              </div>
            </MeetingSection>
          </div>

          {/* Footer */}
          <DialogFooter className="px-8 py-5 bg-charcoal-50/50 border-t border-charcoal-100">
            <div className="flex items-center justify-between w-full">
              {/* Summary */}
              <div className="flex items-center gap-4 text-sm text-charcoal-600">
                {selectedMeetingType && (
                  <span className="flex items-center gap-1.5">
                    <selectedMeetingType.icon className="w-4 h-4" />
                    {selectedMeetingType.label}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {DURATION_OPTIONS.find((d) => d.value === durationMinutes)?.label}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  1 attendee
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-11 px-5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMeetingMutation.isPending}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white shadow-lg shadow-purple-900/20"
                >
                  {createMeetingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
