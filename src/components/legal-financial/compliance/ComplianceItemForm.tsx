'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

// Match the router's status enum
const complianceStatusEnum = z.enum([
  'pending', 'received', 'under_review', 'verified',
  'expiring', 'expired', 'rejected', 'waived'
])

const complianceItemSchema = z.object({
  requirementId: z.string().uuid().optional(),
  complianceType: z.string().min(1, 'Compliance type is required'),
  complianceName: z.string().optional(),
  status: complianceStatusEnum,
  expiryDate: z.date().optional(),
  effectiveDate: z.date().optional(),
  verificationNotes: z.string().optional(),
})

type ComplianceItemFormData = z.infer<typeof complianceItemSchema>

interface ComplianceItemFormProps {
  entityType: string
  entityId: string
  item?: {
    id: string
    requirementId: string | null
    complianceType: string | null
    complianceName: string | null
    status: string
    expiryDate: string | null
    effectiveDate: string | null
    verificationNotes: string | null
  }
  onSuccess: () => void
  onCancel: () => void
}

const COMPLIANCE_TYPES = [
  { value: 'background', label: 'Background Check' },
  { value: 'drug_test', label: 'Drug Test' },
  { value: 'certification', label: 'Certification' },
  { value: 'training', label: 'Training' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'legal', label: 'Legal Document' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'health', label: 'Health Screening' },
  { value: 'tax', label: 'Tax Document' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'received', label: 'Received' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'verified', label: 'Verified' },
  { value: 'expiring', label: 'Expiring' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'waived', label: 'Waived' },
]

/**
 * ComplianceItemForm - Form for adding/editing compliance items
 *
 * Supports:
 * - Creating new compliance items
 * - Editing existing items
 * - Linking to compliance requirements
 * - Setting expiration dates
 */
export function ComplianceItemForm({
  entityType,
  entityId,
  item,
  onSuccess,
  onCancel,
}: ComplianceItemFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available requirements
  const requirementsQuery = trpc.compliance.requirements.list.useQuery({
    isActive: true,
    limit: 100,
  })

  const requirements = requirementsQuery.data?.items ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ComplianceItemFormData>({
    resolver: zodResolver(complianceItemSchema),
    defaultValues: {
      requirementId: item?.requirementId ?? undefined,
      complianceType: item?.complianceType ?? '',
      complianceName: item?.complianceName ?? '',
      status: (item?.status as ComplianceItemFormData['status']) ?? 'pending',
      expiryDate: item?.expiryDate ? new Date(item.expiryDate) : undefined,
      effectiveDate: item?.effectiveDate ? new Date(item.effectiveDate) : undefined,
      verificationNotes: item?.verificationNotes ?? '',
    },
  })

  const createMutation = trpc.compliance.items.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Compliance item added',
        description: 'The compliance item has been successfully created.',
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create compliance item.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const updateMutation = trpc.compliance.items.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Compliance item updated',
        description: 'The compliance item has been successfully updated.',
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update compliance item.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const onSubmit = (data: ComplianceItemFormData) => {
    setIsSubmitting(true)

    if (item) {
      updateMutation.mutate({
        id: item.id,
        status: data.status,
        expiryDate: data.expiryDate?.toISOString().split('T')[0],
        effectiveDate: data.effectiveDate?.toISOString().split('T')[0],
        verificationNotes: data.verificationNotes,
      })
    } else {
      createMutation.mutate({
        entityType,
        entityId,
        requirementId: data.requirementId,
        complianceType: data.complianceType,
        complianceName: data.complianceName,
        status: data.status,
        expiryDate: data.expiryDate?.toISOString().split('T')[0],
        effectiveDate: data.effectiveDate?.toISOString().split('T')[0],
        verificationNotes: data.verificationNotes,
      })
    }
  }

  const selectedRequirementId = watch('requirementId')
  const expiryDate = watch('expiryDate')
  const effectiveDate = watch('effectiveDate')

  // Auto-fill compliance type when requirement is selected
  const handleRequirementChange = (requirementId: string) => {
    if (requirementId === 'none') {
      setValue('requirementId', undefined)
      return
    }
    setValue('requirementId', requirementId)
    const requirement = requirements.find((r) => r.id === requirementId)
    if (requirement?.category) {
      // Try to match category to compliance type
      const matchingType = COMPLIANCE_TYPES.find(
        (t) => t.value === requirement.category
      )
      if (matchingType) {
        setValue('complianceType', matchingType.value)
      }
      setValue('complianceName', requirement.requirementName)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-charcoal-900">
          {item ? 'Edit Compliance Item' : 'Add Compliance Item'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Requirement (optional) */}
        <div className="space-y-2">
          <Label htmlFor="requirementId">Linked Requirement (Optional)</Label>
          <Select
            value={selectedRequirementId || 'none'}
            onValueChange={handleRequirementChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a requirement..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No linked requirement</SelectItem>
              {requirements.map((req) => (
                <SelectItem key={req.id} value={req.id}>
                  {req.requirementName}
                  {req.isBlocking && ' *'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.requirementId && (
            <p className="text-sm text-red-600">{errors.requirementId.message}</p>
          )}
        </div>

        {/* Compliance Type */}
        <div className="space-y-2">
          <Label htmlFor="complianceType">Compliance Type *</Label>
          <Select
            value={watch('complianceType')}
            onValueChange={(value) => setValue('complianceType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select compliance type..." />
            </SelectTrigger>
            <SelectContent>
              {COMPLIANCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.complianceType && (
            <p className="text-sm text-red-600">{errors.complianceType.message}</p>
          )}
        </div>

        {/* Compliance Name */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="complianceName">Compliance Name</Label>
          <Input
            {...register('complianceName')}
            placeholder="E.g., Annual Background Check, HIPAA Training..."
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as ComplianceItemFormData['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Effective Date */}
        <div className="space-y-2">
          <Label>Effective Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !effectiveDate && 'text-charcoal-400'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {effectiveDate ? format(effectiveDate, 'MMM d, yyyy') : 'Select date...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={effectiveDate}
                onSelect={(date) => setValue('effectiveDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Expiration Date */}
        <div className="space-y-2">
          <Label>Expiration Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !expiryDate && 'text-charcoal-400'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiryDate ? format(expiryDate, 'MMM d, yyyy') : 'Select date...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiryDate}
                onSelect={(date) => setValue('expiryDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.expiryDate && (
            <p className="text-sm text-red-600">{errors.expiryDate.message}</p>
          )}
        </div>
      </div>

      {/* Verification Notes */}
      <div className="space-y-2">
        <Label htmlFor="verificationNotes">Verification Notes</Label>
        <Textarea
          {...register('verificationNotes')}
          placeholder="Additional notes about this compliance item..."
          rows={3}
        />
        {errors.verificationNotes && (
          <p className="text-sm text-red-600">{errors.verificationNotes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-charcoal-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {item ? 'Update' : 'Add'} Item
        </Button>
      </div>
    </form>
  )
}
