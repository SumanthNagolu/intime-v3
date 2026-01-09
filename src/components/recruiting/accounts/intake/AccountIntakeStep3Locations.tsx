'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  useCreateAccountStore,
  AccountAddress
} from '@/stores/create-account-store'
import { AddressForm } from '@/components/addresses/AddressForm'
import { Section } from './shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { MapPin, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const ADDRESS_TYPES = [
  { value: 'headquarters', label: 'Headquarters' },
  { value: 'billing', label: 'Billing Address' },
  { value: 'mailing', label: 'Mailing Address' },
  { value: 'office', label: 'Office / Branch' },
  { value: 'shipping', label: 'Shipping Address' },
]

export function AccountIntakeStep3Locations() {
  const { formData, addAddress, removeAddress, updateAddress } =
    useCreateAccountStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Local state for the form being edited
  const [currentAddress, setCurrentAddress] = useState<Partial<AccountAddress>>({
    type: 'office',
    country: 'US',
    isPrimary: false,
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setCurrentAddress({
      id: uuidv4(),
      type: 'office',
      country: 'US',
      isPrimary: formData.addresses.length === 0, // Default to primary if first address
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (address: AccountAddress) => {
    setEditingId(address.id)
    setCurrentAddress({ ...address })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    // Basic validation
    if (
      !currentAddress.addressLine1 ||
      !currentAddress.city ||
      !currentAddress.state ||
      !currentAddress.postalCode
    ) {
      // Allow AddressForm to handle validation if I passed errors props,
      // but here I'll just check required fields simply or trust the user for now
      // Ideally I'd trigger validation in the form
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
    setIsDialogOpen(false)
  }

  // Determine label for address type
  const getTypeLabel = (type: string) =>
    ADDRESS_TYPES.find((t) => t.value === type)?.label || type

  return (
    <div className="space-y-10">
      <Section
        icon={MapPin}
        title="Locations & Addresses"
        subtitle="Manage all physical locations associated with this account"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.addresses.map((address) => (
            <div
              key={address.id}
              className="group relative p-5 rounded-xl border border-charcoal-200 bg-white hover:border-charcoal-300 transition-all hover:shadow-elevation-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="capitalize bg-charcoal-50 text-charcoal-600 border-charcoal-200"
                  >
                    {getTypeLabel(address.type)}
                  </Badge>
                  {address.isPrimary && (
                    <Badge className="bg-gold-100 text-gold-700 border-gold-200 hover:bg-gold-100">
                      Primary
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-charcoal-400 hover:text-charcoal-600"
                    onClick={() => handleOpenEdit(address)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => removeAddress(address.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-charcoal-600 space-y-1">
                <p className="font-medium text-charcoal-900">
                  {address.addressLine1}
                </p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-charcoal-400">{address.country}</p>
              </div>
            </div>
          ))}

          {/* Add New Button Card */}
          <button
            onClick={handleOpenAdd}
            className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-charcoal-200 bg-charcoal-50/50 hover:bg-white hover:border-gold-300 transition-all min-h-[160px] group"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-charcoal-200 flex items-center justify-center mb-3 group-hover:border-gold-300 group-hover:text-gold-500 transition-colors shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-medium text-charcoal-600 group-hover:text-charcoal-900">
              Add Another Address
            </span>
          </button>
        </div>
      </Section>

      {/* Address Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              Enter the location details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address Type</Label>
                <Select
                  value={currentAddress.type}
                  onValueChange={(v: any) =>
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
              <div className="flex items-center pt-8">
                 <button
                  type="button"
                  onClick={() => setCurrentAddress(prev => ({ ...prev, isPrimary: !prev.isPrimary }))}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    currentAddress.isPrimary ? "text-gold-600" : "text-charcoal-500 hover:text-charcoal-700"
                  )}
                 >
                   <CheckCircle2 className={cn("w-5 h-5", currentAddress.isPrimary ? "fill-gold-100" : "text-charcoal-300")} />
                   Set as primary address
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
                  state: data.stateProvince !== undefined ? data.stateProvince : prev.state,
                  country: data.countryCode !== undefined ? data.countryCode : prev.country,
                }))
              }
              required
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gold-500 hover:bg-gold-600 text-white border-none">
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




