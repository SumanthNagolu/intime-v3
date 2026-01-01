'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
  Home,
  Globe,
  Plus,
  Trash2,
  ListTodo,
  Pencil,
  CheckSquare,
  Square,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  PhoneInput,
  type PhoneCountryCode,
  PHONE_COUNTRY_CODES,
  parsePhoneValue,
} from '@/components/ui/phone-input'
import {
  OPERATING_COUNTRIES,
  getStatesByCountry,
  validatePostalCode,
} from '@/components/addresses'
import type { AccountMeeting, MeetingType, MeetingStatus } from '@/types/workspace'

// =============================================================================
// TYPES & SCHEMA
// =============================================================================

const actionItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  completed: z.boolean().default(false),
})

// Match the tRPC mutation input schema from crm.ts
const editMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  meetingType: z.enum(['kickoff', 'check_in', 'qbr', 'intake', 'escalation', 'other']),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  durationMinutes: z.number().int().min(15).max(480),
  locationType: z.enum(['video', 'phone', 'in_person']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']),
  // Location fields
  meetingLink: z.string().optional(),
  phoneCountryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
  // Content
  agenda: z.string().max(2000).optional(),
  discussionNotes: z.string().max(5000).optional(),
  keyTakeaways: z.string().optional(), // Will be split into array
  followUpNotes: z.string().max(2000).optional(),
  // Action Items
  actionItems: z.array(actionItemSchema).optional(),
})

type EditMeetingFormData = z.infer<typeof editMeetingSchema>

interface EditMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: AccountMeeting
  accountId: string
  onSuccess?: () => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MEETING_TYPES = [
  { value: 'kickoff' as const, label: 'Kickoff', icon: Rocket, color: 'text-green-600' },
  { value: 'check_in' as const, label: 'Check-In', icon: MessageSquare, color: 'text-blue-600' },
  { value: 'qbr' as const, label: 'QBR', icon: FileText, color: 'text-purple-600' },
  { value: 'intake' as const, label: 'Job Intake', icon: Briefcase, color: 'text-gold-600' },
  { value: 'escalation' as const, label: 'Escalation', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'other' as const, label: 'Other', icon: MoreHorizontal, color: 'text-charcoal-600' },
] as const

const STATUS_OPTIONS = [
  { value: 'scheduled' as const, label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress' as const, label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'completed' as const, label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled' as const, label: 'Cancelled', color: 'bg-charcoal-100 text-charcoal-600' },
  { value: 'no_show' as const, label: 'No Show', color: 'bg-red-100 text-red-700' },
] as const

const LOCATION_TYPES = [
  { value: 'video' as const, label: 'Video', icon: Video },
  { value: 'phone' as const, label: 'Phone', icon: Phone },
  { value: 'in_person' as const, label: 'In Person', icon: MapPin },
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
// HELPER FUNCTIONS
// =============================================================================

// Map frontend MeetingType to backend values
type BackendMeetingType = 'kickoff' | 'check_in' | 'qbr' | 'intake' | 'escalation' | 'other'
type BackendMeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

function mapMeetingTypeToBackend(type: MeetingType): BackendMeetingType {
  const mapping: Record<string, BackendMeetingType> = {
    'kick_off': 'kickoff',
    'check_in': 'check_in',
    'qbr': 'qbr',
    'project_review': 'intake', // Map to closest equivalent
    'escalation_review': 'escalation',
    'sales_pitch': 'other',
    'other': 'other',
  }
  return mapping[type] || 'other'
}

function mapMeetingStatusToBackend(status: MeetingStatus): BackendMeetingStatus {
  const mapping: Record<string, BackendMeetingStatus> = {
    'scheduled': 'scheduled',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'rescheduled': 'cancelled', // Map to closest equivalent
  }
  return mapping[status] || 'scheduled'
}

// Country-specific postal code patterns
const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,           // 12345 or 12345-6789
  CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, // K1A 0B1 or K1A0B1
  IN: /^\d{6}$/,                      // 110001
  GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, // SW1A 1AA
}

