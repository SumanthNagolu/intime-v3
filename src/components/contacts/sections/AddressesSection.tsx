'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Trash2, Star } from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import { ADDRESS_TYPES } from '@/lib/contacts/constants'
import type { SectionMode, AddressesSectionData, ContactAddress } from '@/lib/contacts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface AddressesSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: AddressesSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler for adding a new address */
  onAddAddress?: () => void
  /** Handler for removing an address */
  onRemoveAddress?: (id: string) => void
  /** Handler for setting primary address */
  onSetPrimary?: (id: string) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * AddressesSection - Multiple addresses management
 *
 * Handles home, work, and mailing addresses with primary designation.
 */
export function AddressesSection({
  mode,
  data,
  onChange,
  onAddAddress,
  onRemoveAddress,
  onSetPrimary,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: AddressesSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const handleAddAddress = () => {
    if (onAddAddress) {
      onAddAddress()
    } else {
      // Default: add new address to array
      const newAddress: ContactAddress = {
        id: crypto.randomUUID(),
        type: 'home',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        isPrimary: data.addresses.length === 0,
      }
      onChange?.('addresses', [...data.addresses, newAddress])
    }
  }

  const handleRemoveAddress = (id: string) => {
    if (onRemoveAddress) {
      onRemoveAddress(id)
    } else {
      onChange?.('addresses', data.addresses.filter(a => a.id !== id))
    }
  }

  const handleSetPrimary = (id: string) => {
    if (onSetPrimary) {
      onSetPrimary(id)
    } else {
      const updated = data.addresses.map(a => ({
        ...a,
        isPrimary: a.id === id,
      }))
      onChange?.('addresses', updated)
    }
  }

  const handleAddressChange = (id: string, field: string, value: unknown) => {
    const updated = data.addresses.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    )
    onChange?.('addresses', updated)
  }

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Suppress unused var warning
  void errors

  // Convert constants to option format
  const typeOptions = ADDRESS_TYPES.map(t => ({ value: t.value, label: t.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Addresses"
          subtitle="Home, work, and mailing addresses"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Address Cards */}
      <div className="space-y-4">
        {data.addresses.length === 0 ? (
          <Card className="shadow-elevation-sm">
            <CardContent className="py-12 text-center">
              <MapPin className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
              <p className="text-charcoal-500 mb-4">No addresses added yet</p>
              {isEditable && (
                <Button variant="outline" onClick={handleAddAddress}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          data.addresses.map((address, index) => (
            <Card key={address.id} className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-base font-heading">
                      {ADDRESS_TYPES.find(t => t.value === address.type)?.label || 'Address'} {index + 1}
                    </CardTitle>
                    {address.isPrimary && (
                      <Badge variant="success" className="gap-1">
                        <Star className="w-3 h-3" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  {isEditable && (
                    <div className="flex items-center gap-2">
                      {!address.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(address.id)}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                        onClick={() => handleRemoveAddress(address.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UnifiedField
                    label="Address Type"
                    type="select"
                    options={typeOptions}
                    value={address.type}
                    onChange={(v) => handleAddressChange(address.id, 'type', v)}
                    editable={isEditable}
                  />
                  <UnifiedField
                    label="Country"
                    value={address.country}
                    onChange={(v) => handleAddressChange(address.id, 'country', v)}
                    editable={isEditable}
                    placeholder="US"
                  />
                </div>
                <UnifiedField
                  label="Address Line 1"
                  value={address.addressLine1}
                  onChange={(v) => handleAddressChange(address.id, 'addressLine1', v)}
                  editable={isEditable}
                  placeholder="123 Main Street"
                />
                <UnifiedField
                  label="Address Line 2"
                  value={address.addressLine2}
                  onChange={(v) => handleAddressChange(address.id, 'addressLine2', v)}
                  editable={isEditable}
                  placeholder="Apt 4B"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UnifiedField
                    label="City"
                    value={address.city}
                    onChange={(v) => handleAddressChange(address.id, 'city', v)}
                    editable={isEditable}
                    placeholder="New York"
                  />
                  <UnifiedField
                    label="State / Province"
                    value={address.state}
                    onChange={(v) => handleAddressChange(address.id, 'state', v)}
                    editable={isEditable}
                    placeholder="NY"
                  />
                  <UnifiedField
                    label="Postal Code"
                    value={address.postalCode}
                    onChange={(v) => handleAddressChange(address.id, 'postalCode', v)}
                    editable={isEditable}
                    placeholder="10001"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Add Address Button */}
        {isEditable && data.addresses.length > 0 && (
          <Button variant="outline" onClick={handleAddAddress} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Address
          </Button>
        )}
      </div>
    </div>
  )
}

export default AddressesSection
