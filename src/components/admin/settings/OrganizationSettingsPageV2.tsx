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
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
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
import { SmartAddressInput, type AddressValue } from './SmartAddressInput'
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
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
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

// Section component with validation status
interface SettingsSectionProps {
  title: string
  description?: string
  icon?: React.ElementType
  children: React.ReactNode
  isValid?: boolean
  hasErrors?: boolean
  className?: string
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  isValid,
  hasErrors,
  className,
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

          {/* Status indicator */}
          {isValid !== undefined && (
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
        </div>
      </div>
      <div className="p-6">{children}</div>
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

export function OrganizationSettingsPageV2() {
  const utils = trpc.useUtils()

  // Fetch organization data
  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()

  // Form setup with react-hook-form
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields, isSubmitting },
    watch,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      legalName: '',
      industry: '',
      companySize: '',
      website: '',
      email: '',
      phone: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      },
    },
  })

  // Update form when data loads
  React.useEffect(() => {
    if (organization) {
      reset({
        name: organization.name || '',
        legalName: organization.legal_name || '',
        industry: organization.industry || '',
        companySize: organization.company_size || '',
        website: organization.website || '',
        email: organization.email || '',
        phone: organization.phone || '',
        address: {
          line1: organization.address_line1 || '',
          line2: organization.address_line2 || '',
          city: organization.city || '',
          state: organization.state || '',
          postalCode: organization.postal_code || '',
          country: organization.country || 'US',
        },
      })
    }
  }, [organization, reset])

  // Update mutation
  const updateOrganization = trpc.settings.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success('Organization settings saved successfully')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  // Submit handler
  const onSubmit = (data: OrganizationFormData) => {
    updateOrganization.mutate({
      name: data.name.trim(),
      legal_name: data.legalName?.trim() || null,
      industry: data.industry || null,
      company_size: data.companySize || null,
      website: data.website?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      address_line1: data.address.line1?.trim() || null,
      address_line2: data.address.line2?.trim() || null,
      city: data.address.city?.trim() || null,
      state: data.address.state?.trim() || null,
      postal_code: data.address.postalCode?.trim() || null,
      country: data.address.country?.trim() || null,
    })
  }

  // Watch form values for section validation
  const watchedValues = watch()

  // Section validation
  const generalInfoValid =
    !!watchedValues.name && watchedValues.name.length >= 2
  const generalInfoHasErrors = !!errors.name || !!errors.legalName || !!errors.industry

  const contactValid = !!watchedValues.email || !!watchedValues.phone
  const contactHasErrors = !!errors.email || !!errors.phone

  const addressValid =
    !!watchedValues.address?.line1 &&
    !!watchedValues.address?.city &&
    !!watchedValues.address?.state
  const addressHasErrors = !!errors.address

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Profile' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-charcoal-100 rounded-xl" />
          <div className="h-32 bg-charcoal-100 rounded-xl" />
          <div className="h-48 bg-charcoal-100 rounded-xl" />
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-3">
            {isDirty && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Unsaved changes
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => reset()}
              disabled={!isDirty || updateOrganization.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={updateOrganization.isPending}
            >
              {updateOrganization.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Information */}
        <SettingsSection
          title="General Information"
          description="Basic information about your organization"
          icon={Building2}
          isValid={generalInfoValid}
          hasErrors={generalInfoHasErrors}
        >
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
                  <Select value={field.value || ''} onValueChange={field.onChange}>
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
                  <Select value={field.value || ''} onValueChange={field.onChange}>
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
        </SettingsSection>

        {/* Contact Information */}
        <SettingsSection
          title="Contact Information"
          description="How people can reach your organization"
          icon={Phone}
          isValid={contactValid}
          hasErrors={contactHasErrors}
        >
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
        </SettingsSection>

        {/* Address */}
        <SettingsSection
          title="Headquarters Address"
          description="Primary business address"
          icon={MapPin}
          isValid={addressValid}
          hasErrors={addressHasErrors}
        >
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <SmartAddressInput
                value={field.value as AddressValue}
                onChange={field.onChange}
                errors={{
                  line1: errors.address?.line1?.message,
                  city: errors.address?.city?.message,
                  state: errors.address?.state?.message,
                  postalCode: errors.address?.postalCode?.message,
                }}
              />
            )}
          />
        </SettingsSection>

        {/* Additional Addresses */}
        {organization?.id && (
          <OrganizationAddressesSection organizationId={organization.id} />
        )}

        {/* Mobile submit button */}
        <div className="md:hidden sticky bottom-4">
          <Button
            type="submit"
            className="w-full shadow-elevation-md"
            disabled={updateOrganization.isPending}
          >
            {updateOrganization.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </AdminPageContent>
  )
}

export default OrganizationSettingsPageV2
