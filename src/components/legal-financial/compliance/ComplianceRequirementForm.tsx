'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

// Schema matching router input
const requirementSchema = z.object({
  requirementName: z.string().min(1, 'Name is required').max(200),
  requirementCode: z.string().max(50).optional(),
  category: z.enum(['background', 'drug_test', 'certification', 'training', 'insurance', 'legal', 'immigration', 'health', 'tax', 'other']).optional(),
  subcategory: z.string().max(50).optional(),
  description: z.string().optional(),
  appliesToEntityTypes: z.array(z.string()).min(1, 'At least one entity type required'),
  isBlocking: z.boolean().default(false),
  validityPeriodDays: z.number().int().positive().nullable().optional(),
  renewalLeadDays: z.number().int().min(0).default(30),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  requiresDocument: z.boolean().default(true),
})

type RequirementFormData = z.input<typeof requirementSchema>

interface ComplianceRequirementFormProps {
  requirement?: {
    id: string
    requirementName: string
    requirementCode: string | null
    category: string | null
    subcategory: string | null
    description: string | null
    appliesToEntityTypes: string[]
    isBlocking: boolean
    validityPeriodDays: number | null
    renewalLeadDays: number
    priority: string
    requiresDocument: boolean
  }
  onSuccess: () => void
  onCancel: () => void
}

const ENTITY_TYPES = [
  { value: 'candidate', label: 'Candidate' },
  { value: 'placement', label: 'Placement' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'employee', label: 'Employee' },
  { value: 'client', label: 'Client' },
  { value: 'account', label: 'Account' },
  { value: 'job', label: 'Job' },
]

