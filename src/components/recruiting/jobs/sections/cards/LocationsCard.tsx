'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  Home,
  Briefcase,
  X,
  Check,
  Navigation,
  Globe,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { AddressForm, validatePostalCode } from '@/components/addresses'

interface LocationsCardProps {
  jobId: string
}

type AddressType = 'current' | 'permanent' | 'mailing' | 'work' | 'billing' | 'shipping' | 'headquarters' | 'office' | 'job_location' | 'meeting' | 'first_day'

interface Address {
  id: string
  addressType: AddressType
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  countryCode: string
  county?: string | null
  isPrimary: boolean
  notes?: string | null
}

interface AddressFormData {
  addressType: AddressType
  addressLine1: string
  addressLine2: string
  city: string
  stateProvince: string
  postalCode: string
  countryCode: string
  county: string
  isPrimary: boolean
  notes: string
}

const ADDRESS_TYPE_OPTIONS = [
  { value: 'job_location', label: 'Job Location', icon: Briefcase },
  { value: 'work', label: 'Work Site', icon: Building2 },
  { value: 'office', label: 'Office', icon: Building2 },
  { value: 'meeting', label: 'Meeting Location', icon: Navigation },
  { value: 'first_day', label: 'First Day Location', icon: Home },
]

export function LocationsCard({ jobId }: LocationsCardProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const addressesQuery = trpc.addresses.getByEntity.useQuery({
    entityType: 'job',
    entityId: jobId,
  })

  const createMutation = trpc.addresses.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Address added' })
      utils.addresses.getByEntity.invalidate({ entityType: 'job', entityId: jobId })
      setIsAdding(false)
      resetForm()
    },
    onError: (error) => {
      toast({ title: 'Failed to add address', description: error.message, variant: 'error' })
    },
  })

  const updateMutation = trpc.addresses.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Address updated' })
      utils.addresses.getByEntity.invalidate({ entityType: 'job', entityId: jobId })
      setEditingId(null)
    },
    onError: (error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'error' })
    },
  })

  const deleteMutation = trpc.addresses.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Address removed' })
      utils.addresses.getByEntity.invalidate({ entityType: 'job', entityId: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to remove', description: error.message, variant: 'error' })
    },
  })

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [formData, setFormData] = useState<AddressFormData>({
    addressType: 'job_location',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    countryCode: 'US',
    county: '',
    isPrimary: false,
    notes: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({
      addressType: 'job_location',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      countryCode: 'US',
      county: '',
      isPrimary: false,
      notes: '',
    })
    setFormErrors({})
  }

  const startEditing = (address: Address) => {
    setEditingId(address.id)
    setFormData({
      addressType: address.addressType || 'job_location',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      stateProvince: address.stateProvince || '',
      postalCode: address.postalCode || '',
      countryCode: address.countryCode || 'US',
      county: address.county || '',
      isPrimary: address.isPrimary || false,
      notes: address.notes || '',
    })
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.city) errors.city = 'City is required'
    if (!formData.stateProvince) errors.stateProvince = 'State is required'
    if (formData.postalCode) {
      const zipResult = validatePostalCode(formData.postalCode, formData.countryCode)
      if (!zipResult.valid) {
        errors.postalCode = zipResult.message || 'Invalid postal code'
      }
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = () => {
    if (!validateForm()) return
    createMutation.mutate({
      entityType: 'job',
      entityId: jobId,
      addressType: formData.addressType,
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      city: formData.city || undefined,
      stateProvince: formData.stateProvince || undefined,
      postalCode: formData.postalCode || undefined,
      countryCode: formData.countryCode,
      county: formData.county || undefined,
      isPrimary: formData.isPrimary,
      notes: formData.notes || undefined,
    })
  }

  const handleUpdate = (id: string) => {
    if (!validateForm()) return
    updateMutation.mutate({
      id,
      addressType: formData.addressType,
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      city: formData.city || undefined,
      stateProvince: formData.stateProvince || undefined,
      postalCode: formData.postalCode || undefined,
      countryCode: formData.countryCode,
      county: formData.county || undefined,
      isPrimary: formData.isPrimary,
      notes: formData.notes || undefined,
    })
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id })
    setDeleteConfirmId(null)
  }

  const addresses = addressesQuery.data ?? []

  if (addressesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-charcoal-500">
          {addresses.length} location{addresses.length !== 1 ? 's' : ''}
          {addresses.some(a => a.isPrimary) && (
            <span className="ml-2 text-green-600">• Primary set</span>
          )}
        </div>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-3 border-2 border-dashed border-hublot-200 rounded-lg bg-hublot-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Add Location</span>
            <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); resetForm() }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Select
            value={formData.addressType}
            onValueChange={(value) => setFormData({ ...formData, addressType: value as AddressType })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ADDRESS_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddressForm
            value={{
              addressLine1: formData.addressLine1,
              addressLine2: formData.addressLine2,
              city: formData.city,
              stateProvince: formData.stateProvince,
              postalCode: formData.postalCode,
              countryCode: formData.countryCode,
              county: formData.county,
            }}
            onChange={(data) => setFormData({ ...formData, ...data })}
            errors={formErrors}
            required
            validateOnBlur
          />
          <div className="flex items-center gap-2">
            <Switch
              id="isPrimary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
            />
            <Label htmlFor="isPrimary" className="text-xs">Primary location</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !isAdding ? (
        <div className="text-center py-6">
          <MapPin className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
          <p className="text-sm text-charcoal-500">No locations set</p>
        </div>
      ) : (
        <div className="space-y-2">
          {addresses.map((address) => {
            const isEditing = editingId === address.id
            const isDeleting = deleteConfirmId === address.id
            const typeInfo = ADDRESS_TYPE_OPTIONS.find(t => t.value === address.addressType)
            const TypeIcon = typeInfo?.icon || MapPin

            if (isEditing) {
              return (
                <div key={address.id} className="p-3 border-2 border-hublot-500 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Edit Location</span>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); resetForm() }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Select
                    value={formData.addressType}
                    onValueChange={(value) => setFormData({ ...formData, addressType: value as AddressType })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDRESS_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <AddressForm
                    value={{
                      addressLine1: formData.addressLine1,
                      addressLine2: formData.addressLine2,
                      city: formData.city,
                      stateProvince: formData.stateProvince,
                      postalCode: formData.postalCode,
                      countryCode: formData.countryCode,
                      county: formData.county,
                    }}
                    onChange={(data) => setFormData({ ...formData, ...data })}
                    errors={formErrors}
                    required
                    validateOnBlur
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`isPrimary-${address.id}`}
                      checked={formData.isPrimary}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
                    />
                    <Label htmlFor={`isPrimary-${address.id}`} className="text-xs">Primary</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => handleUpdate(address.id)} disabled={updateMutation.isPending}>
                      {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={address.id}
                className="flex items-start gap-3 p-3 border rounded-lg group hover:border-charcoal-300 transition-colors"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  address.isPrimary ? 'bg-green-100 text-green-600' : 'bg-charcoal-100 text-charcoal-600'
                )}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-charcoal-900">
                      {typeInfo?.label || 'Location'}
                    </span>
                    {address.isPrimary && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-600">
                    {address.city}, {address.stateProvince} {address.postalCode}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isDeleting ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(address.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => startEditing(address)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteConfirmId(address.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
