'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  Loader2,
  Building2,
  Home,
  Package,
  Briefcase,
  AlertCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { getStatesByCountry, OPERATING_COUNTRIES } from '@/components/addresses'

// Address types for organizations
const ADDRESS_TYPES = [
  { value: 'headquarters', label: 'Headquarters', icon: Building2 },
  { value: 'office', label: 'Office', icon: Briefcase },
  { value: 'mailing', label: 'Mailing', icon: Package },
  { value: 'billing', label: 'Billing', icon: Home },
] as const

type AddressType = (typeof ADDRESS_TYPES)[number]['value']

// Form schema
const addressFormSchema = z.object({
  addressType: z.enum(['headquarters', 'office', 'mailing', 'billing']),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  stateProvince: z.string().min(1, 'State/Province is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  countryCode: z.string().length(2),
  isPrimary: z.boolean(),
  notes: z.string().optional(),
})

type AddressFormData = z.infer<typeof addressFormSchema>

interface Address {
  id: string
  addressType: string
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  countryCode: string
  isPrimary: boolean
  notes: string | null
}

interface AddressCardProps {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetPrimary: () => void
  isDeleting?: boolean
  isSettingPrimary?: boolean
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetPrimary,
  isDeleting,
  isSettingPrimary,
}: AddressCardProps) {
  const typeConfig = ADDRESS_TYPES.find((t) => t.value === address.addressType)
  const Icon = typeConfig?.icon || MapPin
  const countryName = OPERATING_COUNTRIES.find((c: { value: string; label: string }) => c.value === address.countryCode)?.label || address.countryCode

  return (
    <div
      className={cn(
        'relative rounded-xl border p-5 transition-all duration-300',
        address.isPrimary
          ? 'border-gold-300 bg-gold-50/50 shadow-elevation-xs'
          : 'border-charcoal-100 bg-white hover:border-charcoal-200 hover:shadow-elevation-xs'
      )}
    >
      {/* Primary badge */}
      {address.isPrimary && (
        <Badge className="absolute -top-2 -right-2 bg-gold-500 text-white">
          <Star className="h-3 w-3 mr-1" />
          Primary
        </Badge>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            address.isPrimary ? 'bg-gold-100 text-gold-600' : 'bg-charcoal-100 text-charcoal-600'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-heading font-semibold text-charcoal-900 capitalize">
              {typeConfig?.label || address.addressType}
            </h4>
          </div>

          <div className="text-sm text-charcoal-600 space-y-0.5">
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {[address.city, address.stateProvince, address.postalCode].filter(Boolean).join(', ')}
            </p>
            <p className="text-charcoal-500">{countryName}</p>
          </div>

          {address.notes && (
            <p className="mt-2 text-xs text-charcoal-400 italic">{address.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!address.isPrimary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSetPrimary}
              disabled={isSettingPrimary}
              className="text-charcoal-500 hover:text-gold-600"
              title="Set as primary"
            >
              {isSettingPrimary ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-charcoal-500 hover:text-charcoal-700"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-charcoal-500 hover:text-error-600"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface AddressFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAddress?: Address | null
  organizationId: string
  onSuccess: () => void
}

function AddressFormDialog({
  open,
  onOpenChange,
  editingAddress,
  organizationId,
  onSuccess,
}: AddressFormDialogProps) {
  const isEditing = !!editingAddress

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      addressType: 'office',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      countryCode: 'US',
      isPrimary: false,
      notes: '',
    },
  })

  // Reset form when dialog opens with editing data
  React.useEffect(() => {
    if (open) {
      if (editingAddress) {
        reset({
          addressType: editingAddress.addressType as AddressType,
          addressLine1: editingAddress.addressLine1 || '',
          addressLine2: editingAddress.addressLine2 || '',
          city: editingAddress.city || '',
          stateProvince: editingAddress.stateProvince || '',
          postalCode: editingAddress.postalCode || '',
          countryCode: editingAddress.countryCode || 'US',
          isPrimary: editingAddress.isPrimary,
          notes: editingAddress.notes || '',
        })
      } else {
        reset({
          addressType: 'office',
          addressLine1: '',
          addressLine2: '',
          city: '',
          stateProvince: '',
          postalCode: '',
          countryCode: 'US',
          isPrimary: false,
          notes: '',
        })
      }
    }
  }, [open, editingAddress, reset])

  const countryCode = watch('countryCode')
  const stateOptions = getStatesByCountry(countryCode)

  const createMutation = trpc.addresses.create.useMutation({
    onSuccess: () => {
      toast.success('Address added successfully')
      onOpenChange(false)
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add address')
    },
  })

  const updateMutation = trpc.addresses.update.useMutation({
    onSuccess: () => {
      toast.success('Address updated successfully')
      onOpenChange(false)
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update address')
    },
  })

  const onSubmit = (data: AddressFormData) => {
    if (isEditing && editingAddress) {
      updateMutation.mutate({
        id: editingAddress.id,
        addressType: data.addressType,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
        city: data.city,
        stateProvince: data.stateProvince,
        postalCode: data.postalCode,
        countryCode: data.countryCode,
        isPrimary: data.isPrimary,
        notes: data.notes || undefined,
      })
    } else {
      createMutation.mutate({
        entityType: 'organization',
        entityId: organizationId,
        addressType: data.addressType,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
        city: data.city,
        stateProvince: data.stateProvince,
        postalCode: data.postalCode,
        countryCode: data.countryCode,
        isPrimary: data.isPrimary,
        notes: data.notes || undefined,
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the address details below.'
              : 'Add a new address for your organization.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Address Type */}
          <div className="space-y-2">
            <Label>Address Type</Label>
            <Controller
              name="addressType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDRESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Address Lines */}
          <div className="space-y-2">
            <Label>
              Address Line 1 <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register('addressLine1')}
              placeholder="Street address"
              className={cn('h-11', errors.addressLine1 && 'border-error-400')}
            />
            {errors.addressLine1 && (
              <p className="text-xs text-error-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.addressLine1.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Address Line 2</Label>
            <Input
              {...register('addressLine2')}
              placeholder="Suite, unit, building, etc."
              className="h-11"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Controller
              name="countryCode"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATING_COUNTRIES.map((country: { value: string; label: string }) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* City, State, Postal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                City <span className="text-error-500">*</span>
              </Label>
              <Input
                {...register('city')}
                placeholder="City"
                className={cn('h-11', errors.city && 'border-error-400')}
              />
              {errors.city && (
                <p className="text-xs text-error-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                State/Province <span className="text-error-500">*</span>
              </Label>
              {stateOptions.length > 0 ? (
                <Controller
                  name="stateProvince"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={cn('h-11', errors.stateProvince && 'border-error-400')}>
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
                  )}
                />
              ) : (
                <Input
                  {...register('stateProvince')}
                  placeholder="State/Province"
                  className={cn('h-11', errors.stateProvince && 'border-error-400')}
                />
              )}
              {errors.stateProvince && (
                <p className="text-xs text-error-500">{errors.stateProvince.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Postal Code <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register('postalCode')}
              placeholder="Postal code"
              className={cn('h-11 w-40', errors.postalCode && 'border-error-400')}
            />
            {errors.postalCode && (
              <p className="text-xs text-error-500">{errors.postalCode.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              {...register('notes')}
              placeholder="Optional notes about this address"
              className="h-11"
            />
          </div>

          {/* Primary checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              {...register('isPrimary')}
              className="h-4 w-4 rounded border-charcoal-300 text-gold-600 focus:ring-gold-500"
            />
            <Label htmlFor="isPrimary" className="text-sm font-normal">
              Set as primary address
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : isEditing ? (
                'Update Address'
              ) : (
                'Add Address'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface OrganizationAddressesSectionProps {
  organizationId: string
  className?: string
}

export function OrganizationAddressesSection({
  organizationId,
  className,
}: OrganizationAddressesSectionProps) {
  const utils = trpc.useUtils()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

  // Fetch addresses
  const { data: addresses, isLoading } = trpc.addresses.getByEntity.useQuery({
    entityType: 'organization',
    entityId: organizationId,
  })

  // Mutations
  const deleteMutation = trpc.addresses.delete.useMutation({
    onSuccess: () => {
      toast.success('Address deleted')
      setDeleteConfirmId(null)
      utils.addresses.getByEntity.invalidate({
        entityType: 'organization',
        entityId: organizationId,
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete address')
    },
  })

  const setPrimaryMutation = trpc.addresses.setPrimary.useMutation({
    onSuccess: () => {
      toast.success('Primary address updated')
      utils.addresses.getByEntity.invalidate({
        entityType: 'organization',
        entityId: organizationId,
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update primary address')
    },
  })

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate({ id: deleteConfirmId })
    }
  }

  const handleSetPrimary = (id: string) => {
    setPrimaryMutation.mutate({ id })
  }

  const handleFormSuccess = () => {
    utils.addresses.getByEntity.invalidate({
      entityType: 'organization',
      entityId: organizationId,
    })
  }

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-charcoal-100 bg-white shadow-elevation-xs', className)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-charcoal-50 rounded-lg">
              <MapPin className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-charcoal-900">
                Business Addresses
              </h3>
              <p className="text-sm text-charcoal-500">Loading...</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-charcoal-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn('rounded-xl border border-charcoal-100 bg-white shadow-elevation-xs', className)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-charcoal-50 rounded-lg">
                <MapPin className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-charcoal-900 tracking-wide">
                  Business Addresses
                </h3>
                <p className="text-sm text-charcoal-500 mt-0.5">
                  Manage your organization&apos;s locations
                </p>
              </div>
            </div>
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
        </div>

        <div className="p-6">
          {!addresses || addresses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-charcoal-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-charcoal-400" />
              </div>
              <h4 className="font-medium text-charcoal-700 mb-1">No addresses yet</h4>
              <p className="text-sm text-charcoal-500 mb-4">
                Add your first business address to get started.
              </p>
              <Button onClick={handleAddNew} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => handleEdit(address)}
                  onDelete={() => handleDelete(address.id)}
                  onSetPrimary={() => handleSetPrimary(address.id)}
                  isDeleting={deleteMutation.isPending && deleteConfirmId === address.id}
                  isSettingPrimary={setPrimaryMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <AddressFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingAddress={editingAddress}
        organizationId={organizationId}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-error-600 hover:bg-error-700 text-white"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default OrganizationAddressesSection