const CATEGORIES = [
  { value: 'background', label: 'Background Check' },
  { value: 'drug_test', label: 'Drug Testing' },
  { value: 'certification', label: 'Certification' },
  { value: 'training', label: 'Training' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'legal', label: 'Legal Document' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'health', label: 'Health' },
  { value: 'tax', label: 'Tax Document' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

/**
 * ComplianceRequirementForm - Form for managing compliance requirements
 *
 * Admin-only form for defining organization-wide compliance requirements.
 * Requirements define what compliance items are needed for different entity types.
 */
export function ComplianceRequirementForm({
  requirement,
  onSuccess,
  onCancel,
}: ComplianceRequirementFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(
    requirement?.appliesToEntityTypes ?? []
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequirementFormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      requirementName: requirement?.requirementName ?? '',
      requirementCode: requirement?.requirementCode ?? '',
      category: (requirement?.category as RequirementFormData['category']) ?? undefined,
      subcategory: requirement?.subcategory ?? '',
      description: requirement?.description ?? '',
      appliesToEntityTypes: requirement?.appliesToEntityTypes ?? [],
      isBlocking: requirement?.isBlocking ?? false,
      validityPeriodDays: requirement?.validityPeriodDays ?? null,
      renewalLeadDays: requirement?.renewalLeadDays ?? 30,
      priority: (requirement?.priority as RequirementFormData['priority']) ?? 'medium',
      requiresDocument: requirement?.requiresDocument ?? true,
    },
  })

  const createMutation = trpc.compliance.requirements.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Requirement created',
        description: 'The compliance requirement has been successfully created.',
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create requirement.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const updateMutation = trpc.compliance.requirements.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Requirement updated',
        description: 'The compliance requirement has been successfully updated.',
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update requirement.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const onSubmit = (data: RequirementFormData) => {
    setIsSubmitting(true)

    if (requirement) {
      updateMutation.mutate({
        id: requirement.id,
        requirementName: data.requirementName,
        description: data.description,
        subcategory: data.subcategory,
        appliesToEntityTypes: data.appliesToEntityTypes,
        isBlocking: data.isBlocking,
        validityPeriodDays: data.validityPeriodDays,
        renewalLeadDays: data.renewalLeadDays,
        priority: data.priority,
        requiresDocument: data.requiresDocument,
      })
    } else {
      // Validate required fields for create
      if (!data.requirementCode) {
        toast({
          title: 'Validation Error',
          description: 'Requirement code is required.',
          variant: 'error',
        })
        setIsSubmitting(false)
        return
      }
      if (!data.category) {
        toast({
          title: 'Validation Error',
          description: 'Category is required.',
          variant: 'error',
        })
        setIsSubmitting(false)
        return
      }

      createMutation.mutate({
        requirementName: data.requirementName,
        requirementCode: data.requirementCode,
        category: data.category,
        subcategory: data.subcategory,
        description: data.description,
        appliesToEntityTypes: data.appliesToEntityTypes,
        isBlocking: data.isBlocking ?? false,
        validityPeriodDays: data.validityPeriodDays ?? undefined,
        renewalLeadDays: data.renewalLeadDays ?? 30,
        priority: data.priority ?? 'medium',
        requiresDocument: data.requiresDocument ?? true,
      })
    }
  }

  const toggleEntityType = (entityType: string) => {
    const newTypes = selectedEntityTypes.includes(entityType)
      ? selectedEntityTypes.filter((t) => t !== entityType)
      : [...selectedEntityTypes, entityType]
    setSelectedEntityTypes(newTypes)
    setValue('appliesToEntityTypes', newTypes)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-charcoal-900">
          {requirement ? 'Edit Requirement' : 'Create Requirement'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="requirementName">Requirement Name *</Label>
          <Input
            {...register('requirementName')}
            placeholder="E.g., Background Check, HIPAA Training..."
          />
          {errors.requirementName && (
            <p className="text-sm text-red-600">{errors.requirementName.message}</p>
          )}
        </div>

        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="requirementCode">Requirement Code</Label>
          <Input
            {...register('requirementCode')}
            placeholder="E.g., BGC-001"
            disabled={!!requirement}
          />
          {errors.requirementCode && (
            <p className="text-sm text-red-600">{errors.requirementCode.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={watch('category') || 'none'}
            onValueChange={(value) => setValue('category', value === 'none' ? undefined : value as RequirementFormData['category'])}
            disabled={!!requirement}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            value={watch('priority')}
            onValueChange={(value) => setValue('priority', value as RequirementFormData['priority'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority..." />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Validity Period */}
        <div className="space-y-2">
          <Label htmlFor="validityPeriodDays">Validity Period (Days)</Label>
          <Input
            type="number"
            {...register('validityPeriodDays', { valueAsNumber: true })}
            placeholder="E.g., 365 for annual"
          />
          <p className="text-xs text-charcoal-500">Leave empty for non-expiring requirements</p>
        </div>

        {/* Renewal Lead Days */}
        <div className="space-y-2">
          <Label htmlFor="renewalLeadDays">Renewal Lead Days</Label>
          <Input
            type="number"
            {...register('renewalLeadDays', { valueAsNumber: true })}
            placeholder="30"
          />
          <p className="text-xs text-charcoal-500">Days before expiry to alert</p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          {...register('description')}
          placeholder="Describe this compliance requirement..."
          rows={3}
        />
      </div>

      {/* Entity Types */}
      {!requirement && (
        <div className="space-y-3">
          <Label>Applies To Entity Types *</Label>
          <div className="grid grid-cols-4 gap-3">
            {ENTITY_TYPES.map((type) => (
              <div
                key={type.value}
                className="flex items-center space-x-2 p-3 border border-charcoal-200 rounded-lg cursor-pointer hover:bg-charcoal-50"
                onClick={() => toggleEntityType(type.value)}
              >
                <Checkbox
                  id={`entity-${type.value}`}
                  checked={selectedEntityTypes.includes(type.value)}
                  onCheckedChange={() => toggleEntityType(type.value)}
                />
                <Label htmlFor={`entity-${type.value}`} className="cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.appliesToEntityTypes && (
            <p className="text-sm text-red-600">{errors.appliesToEntityTypes.message}</p>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Checkbox
            id="isBlocking"
            checked={watch('isBlocking')}
            onCheckedChange={(checked) => setValue('isBlocking', !!checked)}
          />
          <div>
            <Label htmlFor="isBlocking" className="font-medium cursor-pointer">
              Blocking Requirement
            </Label>
            <p className="text-sm text-charcoal-600 mt-0.5">
              If enabled, placements cannot proceed without this compliance item being verified.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-charcoal-50 border border-charcoal-200 rounded-lg">
          <Checkbox
            id="requiresDocument"
            checked={watch('requiresDocument')}
            onCheckedChange={(checked) => setValue('requiresDocument', !!checked)}
          />
          <div>
            <Label htmlFor="requiresDocument" className="font-medium cursor-pointer">
              Requires Document Upload
            </Label>
            <p className="text-sm text-charcoal-600 mt-0.5">
              If enabled, a document must be uploaded to verify this requirement.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-charcoal-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {requirement ? 'Update' : 'Create'} Requirement
        </Button>
      </div>
    </form>
  )
}
