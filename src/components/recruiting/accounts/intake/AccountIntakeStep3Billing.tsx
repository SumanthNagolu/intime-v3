'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddressForm } from '@/components/addresses/AddressForm'
import {
  useCreateAccountStore,
  BILLING_FREQUENCIES,
  PAYMENT_TERMS,
  AccountAddress,
} from '@/stores/create-account-store'
import { Section, FieldGroup } from './shared'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  Building2,
  Mail,
  Calendar,
  FileCheck,
  CheckCircle2,
  Banknote,
  Receipt,
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const BILLING_ADDRESS_TYPES = [
  { value: 'billing', label: 'Billing Address' },
  { value: 'headquarters', label: 'Headquarters (Use for Billing)' },
]

export function AccountIntakeStep3Billing() {
  const { formData, setFormData, addAddress, removeAddress, updateAddress } =
    useCreateAccountStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<Partial<AccountAddress>>({
    type: 'billing',
    country: 'US',
    isPrimary: false,
  })

  // Filter billing addresses from the list
  const billingAddresses = formData.addresses.filter(
    (a) => a.type === 'billing' || a.type === 'headquarters'
  )

  const handleOpenAdd = () => {
    setEditingId(null)
    setIsAddingNew(true)
    setCurrentAddress({
      id: uuidv4(),
      type: 'billing',
      country: 'US',
      isPrimary: billingAddresses.length === 0,
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
      type: 'billing',
      country: 'US',
      isPrimary: false,
    })
  }

  const handleSave = () => {
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

  const isPanelOpen = isAddingNew || editingId !== null

  return (
    <div className="space-y-10">
      {/* Billing Entity Section */}
      <Section
        icon={Building2}
        title="Billing Entity"
        subtitle="Legal entity details for invoicing"
      >
        <div className="space-y-2">
          <Label htmlFor="billingEntityName" className="text-charcoal-700 font-medium">
            Legal Billing Entity Name
          </Label>
          <Input
            id="billingEntityName"
            value={formData.billingEntityName}
            onChange={(e) => setFormData({ billingEntityName: e.target.value })}
            placeholder="Legal name as it should appear on invoices"
            className="h-12 rounded-xl border-charcoal-200 bg-white"
          />
        </div>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="billingEmail" className="text-charcoal-700 font-medium">
              Billing Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                id="billingEmail"
                type="email"
                value={formData.billingEmail}
                onChange={(e) => setFormData({ billingEmail: e.target.value })}
                placeholder="ap@company.com"
                className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <PhoneInput
              label="Billing Phone"
              value={formData.billingPhone}
              onChange={(billingPhone) => setFormData({ billingPhone })}
            />
          </div>
        </FieldGroup>
      </Section>

      {/* Billing Address Section with Inline Panel */}
      <Section
        icon={MapPin}
        title="Billing Addresses"
        subtitle="Addresses used for invoicing and billing"
      >
        <div className="flex flex-col gap-4">
          {/* List View */}
          <div className="w-full transition-all duration-300">
            {/* Add Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              className="mb-4 w-full border-dashed"
              disabled={isPanelOpen}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Billing Address
            </Button>

            {/* Table */}
            {billingAddresses.length > 0 ? (
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
                      <TableHead className="font-semibold text-charcoal-700 w-20">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingAddresses.map((address) => (
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
                            {address.type === 'billing'
                              ? 'Billing'
                              : 'Headquarters'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-charcoal-700">
                          <div className="text-sm">
                            <span className="font-medium">
                              {address.addressLine1}
                            </span>
                            <span className="text-charcoal-500">
                              , {address.city}, {address.state}{' '}
                              {address.postalCode}
                            </span>
                          </div>
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
              <div className="text-center py-10 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200">
                <MapPin className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                <p className="text-sm text-charcoal-500 font-medium">
                  No billing addresses added yet
                </p>
                <p className="text-xs text-charcoal-400 mt-1">
                  You can also use addresses from the Locations step
                </p>
              </div>
            )}
          </div>

          {/* Inline Detail Panel - Full Width Bottom */}
          {isPanelOpen && (
            <div className="w-full border border-charcoal-200 rounded-xl bg-white animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between p-4 border-b border-charcoal-200">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900">
                    {isAddingNew ? 'Add Billing Address' : 'Edit Address'}
                  </h3>
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

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        {BILLING_ADDRESS_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

      {/* Payment Configuration */}
      <Section
        icon={CreditCard}
        title="Payment Configuration"
        subtitle="Invoice and payment terms"
      >
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">
              <Calendar className="w-4 h-4 inline-block mr-1.5 text-charcoal-400" />
              Billing Frequency
            </Label>
            <Select
              value={formData.billingFrequency}
              onValueChange={(v) =>
                setFormData({
                  billingFrequency: v as typeof formData.billingFrequency,
                })
              }
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {BILLING_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">
              <CreditCard className="w-4 h-4 inline-block mr-1.5 text-charcoal-400" />
              Payment Terms
            </Label>
            <Select
              value={formData.paymentTermsDays}
              onValueChange={(v) => setFormData({ paymentTermsDays: v })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select terms" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS.map((term) => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FieldGroup>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-charcoal-700 font-medium">
              <Banknote className="w-4 h-4 inline-block mr-1.5 text-charcoal-400" />
              Default Currency
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(v) => setFormData({ currency: v })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceFormat" className="text-charcoal-700 font-medium">
              <Receipt className="w-4 h-4 inline-block mr-1.5 text-charcoal-400" />
              Invoice Format
            </Label>
            <Select
              value={formData.invoiceFormat}
              onValueChange={(v) => setFormData({ invoiceFormat: v })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Detailed</SelectItem>
                <SelectItem value="consolidated">Consolidated</SelectItem>
                <SelectItem value="summary">Summary Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldGroup>
      </Section>

      {/* PO Required Section */}
      <Section icon={FileCheck} title="Purchase Order Requirements">
        <label
          className={cn(
            'flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300',
            formData.poRequired
              ? 'border-gold-400 bg-gradient-to-r from-gold-50 to-amber-50 shadow-gold-glow'
              : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
          )}
        >
          <Checkbox
            checked={formData.poRequired}
            onCheckedChange={(checked) => setFormData({ poRequired: !!checked })}
            className={cn(
              'w-5 h-5 border-2 transition-colors',
              formData.poRequired
                ? 'border-gold-500 data-[state=checked]:bg-gold-500'
                : 'border-charcoal-300'
            )}
          />
          <div className="flex-1">
            <span
              className={cn(
                'text-sm font-semibold block',
                formData.poRequired ? 'text-gold-700' : 'text-charcoal-700'
              )}
            >
              Purchase Order Required
            </span>
            <span className="text-xs text-charcoal-500 block mt-0.5">
              Client requires a PO number before invoicing can begin
            </span>
          </div>
          {formData.poRequired && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
        </label>

        {formData.poRequired && (
          <div className="animate-fade-in pt-4">
            <FieldGroup cols={2}>
              <div className="space-y-2">
                <Label htmlFor="currentPoNumber" className="text-charcoal-700 font-medium">
                  Current PO Number
                </Label>
                <Input
                  id="currentPoNumber"
                  value={formData.currentPoNumber}
                  onChange={(e) => setFormData({ currentPoNumber: e.target.value })}
                  className="h-12 rounded-xl border-charcoal-200 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poExpiration" className="text-charcoal-700 font-medium">
                  PO Expiration Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <Input
                    id="poExpiration"
                    type="date"
                    className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
                    value={formData.poExpirationDate || ''}
                    onChange={(e) => setFormData({ poExpirationDate: e.target.value })}
                  />
                </div>
              </div>
            </FieldGroup>
          </div>
        )}
      </Section>
    </div>
  )
}

