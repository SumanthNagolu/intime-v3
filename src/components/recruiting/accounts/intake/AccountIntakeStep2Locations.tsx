'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  useCreateAccountStore,
  AccountAddress,
} from '@/stores/create-account-store'
import { AddressForm } from '@/components/addresses/AddressForm'
import { Section } from './shared'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { MapPin, Plus, Pencil, Trash2, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const ADDRESS_TYPES = [
  { value: 'headquarters', label: 'Headquarters' },
  { value: 'billing', label: 'Billing Address' },
  { value: 'mailing', label: 'Mailing Address' },
  { value: 'office', label: 'Office / Branch' },
  { value: 'shipping', label: 'Shipping Address' },
]

export function AccountIntakeStep2Locations() {
  const { formData, addAddress, removeAddress, updateAddress } =
    useCreateAccountStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Local state for the form being edited
  const [currentAddress, setCurrentAddress] = useState<Partial<AccountAddress>>({
    type: 'office',
    country: 'US',
    isPrimary: false,
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setIsAddingNew(true)
    setCurrentAddress({
      id: uuidv4(),
      type: 'office',
      country: 'US',
      isPrimary: formData.addresses.length === 0,
    })
  }

  const handleOpenEdit = (address: AccountAddress) => {
    setIsAddingNew(false)
    setEditingId(address.id)
    setCurrentAddress({ ...address })
  }

  const handleClose = () => {
    setEditingId(null)
    setIsAddingNew(false)
    setCurrentAddress({
      type: 'office',
      country: 'US',
      isPrimary: false,
    })
  }

  const handleSave = () => {
    // Basic validation
    if (
      !currentAddress.addressLine1 ||
      !currentAddress.city ||
      !currentAddress.state ||
      !currentAddress.postalCode
    ) {
      return
    }

    if (editingId) {
      updateAddress(editingId, currentAddress)
    } else {
      addAddress({
        ...currentAddress,
        id: currentAddress.id || uuidv4(),
      } as AccountAddress)
    }
    handleClose()
  }

  const getTypeLabel = (type: string) =>
    ADDRESS_TYPES.find((t) => t.value === type)?.label || type

  const isPanelOpen = isAddingNew || editingId !== null

  return (
    <div className="space-y-6">
      <Section
        icon={MapPin}
        title="Locations & Addresses"
        subtitle="Manage all physical locations associated with this account"
      >
        <div className="flex gap-4">
          {/* List View */}
          <div
            className={cn(
              'flex-1 transition-all duration-300',
              isPanelOpen ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
            )}
          >
            {/* Add Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              className="mb-4 w-full border-dashed"
              disabled={isPanelOpen}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>

            {/* Table */}
            {formData.addresses.length > 0 ? (
              <div className="border border-charcoal-200 rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-charcoal-50/50">
                      <TableHead className="font-semibold text-charcoal-700">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700">
                        Address
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700 w-24">
                        Primary
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700 w-20">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.addresses.map((address) => (
                      <TableRow
                        key={address.id}
                        className={cn(
                          'group hover:bg-charcoal-50/50 cursor-pointer transition-colors',
                          editingId === address.id && 'bg-gold-50'
                        )}
                        onClick={() => handleOpenEdit(address)}
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize bg-charcoal-50 text-charcoal-600 border-charcoal-200"
                          >
                            {getTypeLabel(address.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-charcoal-700">
                          <div className="text-sm">
                            <span className="font-medium">
                              {address.addressLine1}
                            </span>
                            {address.addressLine2 && (
                              <span className="text-charcoal-500">
                                , {address.addressLine2}
                              </span>
                            )}
                            <span className="text-charcoal-500">
                              , {address.city}, {address.state}{' '}
                              {address.postalCode}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {address.isPrimary && (
                            <Badge className="bg-gold-100 text-gold-700 border-gold-200 hover:bg-gold-100">
                              Primary
                            </Badge>
                          )}
                        </TableCell>
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
                                removeAddress(address.id)
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200">
                <MapPin className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                <p className="text-sm text-charcoal-500 mb-1 font-medium">
                  No addresses added yet
                </p>
                <p className="text-xs text-charcoal-400">
                  Click the button above to add your first address
                </p>
              </div>
            )}
          </div>

          {/* Inline Detail Panel */}
          {isPanelOpen && (
            <div className="w-[380px] border border-charcoal-200 rounded-xl bg-white animate-in slide-in-from-right duration-300 flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-charcoal-200">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900">
                    {isAddingNew ? 'Add New Address' : 'Edit Address'}
                  </h3>
                  <p className="text-sm text-charcoal-500">
                    Enter the location details
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 text-charcoal-400 hover:text-charcoal-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address Type</Label>
                    <Select
                      value={currentAddress.type}
                      onValueChange={(v: AccountAddress['type']) =>
                        setCurrentAddress((prev) => ({ ...prev, type: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADDRESS_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end pb-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentAddress((prev) => ({
                          ...prev,
                          isPrimary: !prev.isPrimary,
                        }))
                      }
                      className={cn(
                        'flex items-center gap-2 text-sm font-medium transition-colors',
                        currentAddress.isPrimary
                          ? 'text-gold-600'
                          : 'text-charcoal-500 hover:text-charcoal-700'
                      )}
                    >
                      <CheckCircle2
                        className={cn(
                          'w-5 h-5',
                          currentAddress.isPrimary
                            ? 'fill-gold-100'
                            : 'text-charcoal-300'
                        )}
                      />
                      Primary
                    </button>
                  </div>
                </div>

                <AddressForm
                  value={{
                    addressLine1: currentAddress.addressLine1,
                    addressLine2: currentAddress.addressLine2,
                    city: currentAddress.city,
                    stateProvince: currentAddress.state,
                    postalCode: currentAddress.postalCode,
                    countryCode: currentAddress.country,
                  }}
                  onChange={(data) =>
                    setCurrentAddress((prev) => ({
                      ...prev,
                      ...data,
                      state:
                        data.stateProvince !== undefined
                          ? data.stateProvince
                          : prev.state,
                      country:
                        data.countryCode !== undefined
                          ? data.countryCode
                          : prev.country,
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
                  onClick={handleSave}
                  className="bg-gold-500 hover:bg-gold-600 text-white border-none"
                >
                  {isAddingNew ? 'Add Address' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

