'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
} from 'lucide-react'
import { AddressForm, type AddressFormData } from '@/components/addresses'
import { SectionHeader } from '../fields/SectionHeader'
import { ADDRESS_TYPES, getLabel } from '@/lib/accounts/constants'
import type { SectionMode, AccountAddress, LocationsSectionData } from '@/lib/accounts/types'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

// ============ PROPS ============

interface LocationsSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: LocationsSectionData
  /** Handler for adding an address */
  onAddAddress?: (address: AccountAddress) => void
  /** Handler for updating an address */
  onUpdateAddress?: (id: string, address: Partial<AccountAddress>) => void
  /** Handler for removing an address */
  onRemoveAddress?: (id: string) => void
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

const DEFAULT_ADDRESS: Partial<AccountAddress> = {
  type: 'office',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  isPrimary: false,
}

/**
 * LocationsSection - Unified component for Locations/Addresses
 *
 * Guidewire PCH Architecture:
 * - Same card-based layout in all modes (create, view, edit)
 * - Consistent table structure across wizard and detail view
 * - Mode determines editability, not layout
 */
export function LocationsSection({
  mode,
  data,
  onAddAddress,
  onUpdateAddress,
  onRemoveAddress,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: LocationsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = React.useState(false)
  const [currentAddress, setCurrentAddress] = React.useState<Partial<AccountAddress>>(DEFAULT_ADDRESS)

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const isPanelOpen = isAddingNew || editingId !== null
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const handleSectionSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleSectionCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    setIsAddingNew(true)
    setCurrentAddress({
      ...DEFAULT_ADDRESS,
      id: uuidv4(),
      isPrimary: data.addresses.length === 0,
    })
  }

  const handleOpenEdit = (address: AccountAddress) => {
    if (!isEditable) return
    setIsAddingNew(false)
    setEditingId(address.id)
    setCurrentAddress({ ...address })
  }

  const handleClose = () => {
    setEditingId(null)
    setIsAddingNew(false)
    setCurrentAddress(DEFAULT_ADDRESS)
  }

  const handleAddressSave = () => {
    if (!currentAddress.addressLine1 || !currentAddress.city || !currentAddress.state) {
      return
    }

    if (editingId) {
      onUpdateAddress?.(editingId, currentAddress)
    } else {
      onAddAddress?.({
        ...currentAddress,
        id: currentAddress.id || uuidv4(),
      } as AccountAddress)
    }
    handleClose()
  }

  const handleDelete = (id: string) => {
    onRemoveAddress?.(id)
    if (editingId === id) {
      handleClose()
    }
  }

  const getTypeLabel = (type: string) => {
    return getLabel(ADDRESS_TYPES, type) || type
  }

  const getTypeIcon = (type: string) => {
    const typeInfo = ADDRESS_TYPES.find((t) => t.value === type)
    return typeInfo?.icon || '📍'
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Locations"
          subtitle={`Office addresses and locations (${data.addresses.length})`}
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSectionSave}
          onCancel={handleSectionCancel}
          isSaving={isSaving}
        />
      )}

      {/* Locations Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Office Locations</CardTitle>
            </div>
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAdd}
                className="gap-1.5"
                disabled={isPanelOpen}
              >
                <Plus className="w-4 h-4" />
                Add Address
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address Table */}
          {data.addresses.length > 0 ? (
            <div className="border border-charcoal-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-charcoal-50/50">
                    <TableHead className="font-semibold text-charcoal-700">Type</TableHead>
                    <TableHead className="font-semibold text-charcoal-700">Address</TableHead>
                    <TableHead className="font-semibold text-charcoal-700 w-24">Primary</TableHead>
                    {isEditable && (
                      <TableHead className="font-semibold text-charcoal-700 w-20">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.addresses.map((address) => (
                    <TableRow
                      key={address.id}
                      className={cn(
                        'group transition-colors',
                        isEditable && 'hover:bg-charcoal-50/50 cursor-pointer',
                        editingId === address.id && 'bg-gold-50'
                      )}
                      onClick={() => handleOpenEdit(address)}
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize bg-charcoal-50 text-charcoal-600 border-charcoal-200"
                        >
                          {getTypeIcon(address.type)} {getTypeLabel(address.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-charcoal-600">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                        <br />
                        <span className="text-charcoal-500">
                          {address.city}, {address.state} {address.postalCode}
                        </span>
                      </TableCell>
                      <TableCell>
                        {address.isPrimary && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                            Primary
                          </Badge>
                        )}
                      </TableCell>
                      {isEditable && (
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-charcoal-400 hover:text-charcoal-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenEdit(address)
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(address.id)
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-charcoal-50/50 rounded-lg border border-dashed border-charcoal-200">
              <MapPin className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500 mb-1 font-medium">No addresses added yet</p>
              <p className="text-xs text-charcoal-400 mb-4">
                {isEditable
                  ? 'Click "Add Address" to add your first location'
                  : 'No locations have been added to this account'}
              </p>
              {isEditable && (
                <Button variant="outline" size="sm" onClick={handleOpenAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              )}
            </div>
          )}

          {/* Inline Edit Panel */}
          {isPanelOpen && (
            <div className="w-full border border-charcoal-200 rounded-lg bg-white animate-in slide-in-from-bottom duration-300">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-charcoal-200">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900">
                    {isAddingNew ? 'Add New Address' : 'Edit Address'}
                  </h3>
                  <p className="text-sm text-charcoal-500">Enter the location details</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Panel Content */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address Type</Label>
                    <Select
                      value={currentAddress.type}
                      onValueChange={(v) =>
                        setCurrentAddress((prev) => ({
                          ...prev,
                          type: v as AccountAddress['type'],
                        }))
                      }
                    >
                      <SelectTrigger className="h-11 rounded-lg">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ADDRESS_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 h-11 px-3 rounded-lg border border-charcoal-200 cursor-pointer hover:bg-charcoal-50">
                      <Checkbox
                        checked={currentAddress.isPrimary}
                        onCheckedChange={(checked) =>
                          setCurrentAddress((prev) => ({ ...prev, isPrimary: !!checked }))
                        }
                      />
                      <span className="text-sm">Primary Address</span>
                    </label>
                  </div>
                </div>

                <AddressForm
                  value={{
                    addressLine1: currentAddress.addressLine1 || '',
                    addressLine2: currentAddress.addressLine2 || '',
                    city: currentAddress.city || '',
                    stateProvince: currentAddress.state || '',
                    postalCode: currentAddress.postalCode || '',
                    countryCode: currentAddress.country || 'US',
                  }}
                  onChange={(formData: Partial<AddressFormData>) =>
                    setCurrentAddress((prev) => ({
                      ...prev,
                      addressLine1: formData.addressLine1 ?? prev.addressLine1,
                      addressLine2: formData.addressLine2 ?? prev.addressLine2,
                      city: formData.city ?? prev.city,
                      state: formData.stateProvince ?? prev.state,
                      postalCode: formData.postalCode ?? prev.postalCode,
                      country: formData.countryCode ?? prev.country,
                    }))
                  }
                  required
                />
              </div>

              {/* Panel Footer */}
              <div className="flex items-center justify-end gap-2 p-4 border-t border-charcoal-200">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddressSave}
                  className="bg-gold-500 hover:bg-gold-600 text-white border-none"
                >
                  {isAddingNew ? 'Add Address' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LocationsSection