function isValidPostalCode(value: string, countryCode: string): boolean {
  const pattern = POSTAL_CODE_PATTERNS[countryCode]
  if (pattern) {
    return pattern.test(value.trim())
  }
  // Generic: 3-7 characters, no spaces (stricter than before)
  return /^[A-Z0-9]{3,7}$/i.test(value.trim())
}

function parseLocationDetails(location: string | null, locationType: string | null) {
  const defaultResult = { 
    meetingLink: '', 
    phoneCountryCode: 'US', 
    phoneNumber: '', 
    addressLine1: '', 
    addressLine2: '',
    city: '', 
    stateProvince: '', 
    postalCode: '', 
    countryCode: 'US' 
  }
  
  if (!location) return defaultResult
  
  if (locationType === 'video') {
    return { ...defaultResult, meetingLink: location }
  }
  
  if (locationType === 'phone') {
    const parsed = parsePhoneValue(location)
    return { ...defaultResult, phoneCountryCode: parsed.countryCode, phoneNumber: parsed.number }
  }
  
  // In-person: parse structured address format
  // Format saved as: addressLine1\naddressLine2?\ncity, state\npostalCode\ncountry
  const lines = location.split('\n').map(l => l.trim()).filter(Boolean)
  
  if (lines.length === 0) return defaultResult
  
  const result = { ...defaultResult }
  
  // Step 1: Find and remove country (usually last line)
  // Search from end to beginning
  for (let i = lines.length - 1; i >= 0; i--) {
    const matchedCountry = OPERATING_COUNTRIES.find(c => 
      c.label.toLowerCase() === lines[i].toLowerCase()
    )
    if (matchedCountry) {
      result.countryCode = matchedCountry.value
      lines.splice(i, 1)
      break
    }
  }
  
  // Step 2: Find and remove postal code (search from end, before country was removed)
  // Look for a line that matches postal code pattern for the country
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    // Skip lines with commas (those are city, state)
    if (line.includes(',')) continue
    // Skip lines that are too long (likely addresses)
    if (line.length > 12) continue
    // Check if it matches postal code pattern
    if (isValidPostalCode(line, result.countryCode)) {
      result.postalCode = line
      lines.splice(i, 1)
      break
    }
  }
  
  // Step 3: Find city, state (line with comma)
  const cityStateIndex = lines.findIndex(line => line.includes(','))
  if (cityStateIndex !== -1) {
    const [city, state] = lines[cityStateIndex].split(',').map(s => s.trim())
    result.city = city || ''
    result.stateProvince = state || ''
    lines.splice(cityStateIndex, 1)
  }
  
  // Step 4: Remaining lines are address lines (first = addressLine1, second = addressLine2)
  if (lines.length > 0) {
    result.addressLine1 = lines[0]
  }
  if (lines.length > 1) {
    result.addressLine2 = lines[1]
  }
  
  return result
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EditMeetingDialog({
  open,
  onOpenChange,
  meeting,
  accountId,
  onSuccess,
}: EditMeetingDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'actions'>('details')

  // Fetch org members for assignee dropdown
  const orgMembersQuery = trpc.users.list.useQuery({ 
    page: 1, 
    pageSize: 100 
  }, {
    enabled: open,
  })

  // Parse initial values from meeting
  const meetingDate = meeting.date ? parseISO(meeting.date) : new Date()
  const parsedLocation = parseLocationDetails(meeting.location, meeting.locationType)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditMeetingFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editMeetingSchema) as any,
    defaultValues: {
      title: meeting.subject || '',
      meetingType: mapMeetingTypeToBackend(meeting.meetingType),
      scheduledDate: format(meetingDate, 'yyyy-MM-dd'),
      scheduledTime: format(meetingDate, 'HH:mm'),
      durationMinutes: meeting.durationMinutes || 30,
      locationType: (meeting.locationType as 'video' | 'phone' | 'in_person') || 'video',
      status: mapMeetingStatusToBackend(meeting.status),
      meetingLink: parsedLocation.meetingLink,
      phoneCountryCode: parsedLocation.phoneCountryCode,
      phoneNumber: parsedLocation.phoneNumber,
      // Combine addressLine1 and addressLine2 since we only have one field
      addressLine1: [parsedLocation.addressLine1, parsedLocation.addressLine2].filter(Boolean).join(' '),
      addressLine2: '',
      city: parsedLocation.city,
      stateProvince: parsedLocation.stateProvince,
      postalCode: parsedLocation.postalCode,
      countryCode: parsedLocation.countryCode,
      agenda: meeting.agenda || '',
      discussionNotes: meeting.discussionNotes || '',
      keyTakeaways: meeting.keyTakeaways?.join('\n') || '',
      followUpNotes: meeting.followUpNotes || '',
      actionItems: meeting.actionItems?.map(item => ({
        id: item.id,
        description: item.description,
        assigneeId: item.assignedTo || null,
        dueDate: item.dueDate || null,
        completed: item.completed,
      })) || [],
    },
  })

  const { fields: actionItemFields, append: appendActionItem, remove: removeActionItem } = useFieldArray({
    control,
    name: 'actionItems',
  })

  const locationType = watch('locationType')
  const durationMinutes = watch('durationMinutes')
  const status = watch('status')
  const countryCode = watch('countryCode') || 'US'
  const phoneCountryCode = watch('phoneCountryCode') || 'US'
  const phoneNumber = watch('phoneNumber') || ''
  const actionItems = watch('actionItems') || []

  const stateOptions = useMemo(() => getStatesByCountry(countryCode), [countryCode])

  // Reset form when meeting changes
  useEffect(() => {
    if (open && meeting) {
      const date = meeting.date ? parseISO(meeting.date) : new Date()
      const loc = parseLocationDetails(meeting.location, meeting.locationType)
      
      reset({
        title: meeting.subject || '',
        meetingType: mapMeetingTypeToBackend(meeting.meetingType),
        scheduledDate: format(date, 'yyyy-MM-dd'),
        scheduledTime: format(date, 'HH:mm'),
        durationMinutes: meeting.durationMinutes || 30,
        locationType: (meeting.locationType as 'video' | 'phone' | 'in_person') || 'video',
        status: mapMeetingStatusToBackend(meeting.status),
        meetingLink: loc.meetingLink,
        phoneCountryCode: loc.phoneCountryCode,
        phoneNumber: loc.phoneNumber,
        // Combine addressLine1 and addressLine2 since we only have one field
        addressLine1: [loc.addressLine1, loc.addressLine2].filter(Boolean).join(' '),
        addressLine2: '',
        city: loc.city,
        stateProvince: loc.stateProvince,
        postalCode: loc.postalCode,
        countryCode: loc.countryCode,
        agenda: meeting.agenda || '',
        discussionNotes: meeting.discussionNotes || '',
        keyTakeaways: meeting.keyTakeaways?.join('\n') || '',
        followUpNotes: meeting.followUpNotes || '',
        actionItems: meeting.actionItems?.map(item => ({
          id: item.id,
          description: item.description,
          assigneeId: item.assignedTo || null,
          // Convert ISO datetime to YYYY-MM-DD date string for the date input
          dueDate: item.dueDate ? format(parseISO(item.dueDate), 'yyyy-MM-dd') : null,
          completed: item.completed,
        })) || [],
      })
    }
  }, [open, meeting, reset])

  const updateMeetingMutation = trpc.crm.meetingNotes.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Meeting updated',
        description: 'Your changes have been saved.',
      })
      utils.crm.meetingNotes.listByAccount.invalidate({ accountId })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update meeting.',
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: EditMeetingFormData) => {
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

    // Build location details
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

    // Parse key takeaways from text
    const keyTakeaways = data.keyTakeaways?.split('\n').filter(line => line.trim()) || []

    // Format action items with proper datetime for dueDate
    const formattedActionItems = data.actionItems?.filter(item => item.description.trim())?.map(item => ({
      description: item.description.trim(),
      assigneeId: item.assigneeId || undefined,
      // Convert date string (YYYY-MM-DD) to ISO datetime string
      dueDate: item.dueDate ? new Date(`${item.dueDate}T23:59:59`).toISOString() : undefined,
      completed: item.completed,
    }))

    updateMeetingMutation.mutate({
      id: meeting.id,
      title: data.title.trim(),
      meetingType: data.meetingType,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: data.durationMinutes,
      locationType: data.locationType,
      locationDetails: locationDetails.trim() || undefined,
      status: data.status,
      agenda: data.agenda?.trim() || undefined,
      discussionNotes: data.discussionNotes?.trim() || undefined,
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : undefined,
      followUpNotes: data.followUpNotes?.trim() || undefined,
      actionItems: formattedActionItems && formattedActionItems.length > 0 ? formattedActionItems : undefined,
    })
  }

  const handleCountryChange = (newCountryCode: string) => {
    setValue('countryCode', newCountryCode)
    setValue('stateProvince', '')
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

  const toggleActionItemComplete = (index: number) => {
    const currentItems = watch('actionItems') || []
    if (currentItems[index]) {
      setValue(`actionItems.${index}.completed`, !currentItems[index].completed)
    }
  }

  const completedCount = actionItems.filter(item => item.completed).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-charcoal-50 via-white to-purple-50/30 border-b border-charcoal-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Pencil className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-charcoal-900">Edit Meeting</h2>
              <p className="text-sm text-charcoal-500">{meeting.subject}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg hover:bg-charcoal-100 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-charcoal-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'details', label: 'Details', icon: Calendar },
              { id: 'notes', label: 'Notes & Takeaways', icon: FileText },
              { id: 'actions', label: `Action Items (${actionItems.length})`, icon: ListTodo },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-purple-700 border border-charcoal-200'
                    : 'text-charcoal-600 hover:bg-charcoal-100'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Title & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Title <span className="text-gold-500">*</span></Label>
                    <Input
                      {...register('title')}
                      className="h-11 rounded-xl"
                    />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Type</Label>
                    <Select value={watch('meetingType')} onValueChange={(v) => setValue('meetingType', v as BackendMeetingType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEETING_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <type.icon className={cn('w-4 h-4', type.color)} />
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue('status', opt.value)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium transition-all',
                          status === opt.value
                            ? `${opt.color} ring-2 ring-offset-2 ring-purple-300`
                            : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date, Time, Duration */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date <span className="text-gold-500">*</span></Label>
                    <Input type="date" {...register('scheduledDate')} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Time <span className="text-gold-500">*</span></Label>
                    <Input type="time" {...register('scheduledTime')} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Duration</Label>
                    <div className="flex flex-wrap gap-1">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setValue('durationMinutes', opt.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                            durationMinutes === opt.value
                              ? 'bg-purple-600 text-white'
                              : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="flex gap-2">
                    {LOCATION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setValue('locationType', type.value)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all',
                          locationType === type.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-charcoal-200 text-charcoal-600 hover:border-charcoal-300'
                        )}
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Location Details */}
                  {locationType === 'video' && (
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                      <Input
                        {...register('meetingLink')}
                        placeholder="https://zoom.us/j/..."
                        className="h-11 pl-10 rounded-xl"
                      />
                    </div>
                  )}

                  {locationType === 'phone' && (
                    <PhoneInput
                      value={{ countryCode: phoneCountryCode as PhoneCountryCode, number: phoneNumber }}
                      onChange={(value) => {
                        setValue('phoneCountryCode', value.countryCode)
                        setValue('phoneNumber', value.number)
                      }}
                      className="[&_input]:rounded-xl [&_input]:h-11 [&>div>button]:rounded-xl [&>div>button]:h-11"
                    />
                  )}

                  {locationType === 'in_person' && (
                    <div className="space-y-3 p-4 bg-charcoal-50 rounded-xl">
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <Input
                          {...register('addressLine1')}
                          placeholder="Street address"
                          className="h-10 pl-10 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input {...register('city')} placeholder="City" className="h-10 rounded-lg" />
                        <Select value={watch('stateProvince') || ''} onValueChange={(v) => setValue('stateProvince', v)}>
                          <SelectTrigger className="h-10 rounded-lg">
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent>
                            {stateOptions.map((state) => (
                              <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Input
                            {...register('postalCode', {
                              onChange: handlePostalCodeChange,
                            })}
                            placeholder="ZIP Code"
                            className={cn('h-10 rounded-lg', postalCodeError && 'border-red-500 focus:ring-red-500')}
                          />
                          {postalCodeError && (
                            <p className="text-xs text-red-500">{postalCodeError}</p>
                          )}
                        </div>
                        <Select value={countryCode} onValueChange={handleCountryChange}>
                          <SelectTrigger className="h-10 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATING_COUNTRIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agenda */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Agenda</Label>
                  <Textarea
                    {...register('agenda')}
                    placeholder="Meeting topics and discussion points..."
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Discussion Notes</Label>
                  <Textarea
                    {...register('discussionNotes')}
                    placeholder="What was discussed during the meeting..."
                    rows={6}
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Key Takeaways</Label>
                  <p className="text-xs text-charcoal-500">One per line</p>
                  <Textarea
                    {...register('keyTakeaways')}
                    placeholder="• Important decision made&#10;• Agreement reached on timeline&#10;• Next steps defined"
                    rows={4}
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Follow-up Notes</Label>
                  <Textarea
                    {...register('followUpNotes')}
                    placeholder="Items to follow up on after the meeting..."
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>
            )}

            {/* Action Items Tab */}
            {activeTab === 'actions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Action Items</h3>
                    <p className="text-sm text-charcoal-500">
                      {completedCount} of {actionItems.length} completed
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendActionItem({ description: '', assigneeId: null, dueDate: null, completed: false })}
                    className="rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {actionItemFields.length === 0 ? (
                  <div className="text-center py-12 bg-charcoal-50 rounded-xl">
                    <ListTodo className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                    <p className="text-charcoal-600 font-medium">No action items yet</p>
                    <p className="text-sm text-charcoal-500 mt-1">
                      Add tasks that came out of this meeting
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendActionItem({ description: '', assigneeId: null, dueDate: null, completed: false })}
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actionItemFields.map((field, index) => (
                      <div
                        key={field.id}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-xl border transition-all',
                          actionItems[index]?.completed
                            ? 'bg-green-50/50 border-green-200'
                            : 'bg-white border-charcoal-200'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleActionItemComplete(index)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {actionItems[index]?.completed ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5 text-charcoal-400 hover:text-charcoal-600" />
                          )}
                        </button>
                        
                        <div className="flex-1 space-y-3">
                          <Input
                            {...register(`actionItems.${index}.description`)}
                            placeholder="What needs to be done?"
                            className={cn(
                              'h-10 rounded-lg',
                              actionItems[index]?.completed && 'line-through text-charcoal-400'
                            )}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="date"
                              {...register(`actionItems.${index}.dueDate`)}
                              className="h-9 rounded-lg text-sm"
                            />
                            <Select 
                              value={watch(`actionItems.${index}.assigneeId`) || 'unassigned'} 
                              onValueChange={(v) => setValue(`actionItems.${index}.assigneeId`, v === 'unassigned' ? null : v)}
                            >
                              <SelectTrigger className="h-9 rounded-lg text-sm">
                                <SelectValue placeholder="Assign to..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {orgMembersQuery.data?.items?.map((member: { id: string; full_name?: string; email?: string }) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    <span className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center text-[10px] font-medium">
                                        {member.full_name?.charAt(0) || '?'}
                                      </span>
                                      {member.full_name || member.email}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeActionItem(index)}
                          className="p-1.5 rounded hover:bg-red-100 text-charcoal-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-charcoal-50 border-t border-charcoal-100">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-charcoal-500">
                {isDirty && <span className="text-amber-600">• Unsaved changes</span>}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMeetingMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  {updateMeetingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
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

