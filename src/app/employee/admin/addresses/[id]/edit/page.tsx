'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Building2, User, Briefcase, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/client'
import { AddressForm, ADDRESS_TYPES } from '@/components/addresses'

const ENTITY_TYPES = [
  { value: 'account', label: 'Account', icon: Building2 },
  { value: 'contact', label: 'Contact', icon: User },
  { value: 'job', label: 'Job', icon: Briefcase },
  { value: 'candidate', label: 'Candidate', icon: User },
  { value: 'employee', label: 'Employee', icon: Users },
  { value: 'vendor', label: 'Vendor', icon: Building2 },
  { value: 'lead', label: 'Lead', icon: User },
  { value: 'interview', label: 'Interview', icon: User },
  { value: 'placement', label: 'Placement', icon: Briefcase },
]

interface FormData {
  entityType: string
  entityId: string
  addressType: string
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

export default function EditAddressPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const addressId = params.id as string

  const [formData, setFormData] = useState<FormData>({
    entityType: '',
    entityId: '',
    addressType: 'current',
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

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch existing address data
  const addressQuery = trpc.addresses.getById.useQuery({ id: addressId })
  const address = addressQuery.data

  // Populate form when data loads
  useEffect(() => {
    if (address) {
      setFormData({
        entityType: address.entityType,
        entityId: address.entityId,
        addressType: address.addressType,
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        stateProvince: address.stateProvince || '',
        postalCode: address.postalCode || '',
        countryCode: address.countryCode,
        county: address.county || '',
        isPrimary: address.isPrimary,
        notes: address.notes || '',
      })
    }
  }, [address])

  // Update mutation
  const updateMutation = trpc.addresses.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Address updated successfully' })
      router.push(`/employee/admin/addresses/${addressId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error updating address',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleFormDataChange = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.city) {
      newErrors.city = 'City is required'
    }
    if (!formData.stateProvince) {
      newErrors.stateProvince = 'State is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    updateMutation.mutate({
      id: addressId,
      addressType: formData.addressType as
        | 'current'
        | 'permanent'
        | 'mailing'
        | 'work'
        | 'billing'
        | 'shipping'
        | 'headquarters'
        | 'office'
        | 'job_location'
        | 'meeting'
        | 'first_day',
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

  const handleCancel = () => {
    router.push(`/employee/admin/addresses/${addressId}`)
  }

  if (addressQuery.isLoading) {
    return (
      <div className="p-6 max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!address) {
    return (
      <div className="p-6">
        <p className="text-charcoal-500">Address not found</p>
        <Link href="/employee/admin/addresses">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Addresses
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/employee/admin/addresses/${addressId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
            Edit Address
          </h1>
          <p className="text-charcoal-500">Update address details</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Entity Info (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Linked Entity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-charcoal-500">Entity Type</Label>
                <div className="flex items-center gap-2 mt-1 p-2 bg-charcoal-50 rounded-md">
                  {(() => {
                    const entityConfig = ENTITY_TYPES.find(
                      (t) => t.value === formData.entityType
                    )
                    const Icon = entityConfig?.icon || Building2
                    return (
                      <>
                        <Icon className="w-4 h-4 text-charcoal-500" />
                        <span className="text-charcoal-900">
                          {entityConfig?.label || formData.entityType}
                        </span>
                      </>
                    )
                  })()}
                </div>
                <p className="text-xs text-charcoal-400 mt-1">
                  Entity linking cannot be changed
                </p>
              </div>

              <div>
                <Label className="text-charcoal-500">Entity ID</Label>
                <div className="mt-1 p-2 bg-charcoal-50 rounded-md font-mono text-sm text-charcoal-600">
                  {formData.entityId.slice(0, 8)}...
                </div>
              </div>
            </div>

            <div>
              <Label>Address Type</Label>
              <Select
                value={formData.addressType}
                onValueChange={(value) =>
                  handleFormDataChange({ addressType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  {ADDRESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Address Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address Details
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              onChange={(data) => handleFormDataChange(data)}
              errors={errors}
              required
              showCounty
            />
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Set as Primary Address</Label>
                <p className="text-sm text-charcoal-500">
                  This will be the main address for the entity
                </p>
              </div>
              <Switch
                checked={formData.isPrimary}
                onCheckedChange={(checked) =>
                  handleFormDataChange({ isPrimary: checked })
                }
              />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Any additional notes about this address..."
                value={formData.notes}
                onChange={(e) => handleFormDataChange({ notes: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
