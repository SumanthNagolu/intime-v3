'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { OrganizationAddressesSection } from './OrganizationAddressesSection'

// Validation schema
const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name too long'),
  legalName: z.string().max(200).optional().nullable(),
  industry: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  website: z
    .string()
    .url('Enter a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

// Constants
const industries = [
  'IT Staffing & Consulting',
  'Healthcare Staffing',
  'Finance & Accounting',
  'Manufacturing & Industrial',
  'Engineering',
  'Administrative & Clerical',
  'General Staffing',
  'Executive Search',
  'Technology',
  'Other',
]

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

// Get company size label from value
function getCompanySizeLabel(value: string | null | undefined): string {
  if (!value) return '—'
  const size = companySizes.find((s) => s.value === value)
  return size?.label || value
}

// Section component with validation status
interface SettingsSectionProps {
  title: string
  description?: string
  icon?: React.ElementType
  children: React.ReactNode
  isValid?: boolean
  hasErrors?: boolean
  className?: string
  onEdit?: () => void
  isEditing?: boolean
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  isValid,
  hasErrors,
  className,
  onEdit,
  isEditing,
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-elevation-xs transition-all duration-300',
        hasErrors ? 'border-error-200' : 'border-charcoal-100',
        className
      )}
    >
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={cn(
                  'p-2 rounded-lg',
                  hasErrors ? 'bg-error-50' : 'bg-charcoal-50'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    hasErrors ? 'text-error-600' : 'text-charcoal-600'
                  )}
                />
              </div>
            )}
            <div>
              <h3 className="font-heading text-lg font-semibold text-charcoal-900 tracking-wide">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-charcoal-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator - only show in edit mode */}
            {isEditing && isValid !== undefined && (
              <div className="flex items-center gap-1.5">
                {isValid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    <span className="text-xs text-success-600 font-medium">Complete</span>
                  </>
                ) : hasErrors ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-error-500" />
                    <span className="text-xs text-error-600 font-medium">Has errors</span>
                  </>
                ) : (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    Incomplete
                  </Badge>
                )}
              </div>
            )}

            {/* Edit button - only show in view mode */}
            {onEdit && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-charcoal-500 hover:text-charcoal-700"
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// Read-only field display
interface ReadOnlyFieldProps {
  label: string
  value: string | null | undefined
  icon?: React.ReactNode
  className?: string
}

function ReadOnlyField({ label, value, icon, className }: ReadOnlyFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex items-center gap-2 min-h-[44px] py-2">
        {icon && <span className="text-charcoal-400">{icon}</span>}
        <span className={cn(
          'text-sm',
          value ? 'text-charcoal-900' : 'text-charcoal-400 italic'
        )}>
          {value || '—'}
        </span>
      </div>
    </div>
  )
}

// Form field wrapper with validation
interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

