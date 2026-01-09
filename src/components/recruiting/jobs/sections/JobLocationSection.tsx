'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { AddressForm, ADDRESS_TYPES, validatePostalCode } from '@/components/addresses'

interface JobLocationSectionProps {
  jobId: string
}

// Address type enum matching server-side validation
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

export function JobLocationSection({ jobId }: JobLocationSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Fetch addresses for this job
  const addressesQuery = trpc.addresses.getByEntity.useQuery({
    entityType: 'job',
    entityId: jobId,
  })

  // Mutations
  const createMutation = trpc.addresses.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Address added successfully' })
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
      toast({ title: 'Address updated successfully' })
      utils.addresses.getByEntity.invalidate({ entityType: 'job', entityId: jobId })
      setEditingId(null)
    },
    onError: (error) => {
      toast({ title: 'Failed to update address', description: error.message, variant: 'error' })
    },
  })

  const deleteMutation = trpc.addresses.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Address removed successfully' })
      utils.addresses.getByEntity.invalidate({ entityType: 'job', entityId: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to remove address', description: error.message, variant: 'error' })
    },
  })

  // UI State
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form state
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

    // Validate ZIP code
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900">Job Location</h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Work sites and meeting locations for this position
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        )}
      </div>

      {/* Add New Address Form */}
      {isAdding && (
        <Card className="border-2 border-dashed border-hublot-200 bg-hublot-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address Type */}
            <div>
              <Label>Location Type</Label>
              <Select
                value={formData.addressType}
                onValueChange={(value) => setFormData({ ...formData, addressType: value })}
              >
                <SelectTrigger>
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
            </div>

            {/* Address Form */}
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
              showCounty
              validateOnBlur
            />

            {/* Options */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
                />
                <Label htmlFor="isPrimary" className="text-sm">Set as primary location</Label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Parking instructions, building access, etc..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAdding(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address List */}
      {addressesQuery.isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          </CardContent>
        </Card>
      ) : addresses.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <h3 className="font-medium text-charcoal-900 mb-1">No locations set</h3>
              <p className="text-sm text-charcoal-500 mb-4">
                Add work locations and meeting places for this job
              </p>
              <Button onClick={() => setIsAdding(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Location
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => {
            const isEditing = editingId === address.id
            const isDeleting = deleteConfirmId === address.id
            const typeInfo = ADDRESS_TYPE_OPTIONS.find(t => t.value === address.addressType)
            const TypeIcon = typeInfo?.icon || MapPin

            if (isEditing) {
              return (
                <Card key={address.id} className="border-2 border-hublot-500">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pencil className="w-4 h-4" />
                      Edit Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address Type */}
                    <div>
                      <Label>Location Type</Label>
                      <Select
                        value={formData.addressType}
                        onValueChange={(value) => setFormData({ ...formData, addressType: value })}
                      >
                        <SelectTrigger>
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
                    </div>

                    {/* Address Form */}
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
                      showCounty
                      validateOnBlur
                    />

                    {/* Options */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`isPrimary-${address.id}`}
                          checked={formData.isPrimary}
                          onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
                        />
                        <Label htmlFor={`isPrimary-${address.id}`} className="text-sm">Primary location</Label>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        placeholder="Parking instructions, building access, etc..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null)
                          resetForm()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleUpdate(address.id)} disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <Card key={address.id} className="group hover:border-charcoal-300 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      address.isPrimary ? 'bg-green-100 text-green-600' : 'bg-charcoal-100 text-charcoal-600'
                    )}>
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    {/* Address Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-charcoal-900">
                          {typeInfo?.label || 'Location'}
                        </span>
                        {address.isPrimary && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-charcoal-700">
                        {[address.addressLine1, address.addressLine2].filter(Boolean).join(', ') || 
                         `${address.city}, ${address.stateProvince}`}
                      </p>
                      <p className="text-sm text-charcoal-500">
                        {address.city}, {address.stateProvince} {address.postalCode}
                      </p>
                      {address.countryCode !== 'US' && (
                        <p className="text-xs text-charcoal-400 flex items-center gap-1 mt-1">
                          <Globe className="w-3 h-3" />
                          {address.countryCode}
                        </p>
                      )}
                      {address.notes && (
                        <p className="text-xs text-charcoal-500 mt-2 italic">{address.notes}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isDeleting ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(address.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
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
                            onClick={() => startEditing(address)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteConfirmId(address.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {addresses.length > 0 && (
        <Card className="bg-charcoal-50 border-charcoal-200">
          <CardContent className="py-3">
            <div className="flex items-center gap-4 text-sm text-charcoal-600">
              <span>{addresses.length} location{addresses.length !== 1 ? 's' : ''}</span>
              {addresses.some(a => a.isPrimary) && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Primary set
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}








