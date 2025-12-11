'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, X, Building2, User, Briefcase, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { useCreateAddressStore } from '@/stores/create-address-store'

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

export default function NewAddressPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get pre-filled entity from URL params (when coming from entity detail page)
  const prefilledEntityType = searchParams.get('entityType')
  const prefilledEntityId = searchParams.get('entityId')

  const { formData, setFormData, resetForm, lastSaved, initializeForEntity } =
    useCreateAddressStore()

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize from URL params if present
  useEffect(() => {
    if (prefilledEntityType && prefilledEntityId) {
      initializeForEntity(prefilledEntityType, prefilledEntityId)
    }
  }, [prefilledEntityType, prefilledEntityId, initializeForEntity])

  // Create mutation
  const createMutation = trpc.addresses.create.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Address created successfully' })
      resetForm()
      router.push(`/employee/admin/addresses/${data.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error creating address',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.entityType) {
      newErrors.entityType = 'Entity type is required'
    }
    if (!formData.entityId) {
      newErrors.entityId = 'Entity ID is required'
    }
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

    createMutation.mutate({
      entityType: formData.entityType as
        | 'candidate'
        | 'account'
        | 'contact'
        | 'vendor'
        | 'organization'
        | 'lead'
        | 'job'
        | 'interview'
        | 'employee'
        | 'placement',
      entityId: formData.entityId,
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
    router.push('/employee/admin/addresses')
  }

  const handleDiscardDraft = () => {
    resetForm()
    toast({ title: 'Draft discarded' })
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/employee/admin/addresses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
            Add New Address
          </h1>
          <p className="text-charcoal-500">Create a new address for an entity</p>
        </div>
      </div>

      {/* Draft Recovery Banner */}
      {lastSaved && !prefilledEntityType && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            Draft saved {new Date(lastSaved).toLocaleString()}
          </span>
          <button
            onClick={handleDiscardDraft}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Discard draft
          </button>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Entity Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Link to Entity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Entity Type *</Label>
                <Select
                  value={formData.entityType}
                  onValueChange={(value) => setFormData({ entityType: value })}
                  disabled={!!prefilledEntityType}
                >
                  <SelectTrigger
                    className={errors.entityType ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.entityType && (
                  <p className="text-sm text-red-500 mt-1">{errors.entityType}</p>
                )}
              </div>

              <div>
                <Label>Entity ID *</Label>
                <Input
                  placeholder="UUID of the entity"
                  value={formData.entityId}
                  onChange={(e) => setFormData({ entityId: e.target.value })}
                  disabled={!!prefilledEntityId}
                  className={errors.entityId ? 'border-red-500' : ''}
                />
                {errors.entityId && (
                  <p className="text-sm text-red-500 mt-1">{errors.entityId}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Address Type</Label>
              <Select
                value={formData.addressType}
                onValueChange={(value) => setFormData({ addressType: value })}
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
              onChange={(data) => setFormData(data)}
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
                onCheckedChange={(checked) => setFormData({ isPrimary: checked })}
              />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Any additional notes about this address..."
                value={formData.notes}
                onChange={(e) => setFormData({ notes: e.target.value })}
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
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Address'}
          </Button>
        </div>
      </div>
    </div>
  )
}