function FormField({ label, required, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-error-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-error-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// Edit toolbar component
interface EditToolbarProps {
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  isDirty: boolean
}

function EditToolbar({ onSave, onCancel, isSaving, isDirty }: EditToolbarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 px-6 py-3 bg-charcoal-900 text-white rounded-t-xl flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Pencil className="h-4 w-4 text-gold-400" />
        <span className="text-sm font-medium">Editing</span>
        {isDirty && (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
            Unsaved changes
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
          className="text-charcoal-300 hover:text-white hover:bg-charcoal-800"
        >
          <X className="h-4 w-4 mr-1.5" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="bg-gold-500 hover:bg-gold-600 text-charcoal-900"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function OrganizationSettingsPageV2() {
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = React.useState(false)

  // Fetch organization data
  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()

  // Form setup with react-hook-form
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      legalName: '',
      industry: null,
      companySize: null,
      website: '',
      email: '',
      phone: '',
    },
  })

  // Update form when data loads
  React.useEffect(() => {
    if (organization) {
      console.log('[OrganizationSettings] Loading data:', {
        industry: organization.industry,
        company_size: organization.company_size,
      })
      reset({
        name: organization.name || '',
        legalName: organization.legal_name || '',
        industry: organization.industry || null,
        companySize: organization.company_size || null,
        website: organization.website || '',
        email: organization.email || '',
        phone: organization.phone || '',
      })
    }
  }, [organization, reset])

  // Update mutation
  const updateOrganization = trpc.settings.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success('Organization settings saved successfully')
      utils.settings.getOrganization.invalidate()
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  // Submit handler
  const onSubmit = (data: OrganizationFormData) => {
    const payload = {
      name: data.name.trim(),
      legal_name: data.legalName?.trim() || null,
      industry: data.industry || null,
      company_size: data.companySize || null,
      website: data.website?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
    }
    console.log('[OrganizationSettings] Saving:', payload)
    updateOrganization.mutate(payload)
  }

  // Handle cancel - reset form and exit edit mode
  const handleCancel = () => {
    if (organization) {
      reset({
        name: organization.name || '',
        legalName: organization.legal_name || '',
        industry: organization.industry || null,
        companySize: organization.company_size || null,
        website: organization.website || '',
        email: organization.email || '',
        phone: organization.phone || '',
      })
    }
    setIsEditing(false)
  }

  // Enter edit mode
  const handleEdit = () => {
    setIsEditing(true)
  }

  // Watch form values for section validation
  const watchedValues = watch()

  // Section validation
  const generalInfoValid =
    !!watchedValues.name && watchedValues.name.length >= 2
  const generalInfoHasErrors = !!errors.name || !!errors.legalName || !!errors.industry

  const contactValid = !!watchedValues.email || !!watchedValues.phone
  const contactHasErrors = !!errors.email || !!errors.phone

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-charcoal-100 rounded-xl" />
          <div className="h-32 bg-charcoal-100 rounded-xl" />
          <div className="h-48 bg-charcoal-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* General Information Section */}
      <SettingsSection
        title="General Information"
        description="Basic information about your organization"
        icon={Building2}
        isValid={isEditing ? generalInfoValid : undefined}
        hasErrors={isEditing ? generalInfoHasErrors : undefined}
        onEdit={handleEdit}
        isEditing={isEditing}
      >
        {isEditing && (
          <EditToolbar
            onSave={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            isSaving={updateOrganization.isPending}
            isDirty={isDirty}
          />
        )}

        {isEditing ? (
          // Edit mode - form fields
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Organization Name"
              required
              error={errors.name?.message}
            >
              <Input
                {...register('name')}
                placeholder="Enter organization name"
                className={cn(
                  'h-11',
                  errors.name && 'border-error-400 focus:border-error-500'
                )}
              />
            </FormField>

            <FormField label="Legal Name" error={errors.legalName?.message}>
              <Input
                {...register('legalName')}
                placeholder="Legal entity name (if different)"
                className="h-11"
              />
            </FormField>

            <FormField label="Industry" error={errors.industry?.message}>
              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Company Size" error={errors.companySize?.message}>
              <Controller
                name="companySize"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label="Website"
              error={errors.website?.message}
              className="md:col-span-2"
            >
              <Input
                {...register('website')}
                type="url"
                placeholder="https://www.example.com"
                leftIcon={<Globe className="h-4 w-4" />}
                className="h-11"
              />
            </FormField>
          </div>
        ) : (
          // View mode - read-only display
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadOnlyField
              label="Organization Name"
              value={organization?.name}
            />
            <ReadOnlyField
              label="Legal Name"
              value={organization?.legal_name}
            />
            <ReadOnlyField
              label="Industry"
              value={organization?.industry}
            />
            <ReadOnlyField
              label="Company Size"
              value={getCompanySizeLabel(organization?.company_size)}
            />
            <ReadOnlyField
              label="Website"
              value={organization?.website}
              icon={<Globe className="h-4 w-4" />}
              className="md:col-span-2"
            />
          </div>
        )}
      </SettingsSection>

      {/* Contact Information Section */}
      <SettingsSection
        title="Contact Information"
        description="How people can reach your organization"
        icon={Phone}
        isValid={isEditing ? contactValid : undefined}
        hasErrors={isEditing ? contactHasErrors : undefined}
        onEdit={handleEdit}
        isEditing={isEditing}
      >
        {isEditing ? (
          // Edit mode - form fields
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Contact Email" error={errors.email?.message}>
              <Input
                {...register('email')}
                type="email"
                placeholder="contact@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                className="h-11"
              />
            </FormField>

            <FormField label="Phone Number" error={errors.phone?.message}>
              <Input
                {...register('phone')}
                type="tel"
                placeholder="+1 (555) 123-4567"
                leftIcon={<Phone className="h-4 w-4" />}
                className="h-11"
              />
            </FormField>
          </div>
        ) : (
          // View mode - read-only display
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadOnlyField
              label="Contact Email"
              value={organization?.email}
              icon={<Mail className="h-4 w-4" />}
            />
            <ReadOnlyField
              label="Phone Number"
              value={organization?.phone}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        )}
      </SettingsSection>

      {/* Addresses - managed separately */}
      {organization?.id && (
        <OrganizationAddressesSection organizationId={organization.id} />
      )}
    </div>
  )
}

export default OrganizationSettingsPageV2
